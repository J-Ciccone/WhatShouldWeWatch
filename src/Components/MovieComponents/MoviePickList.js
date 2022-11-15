import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { useContext, useState } from "react";
import "./MovieSearch.css";
import { MovieListContext } from "../../Context";
import { changeLobbyState } from "../../Services/LobbyService";
import {
  decrementMovieAdded,
  removeUserMovieFromDB,
} from "../../Services/MovieService";
import VALUES from "../../Values";

const MoviePickList = () => {
  const [showMoviePicks, setShowMoviePicks] = useState(true);
  const movContext = useContext(MovieListContext);
  const userData = movContext.lobbyData.users[movContext.userId];

  const handleMovieListRemove = (movie) => {
    const arr = movContext.moviePickIDs.filter((id) => movie.id !== id);
    localStorage.setItem("entries", JSON.stringify(arr));
    movContext.setPickIDs(arr);
    movContext.lobbyData.movies[movie.id].added > 1
      ? decrementMovieAdded(movie)
      : removeUserMovieFromDB(localStorage.getItem("lobbyCode"), movie);
  };

  const startVoting = () => {
    const keys = Object.keys(movContext.lobbyData.movies);
    if (keys.length >= 2) {
      changeLobbyState(VALUES.VOTING);
    } else {
      movContext.setToastText("Lobbies Require 2 or More Movies to Proceed!");
      movContext.setShowToast(true);
    }
  };

  const handleShowPickList = () => {
    setShowMoviePicks(!showMoviePicks);
  };

  return (
    <>
      {!showMoviePicks && (
        <Button
          size="sm"
          className="show-list-button"
          onClick={() => handleShowPickList()}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Button>
      )}
      {showMoviePicks && (
        <>
          <div className="mt-3 movie-pick-list p-5 card-container">
            <Button
              size="sm"
              className="hide-list"
              onClick={() => handleShowPickList()}
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
            <div>
              <ListGroup
                as="ol"
                variant="flush"
                style={{ backgroundColor: "#f5f5f5" }}
              >
                {movContext.moviePickIDs.length > 0 ? (
                  movContext.moviePickIDs.map((id) => (
                    <ListGroup.Item
                      className="d-flex list-item"
                      key={id}
                      as="li"
                    >
                      <strong className="list-item-title">
                        {`${movContext.lobbyData.movies[id].title}`}

                        <em>{`${movContext.lobbyData.movies[id].description} `}</em>
                      </strong>
                      <Button
                        variant="danger"
                        size="sm"
                        className="btn-round "
                        style={{ maxHeight: "32px" }}
                        onClick={() =>
                          handleMovieListRemove(movContext.lobbyData.movies[id])
                        }
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item key={"000"} className="list-item">
                    Your movie picks will appear here
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
          </div>
          <div className={`mt-2 d-grid start-vote-btn ${showMoviePicks}`}>
            {userData["isAdmin"] && movContext.lobbyData.movies !== undefined && (
              <Button
                size="sm"
                onClick={() => startVoting()}
                className={`sm isAdmin ${showMoviePicks}`}
              >
                Start Vote
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default MoviePickList;
