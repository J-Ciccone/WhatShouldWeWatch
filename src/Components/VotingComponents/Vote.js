import { useEffect, useState } from "react";
import { Row, Button } from "react-bootstrap";
import "./Vote.css";
import VoteCard from "./VoteCard";
import Toast from "react-bootstrap/Toast";
import VALUES from "../../Values";
import { changeLobbyState } from "../../Services/LobbyService";

const Vote = ({ lobbyData }) => {
  const movieArr = Object.keys(lobbyData.movies);
  const [voteData, setVoteData] = useState({
    votesCast: 0,
    showToast: false,
  });
  const setShow = () => {
    setVoteData({ ...voteData, showToast: false });
  };

  return (
    <>
      <Row className="justify-content-center">
        <div className="text-align-center g-card p-4" style={{color:"black"}}>
          <h3 className="text-align-center">Time to vote!</h3>
          Votes: <small>{`${lobbyData.totalVotes}`}</small>
          <div className="text-align-center" style={{}}>
            <Button
              className="btn-sm"
              onClick={() => changeLobbyState(VALUES.DONE)}
            >
              End Vote
            </Button>
          </div>
        </div>
      </Row>
      <Row className="justify-content-center">
        {movieArr.length > 0 &&
          movieArr.map((key) => (
            <VoteCard
              key={key}
              movieId={key}
              movie={lobbyData.movies[`${key}`]}
              lobbyData={lobbyData}
              voteData={voteData}
              setVoteData={setVoteData}
            ></VoteCard>
          ))}
        <Toast
          onClose={() => setShow()}
          show={voteData.showToast}
          delay={3000}
          autohide
          className="toast"
        ></Toast>
      </Row>
    </>
  );
};

export default Vote;
