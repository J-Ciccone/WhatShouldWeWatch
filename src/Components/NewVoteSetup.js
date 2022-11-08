import Form from "react-bootstrap/Form";
import { Button, Row, Spinner } from "react-bootstrap";
import { useState } from "react";
import { getRandom } from "../Services/NumberService";
import { useNavigate } from "react-router-dom";
import "./NewVoteSetup.css";
import { createNewLobby } from "../Services/LobbyService";

const NewVoteSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState();
  const [lobbyData, setLobbyData] = useState({
    movieNum: 2,
    lobbyName: "My Movie Vote",
    unlimitedVotes: false,
  });

  const changeHandler = (e) => {
    setLobbyData({ ...lobbyData, [e.target.name]: e.target.value });
  };

  const changeCheckHandler = (e) => {
    setLobbyData({ ...lobbyData, [e.target.name]: e.target.checked });
  };

  const startNewVote = async () => {
    setLoading(true);
    localStorage.setItem("entries", []);
    const code = await getRandom(6);
    localStorage.setItem("lobbyCode", code);
    createNewLobby(code, lobbyData.movieNum, lobbyData.unlimitedVotes).then(
      () => {
        navigate(`/lobby/${code}`);
      }
    );
  };

  return (
    <div className="setup row">
      <div className="g-card p-5 lobby-start-form col-md-5 col-11">
        <h2>Let's Get Started</h2>
        <div>
          <select
            className="form-select mt-3"
            aria-label="Default select example"
            name="movieNum"
            onChange={changeHandler}
          >
            <option>Number of movies per person</option>
            <option value={2} defaultValue>
              Two
            </option>
            <option value={3}>Three</option>
            <option value={4}>Four</option>
            <option value={5}>Five</option>
          </select>
        </div>

        <div className="m-3">{lobbyData.movieNum} movie(s) per person</div>
        <div className="form-check form-switch m-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            name="unlimitedVotes"
            id="flexSwitchCheckDefault"
            onChange={changeCheckHandler}
          />
          <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
            Vote for more than one movie
          </label>
        </div>
        {!loading && (
          <Button className="m-2" onClick={() => startNewVote()}>
            Start Vote
          </Button>
        )}
        {loading && (
          <Spinner className="mt-3" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
      </div>
    </div>
  );
};

export default NewVoteSetup;
