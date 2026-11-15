# ChatMore

Messagerie temps réel (React + TypeScript + Vite, Supabase). Interface en français, thème unique « Ambre nuit ».

## Commandes

| Commande | Rôle |
| --- | --- |
| `yarn db:start` / `yarn db:stop` | Supabase local (Docker requis) |
| `yarn db:reset` | Recrée la base locale : migrations puis `supabase/seed.sql` |
| `yarn db:test` | Tests pgTAP (`supabase/tests`) |
| `yarn db:types` | Régénère `src/lib/database.types.ts` (à lancer après toute migration) |
| `yarn dev` | Front sur http://localhost:5173 (`.env.local` depuis `.env.example`) |
| `yarn lint` / `yarn typecheck` / `yarn build` | Vérifications du front |
| `yarn test:e2e` | Playwright contre le Supabase local (Mailpit pour les e-mails) |
| `yarn push:keys` | Clés VAPID locales (`supabase/.env`, `.env.local`) ; relancer `db:start` ensuite |

Comptes de démo : `demo@chatmore.local`, `lea@…`, `karim@…`, `ines@…`, `thomas@…`, mot de passe `chatmore2026`.

## Base de données (`supabase/`)

- Toute modification = une nouvelle migration. Ne jamais modifier une migration déjà déployée.
- RLS activée sur toutes les tables ; on n'ouvre que le nécessaire, par opération et par colonne.
- Les écritures sensibles passent par des RPC `security definer` avec `set search_path = ''` et des noms entièrement qualifiés.
- `messages.is_blocked` n'est jamais lisible par les utilisateurs : toujours lister les colonnes, jamais `select *`.
- Les données temps réel sont diffusées par la base (triggers → `realtime.send`) sur des channels privés `room:<id>` et `user:<uuid>`. Les clients n'y émettent que la présence et « écrit… ».
- Chaque nouvelle règle de sécurité s'accompagne d'un test pgTAP.
- Notifications push : trigger `messages_request_push` → `pg_net` → Edge Function `send-push` (Web Push sans dépendance, `supabase/functions/send-push/webpush.ts`). URL et secret dans Vault (`push_function_url`, `push_webhook_secret`).

## Front (`src/`)

- Organisation par fonctionnalité dans `src/features/*` ; partagé dans `src/components` et `src/lib`.
- Seuls `features/*/api.ts` et `features/*/realtime.ts` importent `@/lib/supabase` (règle ESLint). Ces fichiers lèvent les erreurs, ils ne les avalent pas.
- Données serveur : TanStack Query. Zustand uniquement pour l'état d'interface ou propre à l'appareil.
- Un événement temps réel est une notification : relire la donnée en base plutôt que faire confiance à la charge utile.
- Mises à jour du cache de messages idempotentes (dédoublonnage par `id` ou `client_id`), voir `features/chat/cache.ts`.
- Hors ligne : cache TanStack persisté (`lib/queryClient.ts`, effacé à la déconnexion), renvoi automatique des messages en échec (`features/chat/outbox.ts`), service worker `src/sw.ts` (pré-cache + push).
- Tout ce qu'on veut retrouver avec « Retour », recharger ou partager vit dans l'URL ; les redirections d'auth sont décidées uniquement par `PublicLayout` / `ProtectedLayout`.
- On stocke la source, on calcule le reste à l'affichage (groupes de bulles, séparateurs, non-lus).
- Accessibilité : vrais `button`/`a`/`label`, `aria-label` sur les boutons icône, jamais la couleur seule pour un état, cibles de 44 px.

## Conventions

- Tabulations, guillemets doubles, largeur 120 (Prettier).
- Commentaires rares : seulement pour expliquer un choix non évident, jamais pour paraphraser le code.
- Textes d'interface en français, tutoiement.
