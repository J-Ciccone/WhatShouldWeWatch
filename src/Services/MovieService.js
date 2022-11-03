import { ref, query, orderByChild } from "firebase/database";
import { database } from "../FirebaseAssets";
import { getUserId } from "./LobbyService";

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

export default MovieService;
