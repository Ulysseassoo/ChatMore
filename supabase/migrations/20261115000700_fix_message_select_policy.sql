-- =============================================================================
-- Correctif : relire un message juste après l'avoir inséré (insert … returning).
-- L'ancienne règle appelait can_see_message(id), qui recherche la ligne en base :
-- dans la même requête que l'insert, la nouvelle ligne n'est pas encore visible
-- pour cette recherche, et l'envoi était refusé (403). La règle utilise maintenant
-- directement les colonnes de la ligne.
-- =============================================================================

drop policy "members read visible messages" on public.messages;

create policy "members read visible messages"
  on public.messages for select to authenticated
  using (
    public.is_room_member(room_id)
    and created_at >= public.my_joined_at(room_id)
    and (not is_blocked or user_id = (select auth.uid()))
    and not exists (
      select 1 from public.hidden_messages h
      where h.message_id = id and h.user_id = (select auth.uid())
    )
  );
