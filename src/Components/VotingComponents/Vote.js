import { useEffect, useState } from "react";
import { Row, Button } from "react-bootstrap";
import "./Vote.css";
import VoteCard from "./VoteCard";
import Toast from "react-bootstrap/Toast";
import VALUES from "../../Values";
import { changeLobbyState } from "../../Services/LobbyService";

const Vote = ({ lobbyData, userId }) => {
  const movieArr = Object.keys(lobbyData.movies);
  const [showToast, setShowToast] = useState();
  const [voteData, setVoteData] = useState({
    votesCast: 0,
    showToast: false,
    canVote: true,
  });
  const setShow = () => {
    setVoteData({ ...voteData, showToast: false });
  };

  return (
    <div className="row card-container">
      <div className="pt-3 pb-5 px-5">
        <h3 className="">Cast Your Votes!</h3>
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

      <div className="row d-flex justify-content-center text-align-center">
        {movieArr.length > 0 &&
          movieArr.map((key) => (
            <>
              <div
                className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-2 mb-4"
                key={key}
              >
                <VoteCard
                  movieId={key}
                  movie={lobbyData.movies[`${key}`]}
                  lobbyData={lobbyData}
                  voteData={voteData}
                  setShowToast={setShowToast}
                  setVoteData={setVoteData}
                ></VoteCard>
              </div>
            </>
          ))}
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
