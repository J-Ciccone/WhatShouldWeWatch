import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "./MovieCard.css";
import { MovieListContext } from "../../Context";
import { useContext } from "react";
import {
  addUserMovieToDB,
  incrementMovieAdded,
} from "../../Services/LobbyService";

const MovieCard = ({ movie, buttonText }) => {
  const movContext = useContext(MovieListContext);
  const handleSetMovieList = () => {
    
    if (
      movContext.moviePickIDs.length >= movContext.lobbyData.numMovies &&
      !movContext.moviePickList.includes(movie.id)
    ) {
      movContext.setShow(true);
      movContext.setToastText(
        `Whoops! You can only choose ${movContext.lobbyData.numMovies} movie(s). Try removing one!`
      );
    } else if (movContext.moviePickIDs.includes(movie.id)) {
      movContext.setShow(true);
      movContext.setToastText(
        "Whoops! Looks like you already added that movie!"
      );
    } else {
      console.log(movContext.moviePickIDs)
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
    movContext.setPickIDs(moviePickIDArray)
    localStorage.setItem("entries",JSON.stringify(moviePickIDArray));
  };

  return (
    <Card className="m-2 p-0 mCard col-auto g-card mx-3">
      <Card.Img className="mCard-img" variant="top" src={movie.image} />
      <Card.Body className="mCard-body">
        <div className="g-card mb-2 p-1 mCard-title-holder">
          <Card.Title className="mCard-title">{movie.title}</Card.Title>
          <Card.Text className="mCard-text">{movie.description}</Card.Text>
        </div>

        <div className="d-grid">
          <Button
            className="mCard-btn"
            variant="secondary"
            onClick={() => handleSetMovieList()}
          >
            {buttonText}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MovieCard;
