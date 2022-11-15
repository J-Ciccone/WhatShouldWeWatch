import { useEffect, useState } from "react";
import { Row, Button } from "react-bootstrap";
import "./Vote.css";
import VoteCard from "./VoteCard";
import Toast from "react-bootstrap/Toast";
import VALUES from "../../Values";
import { changeLobbyState } from "../../Services/LobbyService";

const Vote = ({ lobbyData, userId }) => {
  const movieArr = Object.keys(lobbyData.movies);
  const [voteData, setVoteData] = useState({
    votesCast: 0,
    showToast: false,
    canVote: true,
  });
  const setShow = () => {
    setVoteData({ ...voteData, showToast: false });
  };

  return (
    <div className="row  p-5 card-container">
      <div className="" style={{}}>
        <div className="row justify-content-center">
          <div className="vote-count pt-3 pb-5 px-5 w-auto">
            <h3>Cast Your Votes!</h3>
            <h4>
              Votes: <small>{`${lobbyData.totalVotes}`}</small>
            </h4>
            {lobbyData.users[userId].isAdmin && (
              <div>
                <Button
                  className="btn-sm"
                  onClick={() => changeLobbyState(VALUES.DONE)}
                >
                  End Vote
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="row justify-content-center text-align-center pt-2 pb-3">
          {movieArr.length > 0 &&
            movieArr.map((key) => (
              <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-2 mb-4">
                <div className="h-100" key={key}>
                  <VoteCard
                    movieId={key}
                    movie={lobbyData.movies[`${key}`]}
                    lobbyData={lobbyData}
                    voteData={voteData}
                    setShowToast={voteData.setShowToast}
                    setVoteData={setVoteData}
                  ></VoteCard>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Toast
        onClose={() => setShow()}
        show={voteData.showToast}
        delay={3000}
        autohide
        className="toast"
      >
        <Toast.Body>You can only vote for one movie!</Toast.Body>
      </Toast>
    </div>
  );
};

export default Vote;
