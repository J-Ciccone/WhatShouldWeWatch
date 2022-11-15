import { useEffect, useState } from "react";
import { addUserVotes, removeUserVotes } from "../../Services/VoteService";
import { getUserId } from "../../Services/LobbyService";

const VoteCard = ({ movie, movieId, lobbyData, voteData, setVoteData }) => {
  const [voted, updateVoted] = useState(false);

  useEffect(() => {
    getUserId().then((userId) => {
      const playerMovies = lobbyData.users[userId].movies;
      if (playerMovies !== undefined && playerMovies[movieId] !== undefined) {
        !lobbyData.unlimitedVotes &&
          setVoteData({ ...voteData, canVote: false });
        updateVoted(true);
      }
    });
  }, []);

  const handleCardStateChange = () => {
    if (lobbyData.unlimitedVotes) {
      if (voted) {
        removeUserVotes(movieId);
        updateVoted(false);
      } else {
        updateVoted(true);
        addUserVotes(movieId);
      }
    } else {
      if (voted) {
        setVoteData(true);
        removeUserVotes(movieId);
        updateVoted(false);
      } else if (!voteData.canVote) {
        setVoteData({ ...voteData, showToast: true });
      } else {
        setVoteData({ ...voteData, canVote: false });
        updateVoted(true);
        addUserVotes(movieId);
      }
    }
  };

  return (
    <>
      <div className="h-100" onClick={() => handleCardStateChange()}>
        <div className="card movie-card h-100">
          <div className="card-image h-75">
            <img
              className="card-img-top h-100"
              src={movie.image}
              alt="card top"
            />
            {voted ? (
              <h1 className="voted material-symbols-outlined">done</h1>
            ) : (
              <h4 className="vote">Vote</h4>
            )}
          </div>

          <div className="card-body">
            <div className="card-title" >
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
    </>
  );
};

export default VoteCard;
