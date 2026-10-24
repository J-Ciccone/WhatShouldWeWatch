# What Should We Watch?

Movie night, sorted. Everyone picks a few movies, you all vote, and the winner is on screen in minutes.

1. **Host a lobby.** Share the 6-character code, the invite link, or the QR code. No sign-up needed.
2. **Everyone picks.** Search as you type, or tap something from *Popular this week*. Tap ⓘ for the synopsis,
   rating, trailer and where it's streaming.
3. **Vote.** The results appear when the host hits *Reveal winner*. Ties can be settled with *Let fate decide*.
   Not in the mood to vote? The host can tap the dice to skip it and pick one of the group's movies at random.
4. **Watch.** See the winner, its trailer and streaming options, then *Play again with this group* if you like.

Built with React 19, TypeScript, Vite and Firebase (Anonymous Auth + Realtime Database). Movie data comes from
[TMDB](https://www.themoviedb.org/); where-to-watch data is from JustWatch via TMDB.

## Setup

Requires Node 22.13+ and, for the emulators and deploys, the [Firebase CLI](https://firebase.google.com/docs/cli)
(`npm i -g firebase-tools`, which needs Java for the emulators).

```bash
npm install
```

Create `.env.local` (gitignored) with your TMDB **API Read Access Token** from
<https://www.themoviedb.org/settings/api>:

```
VITE_TMDB_READ_TOKEN=eyJhbGciOi...
```

Production builds refuse to run without it. The Firebase web config lives in `.env`; it is not secret, and
`database.rules.json` is what protects the data.

## Running locally

```bash
npm run dev:emulators
```

Starts the Auth and Realtime Database emulators and the app at <http://localhost:5173>, so nothing touches the
live database. The emulator UI is at <http://localhost:4300>. Movie search still calls the real TMDB API.

`npm run dev` runs the app against the **live** Firebase project instead.

## Checks

| Command | What it does |
| --- | --- |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run test:rules` | Security-rules tests, plus the app's real write functions, against the emulators |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck + production build into `dist/` |

## Deploying

### Try it on a preview link first

The database rules accept everything the currently deployed app writes, so they can go live on their own:

```bash
firebase deploy --only database
npm run preview:channel
```

`preview:channel` builds and uploads the site to a temporary Firebase Hosting URL (valid for 7 days) without
touching the live site, so you and your friends can try it on your phones.

### Go live

```bash
npm run deploy
```

Builds and deploys hosting and the database rules together. Roll back from Firebase Console → Hosting → release
history if needed.

## Data model

`lobbies/{CODE}` in the Realtime Database:

| Path | Written by | Notes |
| --- | --- | --- |
| `hostId`, `createdAt`, `settings`, `stage` | host, once on create | `stage` then moves `PICKING → VOTING → DONE`, host only |
| `members/{uid}` | that user | `{ name, joinedAt }` (a bare timestamp from older versions is still accepted) |
| `picks/{uid}/{tmdbId}` | that user, while `PICKING` | `{ title, year?, posterPath?, backdropPath?, overview?, rating? }` |
| `votes/{uid}` | that user, while `VOTING` | a TMDB id, or `{ tmdbId: true }` in unlimited-vote lobbies |
| `tiebreak` | host, once, after the vote | TMDB id chosen at random among tied movies |
| `randomPick` | host, once, instead of voting | `{ movieId, pickedBy }`, written together with `stage: DONE`; the rules check that pick still exists |
| `nextLobby` | host, once, after the vote | code of the follow-up lobby from *Play again* |

Every player writes only their own picks and votes, so there are no shared counters to race on; the movie pool
and tallies are computed in the client (`src/lib/tally.ts`).

## Known limitations

- The TMDB read token ships in the browser bundle (it's read-only). Moving search behind a Cloud Function would
  hide it, but Functions need the Blaze plan.
- The per-person pick limit is enforced in the UI only; Realtime Database rules can't count children.
- Only the host can move the vote along. If the host disappears, the group has to start a new lobby.
- Old lobbies are never deleted. A scheduled cleanup would also need Cloud Functions.
