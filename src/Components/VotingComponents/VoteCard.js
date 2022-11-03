import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import "./VoteCard.css";
import { addUserVotes, removeUserVotes } from "../../Services/VoteService";
import { getUserId } from "../../Services/LobbyService";

const VoteCard = ({ movie, movieId, lobbyData }) => {
  const [cardState, updateCardState] = useState({
    showPlot: false,
    voted: false,
  });

  useEffect(() => {
    getUserId().then((userId) => {
      const playerMovies = lobbyData.users[userId].movies;
      if (playerMovies !== undefined && playerMovies[movieId] !== undefined) {
        updateCardState({ ...cardState, voted: true });
      }
    });
  }, []);

  const style = {};
  return (
    <Card className="m-2 p-0 mCard col-auto g-card mx-3">
      {cardState.showPlot ? (
        <div
          className="mCard-img pt-3 px-2 text-align-center"
          style={{
            color: "white",
            backgroundColor: "#231410",
            borderRadius: "30px",
            maxWidth: "fit-content",
          }}
        >
          {movie.plot}
        </div>
      ) : (
        <Card.Img className="mCard-img" variant="top" src={movie.image} />
      )}

      <Card.Body className="mCard-body">
        <Card.Title className="mCard-title">
          {`${movie.title} `}
          <>
            {cardState.showPlot ? (
              <Button
                variant="dark btn-small"
                onClick={() =>
                  updateCardState({
                    ...cardState,
                    showPlot: !cardState.showPlot,
                  })
                }
              >
                View Plot
              </Button>
            ) : (
              <Button
                variant="outline-dark btn-small"
                onClick={() =>
                  updateCardState({
                    ...cardState,
                    showPlot: !cardState.showPlot,
                  })
                }
              >
                View Plot
              </Button>
            )}
          </>
        </Card.Title>
        <Card.Text className="mCard-text">{movie.description}</Card.Text>
        <div className="d-grid">
          {cardState.voted ? (
            <Button
              variant="primary"
              style={style}
              onClick={() => {
                removeUserVotes(movieId);
                updateCardState({ ...cardState, voted: false });
              }}
            >
              Voted
            </Button>
          ) : (
            <Button
              className="vote-button"
              variant="primary"
              style={style}
              onClick={() => {
                updateCardState({ ...cardState, voted: true });
                addUserVotes(movieId);
              }}
            >
              Vote
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default VoteCard;
