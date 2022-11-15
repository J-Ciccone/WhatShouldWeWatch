import { database } from "../FirebaseAssets";
import { ref, set, update, get, remove, increment } from "firebase/database";
import { getRandom } from "./NumberService";
import VALUES from "../Values";

export const createNewLobby = async (lobbyCode, numMovies, unlimitedVotes) => {
  const db = database;
  getUserId().then((userId) => {
    set(ref(db, "lobbies/" + lobbyCode), {
      users: {
        [userId]: {
          isAdmin: true,
          donePicking: false,
          movies: [],
        },
      },
      unlimitedVotes: unlimitedVotes,
      numMovies: numMovies,
      movies: [],
      stage: VALUES.PICKING,
      totalVotes: 0,
    }).then(() => {
      return true;
    });
  });
};

export const addUserToLobby = async (lobbyCode) => {
  const db = database;
  let valid = false;
  const userId = await getUserId();
  const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
  valid = get(lobbyRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(data);
        if (data !== null) {
          if (data.users[userId] === undefined) {
            const userData = { isAdmin: false, votes: 0, donePicking: false };
            const updates = {};
            updates[`/lobbies/${lobbyCode}/users/${userId}`] = userData;
            return update(ref(db), updates).then(() => {
              return true;
            });
          }
          return true;
        }
      } else {
        console.log("Lobby does not exist");
        return false;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return valid;
};

export const changeLobbyState = (lobbyState) => {
  const db = database;
  const lobbyCode = localStorage.getItem("lobbyCode");
  const updates = {};
  updates[`/lobbies/${lobbyCode}/stage`] = lobbyState;
  update(ref(db), updates);
};



export const getUserId = async () => {
  let userId;
  if (localStorage.getItem("user")) {
    userId = localStorage.getItem("user");
  } else {
    userId = await getRandom(10);
    localStorage.setItem("user", userId);
  }
  return userId;
};
