# Ummar Farooq portfolio

## Run locally

```sh
npm install
npm start
```

The contact endpoint stores submissions in `private-data/messages.json`. On first launch, the server migrates `data/messages.json` if that legacy file exists. The private storage folder has restricted local permissions and is excluded from version control and static-file serving. Back it up securely.

## Configure the admin dashboard

Create a local `.env` from `.env.example`, set `ADMIN_USER`, `ADMIN_PASSWORD_HASH`, and a random `SESSION_SECRET` with at least 32 characters. The example includes commands to generate the scrypt password hash and session secret. Keep `.env` out of version control. Start the server with those environment variables loaded, then open `/admin.html` and sign in.

For deployment, use HTTPS and a persistent disk for `private-data` (or set `DATA_DIR` to a protected persistent directory). The session cookie is marked Secure automatically when `NODE_ENV=production`. The built-in JSON store is suitable for a single Node server; use a managed database for multiple server instances or larger workloads.
