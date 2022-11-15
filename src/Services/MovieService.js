import { ref, query, orderByChild, set, update, get, remove, increment } from "firebase/database";
import { database } from "../FirebaseAssets";
const searchMovie = async (search) => {
  const query = await fetch(
    `https://imdb-api.com/API/AdvancedSearch/k_goeuq070?title=${search}&title_type=feature&count=25`
  ).then((res) => {
    return res.json();
  });
  return query;
};

const MovieService = {
  searchMovie: (search) => searchMovie(search),
  getMostVotedMovie: () => getMostVotedMovie(),
};

const getMostVotedMovie = () => {
  const db = database;
  const lobbyCode = localStorage.getItem("lobbyCode");
  const reff = query(
    ref(db, `lobbies/${lobbyCode}/movies`),
    orderByChild("votes")
  );
  console.log(reff);
};

export const addUserMovieToDB = (movie) => {
  const lobbyCode = localStorage.getItem("lobbyCode");
  const movieObj = {
    title: movie.title,
    id: movie.id,
    image: movie.image,
    description: movie.description,
    plot: movie.plot,
    added: 1,
    votes: 0,
  };
  const db = database;
  const updates = {};

  updates[`/lobbies/${lobbyCode}/movies/${movie.id}`] = movieObj;

  update(ref(db), updates);
};

export const incrementMovieAdded = (movie) => {
  const lobbyCode = localStorage.getItem("lobbyCode");
  const db = database;
  const updates = {};

  updates[`/lobbies/${lobbyCode}/movies/${movie.id}/added`] = increment(1);

  update(ref(db), updates);
};

export const decrementMovieAdded = (movie) => {
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

export default MovieService;
