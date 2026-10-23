import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const TIMESTAMP = { ".sv": "timestamp" };
const CODE = "ABC234";
const HOST = "host-uid";
const GUEST = "guest-uid";
const STRANGER = "stranger-uid";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-wsww",
    database: { rules: readFileSync("database.rules.json", "utf8"), host: "127.0.0.1", port: 9300 },
  });
});

afterAll(() => env?.cleanup());

beforeEach(() => env.clearDatabase());

const db = (uid: string) => env.authenticatedContext(uid).database();
const anon = () => env.unauthenticatedContext().database();
const at = (uid: string, path: string) => db(uid).ref(`lobbies/${CODE}/${path}`);

function newLobby(host = HOST, overrides: Record<string, unknown> = {}) {
  return {
    hostId: host,
    createdAt: TIMESTAMP,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "PICKING",
    members: { [host]: TIMESTAMP },
    ...overrides,
  };
}

/** Writes a lobby with rules off: HOST and GUEST are members, STRANGER is not. */
async function seed(stage: string, settings = { numMovies: 2, unlimitedVotes: false }, extra = {}) {
  await env.withSecurityRulesDisabled((ctx) =>
    ctx
      .database()
      .ref(`lobbies/${CODE}`)
      .set({ ...newLobby(), stage, settings, members: { [HOST]: 1, [GUEST]: 1 }, ...extra }),
  );
}

const PICK = {
  title: "Alien",
  year: "1979",
  posterPath: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
  backdropPath: "/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg",
  overview: "In space…",
  rating: 8.1,
};

describe("creating a lobby", () => {
  it("lets a signed-in user create a lobby they host", async () => {
    await assertSucceeds(db(HOST).ref(`lobbies/${CODE}`).set(newLobby()));
  });

  it("rejects signed-out users", async () => {
    await assertFails(anon().ref(`lobbies/${CODE}`).set(newLobby()));
  });

  it("rejects making someone else the host", async () => {
    await assertFails(db(STRANGER).ref(`lobbies/${CODE}`).set(newLobby(HOST)));
  });

  it("refuses to overwrite an existing lobby", async () => {
    await seed("PICKING");
    await assertFails(db(STRANGER).ref(`lobbies/${CODE}`).set(newLobby(STRANGER)));
  });

  it("rejects malformed codes", async () => {
    await assertFails(db(HOST).ref("lobbies/abc").set(newLobby()));
    await assertFails(db(HOST).ref("lobbies/ABC1O0").set(newLobby()));
  });

  it("rejects bad settings, a non-PICKING start, or a client-chosen timestamp", async () => {
    const ref = db(HOST).ref(`lobbies/${CODE}`);
    await assertFails(ref.set(newLobby(HOST, { settings: { numMovies: 9, unlimitedVotes: false } })));
    await assertFails(ref.set(newLobby(HOST, { settings: { numMovies: 2, unlimitedVotes: "yes" } })));
    await assertFails(ref.set(newLobby(HOST, { stage: "DONE" })));
    await assertFails(ref.set(newLobby(HOST, { createdAt: 1 })));
  });

  it("rejects pre-filled picks, votes, other members, or unknown keys", async () => {
    const ref = db(HOST).ref(`lobbies/${CODE}`);
    await assertFails(ref.set(newLobby(HOST, { picks: { [HOST]: { "348": PICK } } })));
    await assertFails(ref.set(newLobby(HOST, { votes: { [HOST]: "348" } })));
    await assertFails(ref.set(newLobby(HOST, { members: { [HOST]: TIMESTAMP, [GUEST]: TIMESTAMP } })));
    await assertFails(ref.set(newLobby(HOST, { admin: true })));
  });
});

describe("reading", () => {
  it("lets signed-in users read a lobby by code, but not list lobbies", async () => {
    await seed("PICKING");
    await assertSucceeds(db(STRANGER).ref(`lobbies/${CODE}`).get());
    await assertFails(anon().ref(`lobbies/${CODE}`).get());
    await assertFails(db(HOST).ref("lobbies").get());
  });
});

describe("joining", () => {
  it("lets a user add only themselves", async () => {
    await seed("PICKING");
    await assertSucceeds(at(STRANGER, `members/${STRANGER}`).set(TIMESTAMP));
    await assertFails(at(STRANGER, `members/${GUEST}`).set(TIMESTAMP));
    await assertFails(at(STRANGER, `members/${STRANGER}`).set("hi"));
  });

  it("accepts a display name, and still accepts the older bare timestamp", async () => {
    await seed("PICKING");
    await assertSucceeds(at(STRANGER, `members/${STRANGER}`).set({ name: "Sam 🍿", joinedAt: TIMESTAMP }));
    await assertSucceeds(at(STRANGER, `members/${STRANGER}`).set({ name: "Sammy", joinedAt: 5 }));
    await assertSucceeds(at(GUEST, `members/${GUEST}`).set(TIMESTAMP));
  });

  it("rejects empty or long names, missing fields and extra fields", async () => {
    await seed("PICKING");
    const me = at(STRANGER, `members/${STRANGER}`);
    await assertFails(me.set({ name: "", joinedAt: TIMESTAMP }));
    await assertFails(me.set({ name: "x".repeat(25), joinedAt: TIMESTAMP }));
    await assertFails(me.set({ name: "Sam" }));
    await assertFails(me.set({ name: "Sam", joinedAt: TIMESTAMP, isHost: true }));
  });

  it("cannot create a partial lobby by joining a code that doesn't exist", async () => {
    await assertFails(db(STRANGER).ref(`lobbies/ZZZZZZ/members/${STRANGER}`).set({ name: "Sam", joinedAt: TIMESTAMP }));
  });

  it("lets the host create a lobby with their name", async () => {
    await assertSucceeds(
      db(HOST)
        .ref(`lobbies/${CODE}`)
        .set(newLobby(HOST, { members: { [HOST]: { name: "Host", joinedAt: TIMESTAMP } } })),
    );
  });
});

describe("tie-break and next round", () => {
  it("lets only the host set them, only after the vote, and only once", async () => {
    await seed("VOTING");
    await assertFails(at(HOST, "tiebreak").set("348"));
    await assertFails(at(HOST, "nextLobby").set("XYZ789"));

    await seed("DONE");
    await assertFails(at(GUEST, "tiebreak").set("348"));
    await assertFails(at(GUEST, "nextLobby").set("XYZ789"));
    await assertSucceeds(at(HOST, "tiebreak").set("348"));
    await assertFails(at(HOST, "tiebreak").set("603"));
    await assertSucceeds(at(HOST, "nextLobby").set("XYZ789"));
    await assertFails(at(HOST, "nextLobby").set("XYZ788"));
  });

  it("rejects malformed values and pointing a lobby at itself", async () => {
    await seed("DONE");
    await assertFails(at(HOST, "tiebreak").set("not-a-movie"));
    await assertFails(at(HOST, "nextLobby").set("abc"));
    await assertFails(at(HOST, "nextLobby").set(CODE));
  });

  it("cannot be included when creating a lobby", async () => {
    const ref = db(HOST).ref(`lobbies/${CODE}`);
    await assertFails(ref.set(newLobby(HOST, { tiebreak: "348" })));
    await assertFails(ref.set(newLobby(HOST, { nextLobby: "XYZ789" })));
  });
});

describe("stage changes", () => {
  it("lets only the host move PICKING → VOTING → DONE", async () => {
    await seed("PICKING");
    await assertFails(at(GUEST, "stage").set("VOTING"));
    await assertFails(at(HOST, "stage").set("DONE"));
    await assertSucceeds(at(HOST, "stage").set("VOTING"));
    await assertFails(at(HOST, "stage").set("PICKING"));
    await assertFails(at(GUEST, "stage").set("DONE"));
    await assertSucceeds(at(HOST, "stage").set("DONE"));
    await assertFails(at(HOST, "stage").set("VOTING"));
  });

  it("does not let the host delete the stage or change the host", async () => {
    await seed("PICKING");
    await assertFails(at(HOST, "stage").remove());
    await assertFails(at(HOST, "hostId").set(GUEST));
    await assertFails(at(GUEST, "hostId").set(GUEST));
  });

  it("does not let anyone delete the lobby", async () => {
    await seed("PICKING");
    await assertFails(db(HOST).ref(`lobbies/${CODE}`).remove());
  });
});

describe("picks", () => {
  it("lets members add and remove their own picks while picking", async () => {
    await seed("PICKING");
    await assertSucceeds(at(GUEST, `picks/${GUEST}/348`).set(PICK));
    await assertSucceeds(at(GUEST, `picks/${GUEST}/603`).set({ title: "The Matrix" }));
    await assertSucceeds(at(GUEST, `picks/${GUEST}/348`).remove());
  });

  it("rejects non-members and picks for other people", async () => {
    await seed("PICKING");
    await assertFails(at(STRANGER, `picks/${STRANGER}/348`).set(PICK));
    await assertFails(at(GUEST, `picks/${HOST}/348`).set(PICK));
  });

  it("rejects picks once voting has started", async () => {
    await seed("VOTING");
    await assertFails(at(GUEST, `picks/${GUEST}/348`).set(PICK));
  });

  it("rejects malformed picks", async () => {
    await seed("PICKING");
    await assertFails(at(GUEST, `picks/${GUEST}/not-a-number`).set(PICK));
    await assertFails(at(GUEST, `picks/${GUEST}/348`).set({ ...PICK, title: "" }));
    await assertFails(at(GUEST, `picks/${GUEST}/348`).set({ ...PICK, votes: 100 }));
    await assertFails(at(GUEST, `picks/${GUEST}/348`).set({ ...PICK, posterPath: "https://evil.example/x.jpg" }));
    await assertFails(at(GUEST, `picks/${GUEST}/348`).set({ ...PICK, backdropPath: "javascript:alert(1)" }));
    await assertFails(at(GUEST, `picks/${GUEST}/348`).set({ ...PICK, rating: 11 }));
    await assertFails(at(GUEST, `picks/${GUEST}`).set("348"));
  });
});

describe("votes, single-vote lobby", () => {
  it("lets members cast, change and withdraw one vote while voting", async () => {
    await seed("VOTING");
    await assertSucceeds(at(GUEST, `votes/${GUEST}`).set("348"));
    await assertSucceeds(at(GUEST, `votes/${GUEST}`).set("603"));
    await assertSucceeds(at(GUEST, `votes/${GUEST}`).remove());
  });

  it("rejects multiple votes, votes for others, non-members and the wrong stage", async () => {
    await seed("VOTING");
    await assertFails(at(GUEST, `votes/${GUEST}`).set({ "348": true, "603": true }));
    await assertFails(at(GUEST, `votes/${GUEST}/348`).set(true));
    await assertFails(at(GUEST, `votes/${HOST}`).set("348"));
    await assertFails(at(STRANGER, `votes/${STRANGER}`).set("348"));
    await seed("PICKING");
    await assertFails(at(GUEST, `votes/${GUEST}`).set("348"));
  });

  it("rejects votes after the vote has ended", async () => {
    await seed("DONE");
    await assertFails(at(GUEST, `votes/${GUEST}`).set("348"));
  });
});

describe("votes, unlimited-vote lobby", () => {
  const unlimited = { numMovies: 2, unlimitedVotes: true };

  it("lets members vote for several movies and withdraw one", async () => {
    await seed("VOTING", unlimited);
    await assertSucceeds(at(GUEST, `votes/${GUEST}/348`).set(true));
    await assertSucceeds(at(GUEST, `votes/${GUEST}/603`).set(true));
    await assertSucceeds(at(GUEST, `votes/${GUEST}/348`).remove());
  });

  it("rejects the single-vote shape and non-true values", async () => {
    await seed("VOTING", unlimited);
    await assertFails(at(GUEST, `votes/${GUEST}`).set("348"));
    await assertFails(at(GUEST, `votes/${GUEST}/348`).set(5));
    await assertFails(at(GUEST, `votes/${GUEST}/abc`).set(true));
  });
});
