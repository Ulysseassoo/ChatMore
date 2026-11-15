# ChatMore

This project is a chatapp made in React with Typescript. The ultimate goal of this project was to discover Typescript and use Redux/Zustand. Also use and discover Supabase, as an online database to manage users and authentication.

This whole application took time, it was a thorough experience for me as I did the design before doing everything.

You can find more images in the screenshots section !

## Documentation

On this chatapp the user can do almost anything that we normaly do in a chatapp like WhatsApp.

- The user can authenticate himself using an email and a password
- The user can register with a username, email and password
- The user can add another user to chat with by adding his username
- The user can modify his settings
- The user can modify his profile picture
- The user can modify his bio, username, and phone number
- The user can send messages to another user
- The user can delete messages
- The user can send an image
- The user can get notifications when receiving messages
- The user can see if his messages has been seen or not
- The user can see another user's profile
- The user can logout
- The user can see if another user is online or not

## Développement local

> Le projet est en cours de refonte. La base de données est maintenant décrite dans le dossier `supabase/`
> (migrations, règles RLS, données de démo et tests). Le front sera migré vers ce nouveau schéma dans une
> prochaine étape : en attendant, il ne fonctionne pas avec la nouvelle base.

Prérequis : Node 20+, Yarn et Docker.

```bash
yarn install
yarn db:start          # lance Supabase en local, applique les migrations et seed.sql
cp .env.example .env.local   # puis renseigner la PUBLISHABLE_KEY affichée
yarn dev
```

| Commande | Rôle |
| --- | --- |
| `yarn db:start` / `yarn db:stop` | Démarrer / arrêter Supabase en local |
| `yarn db:reset` | Recréer la base locale depuis zéro (migrations puis données de démo) |
| `yarn db:test` | Lancer les tests de sécurité pgTAP (`supabase/tests`) |
| `yarn db:types` | Régénérer `src/lib/database.types.ts` après une migration |

Comptes de démo (mot de passe `chatmore2026`) : `demo@chatmore.local`, `lea@chatmore.local`,
`karim@chatmore.local`, `ines@chatmore.local`, `thomas@chatmore.local`. Les e-mails envoyés en local
(confirmation d'inscription…) sont visibles dans Mailpit, sur http://127.0.0.1:54324.

Règles du dossier `supabase/` :

- Une modification de la base = une nouvelle migration (`supabase migration new <nom>`). On ne modifie jamais une
  migration déjà déployée.
- Toute table a la RLS activée. Les écritures sensibles passent par des fonctions (RPC) : le client demande, la base décide.
- La CI (`.github/workflows/database.yml`) rejoue les migrations, lance les tests et vérifie que les types sont à jour.

## Future Optimizations

Une refonte est en cours (sécurité, architecture, nouveau design) : voir « Développement local ».

## Screenshots

### Login Page

![App Screenshot](https://user-images.githubusercontent.com/73486687/150698875-c1c85f48-726c-41c8-b15f-36bcd3393324.png)

### Homepage

![App Screenshot](https://user-images.githubusercontent.com/73486687/236622992-593eb0cd-e95b-4097-9971-876e9d9b7336.png)

### Chat Page

![App Screenshot](https://user-images.githubusercontent.com/73486687/236622995-5bff1bb2-2b6a-4435-b29e-d8da10558807.png)

### User Settings Page

![App Screenshot](https://user-images.githubusercontent.com/73486687/236622996-2aaa0f70-6a7c-4399-82f5-ae89b8054088.png)

### Design Conception

![App Screenshot](https://user-images.githubusercontent.com/73486687/150699013-bb7f304d-bef5-429b-9992-515b68a55a4c.png)

## Authors

- [@Ulysseassoo](https://github.com/Ulysseassoo)
