# What Should We Watch?

A movie picker that lets you and your friends vote on a movie for movie night.

1. The host starts a vote and shares the 6-character lobby code (or the invite link).
2. Everyone searches [TMDB](https://www.themoviedb.org/) and picks up to N movies.
3. The host starts voting; everyone votes; the host ends the vote and the winner (or tie) is shown.

Built with React 19, TypeScript, Vite, React-Bootstrap and Firebase (Anonymous Auth + Realtime Database).

## Setup

Requires Node 22.13+ and, for the emulators and deploys, the [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`, which needs Java for the emulators).

```bash
npm install
```

Create `.env.local` (gitignored) with your TMDB **API Read Access Token** from
<https://www.themoviedb.org/settings/api>:

```
VITE_TMDB_READ_TOKEN=eyJhbGciOi...
```

The Firebase web config lives in `.env`. It is not secret; `database.rules.json` is what protects the data.

## Running locally

```bash
npm run dev:emulators
```

Starts the Auth and Realtime Database emulators and the app at <http://localhost:5173>, so nothing touches the
live database. The emulator UI is at <http://localhost:4000>. Movie search still calls the real TMDB API.

`npm run dev` runs the app against the **live** Firebase project instead.

## Checks

| Command | What it does |
| --- | --- |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run test:rules` | Security-rules tests against the Database emulator |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck + production build into `dist/` |

## Deploying

One-time, in the [Firebase console](https://console.firebase.google.com/project/mymoviepicker) for `mymoviepicker`:
**Authentication → Sign-in method → enable Anonymous**.

```bash
npm run deploy
```

Builds and deploys hosting and the database rules together. The new rules deny the old (v1) client, so deploy
both at once.

## Data model

`lobbies/{CODE}` in the Realtime Database:

| Path | Written by | Notes |
| --- | --- | --- |
| `hostId`, `createdAt`, `settings`, `stage` | host, once on create | `stage` then moves `PICKING → VOTING → DONE`, host only |
| `members/{uid}` | that user | join timestamp |
| `picks/{uid}/{tmdbId}` | that user, while `PICKING` | `{ title, year?, posterPath?, overview? }` |
| `votes/{uid}` | that user, while `VOTING` | a TMDB id, or `{ tmdbId: true }` in unlimited-vote lobbies |

Every player writes only their own picks and votes, so there are no shared counters to race on; the movie pool
and tallies are computed in the client (`src/lib/tally.ts`).

## Known limitations

- The TMDB read token ships in the browser bundle (it's read-only). Moving search behind a Cloud Function would
  hide it, but Functions need the Blaze plan.
- The per-person pick limit is enforced in the UI only; Realtime Database rules can't count children.
- Old lobbies are never deleted. A scheduled cleanup would also need Cloud Functions.
