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
    movieNum: 1,
    lobbyName: "My Movie Vote",
  });

  const changeHandler = (e) => {
    setLobbyData({ ...lobbyData, [e.target.name]: e.target.value });
  };

  const startNewVote = async () => {
    setLoading(true);
    const code = await getRandom(6);
    localStorage.setItem("lobbyCode", code);
    await createNewLobby(code, lobbyData.movieNum, lobbyData.lobbyName);
    navigate(`/lobby/lobby=${code}`);
  };

  return (
    <div className="setup col-md-6 col-9">
      <Form className="g-card setup-form">
        <Form.Label htmlFor="voteLobbyName">
          <h2>Lobby Name</h2>
        </Form.Label>
        <Form.Control
          type="Text"
          id="voteLobbyName"
          name="lobbyName"
          placeholder="Enter a name for your lobby"
          className="mb-4"
          onChange={changeHandler}
        />
        <Form.Select
          aria-label="Set Movie Number"
          name="movieNum"
          onChange={changeHandler}
        >
          <option>Number of movies per person</option>
          <option value={1}>One</option>
          <option value={2}>Two</option>
          <option value={3}>Three</option>
          <option value={4}>Four</option>
          <option value={5}>Five</option>
        </Form.Select>
        <div className="m-3">{lobbyData.movieNum} movie(s) per person</div>

        {!loading && (
          <Button className="m-2" onClick={() => startNewVote()}>
            Start Vote
          </Button>
        )}
        <br></br>
        {loading && (
          <Spinner className="mt-3" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
      </Form>
    </div>
  );
};

export default NewVoteSetup;
