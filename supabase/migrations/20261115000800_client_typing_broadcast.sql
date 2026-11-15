-- =============================================================================
-- « écrit… » par diffusion (broadcast) plutôt que par la présence.
-- Realtime limite la présence à 5 mises à jour par 30 s et par client : trop peu
-- pour l'indicateur de saisie. Les membres peuvent donc diffuser sur le channel de
-- leur conversation. En contrepartie, le front ne fait jamais confiance au contenu
-- d'un événement : il relit les données en base (à travers la RLS).
-- =============================================================================

drop policy "members share presence in their rooms" on realtime.messages;

create policy "members share presence and typing in their rooms"
  on realtime.messages for insert to authenticated
  with check (
    realtime.messages.extension in ('presence', 'broadcast')
    and public.can_track_presence((select realtime.topic()))
  );
