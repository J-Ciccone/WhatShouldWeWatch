import "./MovieCard.css";
import { MovieListContext } from "../../Context";
import { useContext } from "react";
import {
  addUserMovieToDB,
  incrementMovieAdded,
} from "../../Services/MovieService";

const MovieCard = ({ movie }) => {
  const movContext = useContext(MovieListContext);

  const handleSetMovieList = () => {
    if (
      movContext.moviePickIDs.length >= movContext.lobbyData.numMovies &&
      !movContext.moviePickIDs.includes(movie.id)
    ) {
      movContext.setShowToast(true);
      movContext.setToastText(
        `Whoops! You can only choose ${movContext.lobbyData.numMovies} movie(s). Try removing one!`
      );
    } else if (movContext.moviePickIDs.includes(movie.id)) {
      movContext.setShowToast(true);
      movContext.setToastText(
        "Whoops! Looks like you already added that movie!"
      );
    } else {
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
    <div className="col h-100" >
      <div className="card movie-card h-100" onClick={() => handleSetMovieList()}>
        <div className="card-image h-75">
          <img
            className="card-img-top h-100"
            src={movie.image}
            alt="card top"
          />
          <h4 className="select">Select</h4>
        </div>

        <div className="card-body">
          <div className="card-title">
            <strong>{movie.title}</strong>
          </div>
          <p className="card-text">
            <strong>
              <em>{movie.description}</em>
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
