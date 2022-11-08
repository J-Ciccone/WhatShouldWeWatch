import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useContext, useEffect, useState } from "react";
import "./VoteCard.css";
import { addUserVotes, removeUserVotes } from "../../Services/VoteService";
import { getUserId } from "../../Services/LobbyService";
import { MovieListContext } from "../../Context";

const VoteCard = ({
  movie,
  movieId,
  lobbyData,
  setShowToast,
  voteData,
  setVoteData,
}) => {
  const [cardState, updateCardState] = useState({
    showPlot: false,
    voted: false,
  });
  useEffect(() => {
    getUserId().then((userId) => {
      const playerMovies = lobbyData.users[userId].movies;
      if (playerMovies !== undefined && playerMovies[movieId] !== undefined) {
        if (!lobbyData.unlimitedVotes) {
          setVoteData({ ...voteData, canVote: false });
        }
        updateCardState({ ...cardState, voted: true });
      }
    });
  }, []);

  const handleCardStateChange = () => {
    if (lobbyData.unlimitedVotes) {
      if (cardState.voted) {
        removeUserVotes(movieId);
        updateCardState({ ...cardState, voted: false });
      } else {
        updateCardState({ ...cardState, voted: true });
        addUserVotes(movieId);
      }
    } else {
      if (cardState.voted) {
        setVoteData({ ...voteData, canVote: true });
        removeUserVotes(movieId);
        updateCardState({ ...cardState, voted: false });
      } else if (!voteData.canVote) {
        setVoteData({ ...voteData, showToast: true });
      } else {
        setVoteData({ ...voteData, canVote: false });
        updateCardState({ ...cardState, voted: true });
        addUserVotes(movieId);
      }
    }
  };

  return (
    <>
      <div className="col h-100" onClick={() => handleCardStateChange()}>
        <div className="card h-100">
          <div className="card-image h-75">
            <img
              className="card-img-top h-100"
              src={movie.image}
              alt="card top"
            />
            {cardState.voted ? (
              <h1 className="voted material-symbols-outlined">done</h1>
            ) : (
              <h4 className="vote">Vote</h4>
            )}
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

export default VoteCard;
