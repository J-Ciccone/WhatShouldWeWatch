import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./MovieCard.css";
import { MovieListContext } from "../../Context";
import { useContext } from "react";
import {
  addUserMovieToDB,
  incrementMovieAdded,
} from "../../Services/LobbyService";

const MovieCard = ({ movie }) => {
  const movContext = useContext(MovieListContext);
  const handleSetMovieList = () => {
    console.log(movie.id);
    if (
      movContext.moviePickIDs.length >= movContext.lobbyData.numMovies &&
      !movContext.moviePickIDs.includes(movie.id)
    ) {
      console.log(movie.id + "-0");
      movContext.setShowToast(true);
      movContext.setToastText(
        `Whoops! You can only choose ${movContext.lobbyData.numMovies} movie(s). Try removing one!`
      );
    } else if (movContext.moviePickIDs.includes(movie.id)) {
      console.log(movie.id + "-1");
      movContext.setShowToast(true);
      movContext.setToastText(
        "Whoops! Looks like you already added that movie!"
      );
    } else {
      console.log(movContext.moviePickIDs);
      handleMovieSelect(movie);
    }
  };

  const handleMovieSelect = (movie) => {
    if (movContext.lobbyData.movies) {
      movContext.lobbyData.movies[movie.id]
        ? incrementMovieAdded(movie)
        : addUserMovieToDB(movie);
    } else {
      addUserMovieToDB(movie);
    }
    const moviePickIDArray = movContext.moviePickIDs;
    moviePickIDArray.push(movie.id);
    movContext.setPickIDs(moviePickIDArray);
    localStorage.setItem("entries", JSON.stringify(moviePickIDArray));
  };

  return (
    <>
      <div className="col h-100" onClick={() => handleSetMovieList()}>
        <div className="card h-100">
          <div className="card-image h-75">
            <img className="card-img-top h-100" src={movie.image} alt="card top" />
            <h4 className="select">Select</h4>
          </div>

          <div className="card-body">
            <div className="card-title" style={{fontSize: "1.2rem"}}><strong>{movie.title}</strong></div>
            <p className="card-text"><strong><em>{movie.description}</em></strong></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieCard;
