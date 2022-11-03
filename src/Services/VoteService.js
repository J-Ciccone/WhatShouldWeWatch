import { database } from "../FirebaseAssets";

import { ref, update, increment, remove } from "firebase/database";
import { getUserId } from "./LobbyService";

export const addUserMovies = async (lobbyCode, movies) => {
  const db = database;
  const movieData = { ...movies };
  const updates = {};
  updates[`/lobbies/${lobbyCode}/movies`] = movieData;
  await update(ref(db), updates);
};

export const addUserVotes = async (movieId) => {
  const userId = await getUserId();
  const lobbyCode = localStorage.getItem("lobbyCode");
  const db = database;
  const updates = {};
  updates[`/lobbies/${lobbyCode}/movies/${movieId}/votes`] = increment(1);
  updates[`/lobbies/${lobbyCode}/users/${userId}/votes`] = increment(1);
  updates[`/lobbies/${lobbyCode}/totalVotes`] = increment(1);
  updates[`/lobbies/${lobbyCode}/users/${userId}/movies/${movieId}`] = "1";
  await update(ref(db), updates);
};

export const removeUserVotes = async (movieId) => {
  const userId = await getUserId();
  const lobbyCode = localStorage.getItem("lobbyCode");
  const db = database;
  const updates = {};
  updates[`/lobbies/${lobbyCode}/movies/${movieId}/votes`] = increment(-1);
  updates[`/lobbies/${lobbyCode}/users/${userId}/votes`] = increment(-1);
  updates[`/lobbies/${lobbyCode}/totalVotes`] = increment(-1);
  const movieRef = ref(db,`/lobbies/${lobbyCode}/users/${userId}/movies/${movieId}`);
  remove(movieRef)
  await update(ref(db), updates);
};
