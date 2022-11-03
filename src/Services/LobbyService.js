import { database } from "../FirebaseAssets";
import { ref, set, onValue, update, get, remove, increment } from "firebase/database";
import { getRandom } from "./NumberService";
import VALUES from "../Values";

export const createNewLobby = async (lobbyCode, numMovies, lobbyName) => {
  const db = database;
  const userId = await getUserId();
  await set(ref(db, "lobbies/" + lobbyCode), {
    users: {
      [userId]: {
        isAdmin: true,
        votes: 0,
        donePicking: false,
        movies: [],
      },
    },
    numMovies: numMovies,
    movies: [],
    stage: VALUES.PICKING,
    lobbyName: lobbyName,
    totalVotes: 0,
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
        console.log("User Found");
        console.log(snapshot.val());
        const data = snapshot.val();
        console.log(data);
        if (data !== null) {
          if (data.users[userId] === undefined) {
            console.log("Adding user to lobby");
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

export const changeLobbyState = async (lobbyState) => {
  const db = database;
  const lobbyCode = localStorage.getItem("lobbyCode");
  const updates = {};
  updates[`/lobbies/${lobbyCode}/stage`] = lobbyState;
  await update(ref(db), updates);
};

export const addUserMovieToDB = async (movie) => {
  const lobbyCode = localStorage.getItem("lobbyCode")
  const movieObj = {
    title: movie.title,
    id: movie.id,
    image: movie.image,
    description: movie.description,
    plot: movie.plot,
    added: 1,
  };
  const db = database;
  const updates = {};

  updates[`/lobbies/${lobbyCode}/movies/${movie.id}`] = movieObj;

  await update(ref(db), updates);
};

export const incrementMovieAdded = (movie) => {
  const lobbyCode = localStorage.getItem("lobbyCode")
  const db = database;
  const updates = {};

  updates[`/lobbies/${lobbyCode}/movies/${movie.id}/added`] = increment(1);

  update(ref(db), updates);
};

export const decrementMovieAdded =  (movie) => {
  const db = database;
  const updates = {};
  const lobbyCode = localStorage.getItem("lobbyCode");
  updates[`/lobbies/${lobbyCode}/movies/${movie.id}/added`] = increment(-1);

  update(ref(db), updates);
};

export const removeUserMovieFromDB = async (lobbyCode, movie) => {
  const db = database;

  const movieRef = ref(db, `/lobbies/${lobbyCode}/movies/${movie.id}`);

  await remove(movieRef);
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
