import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import { useContext, useState } from "react";
import { Container } from "react-bootstrap";
import "./MovieSearch.css";
import { MovieListContext } from "../../Context";
import {
  changeLobbyState,
  decrementMovieAdded,
  removeUserMovieFromDB,
} from "../../Services/LobbyService";
import VALUES from "../../Values";

const MoviePickList = () => {
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
    changeLobbyState(VALUES.VOTING);
  };

  return (
    <>
      <div className="mt-3 moviePickList g-card">
        <div>
          <ListGroup as="ol" variant="flush">
            {movContext.moviePickIDs.length > 0 ? (
              movContext.moviePickIDs.map((id) => (
                <>
                  <ListGroup.Item
                    className="d-flex mListItem"
                    key={id}
                    as="li"
                  >
                    <div className="mListItemTitle">{`${movContext.lobbyData.movies[id].title} ${movContext.lobbyData.movies[id].description} `}</div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleMovieListRemove(movContext.lobbyData.movies[id])}
                    >
                      Remove
                    </Button>
                  </ListGroup.Item>
                </>
              ))
            ) : (
              <ListGroup.Item>
                Your movie selections will appear here
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      </div>
      <div className="mt-2 d-grid">
        {userData["isAdmin"] && movContext.lobbyData.movies !== undefined && (
          <Button size="sm isAdmin" onClick={() => startVoting()}>
            Start Vote
          </Button>
        )}
      </div>
    </>
  );
};

export default MoviePickList;
