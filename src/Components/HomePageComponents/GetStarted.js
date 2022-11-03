import { Button, Col, Form, Row } from "react-bootstrap";
import "./Intro.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addUserToLobby, getUserId } from "../../Services/LobbyService";
import Toast from "react-bootstrap/Toast";

const GetStarted = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const enterLobby = async () => {
    const userId = await getUserId()
    const validGame = await addUserToLobby(code).then((valid) => {
      return valid;
    });
    localStorage.setItem("lobbyCode", code);
    if (validGame) {
      navigate(`/lobby/lobby=${code}&user=${userId}`);
    } else {
      setShow(true);
      setCode("");
    }
  };

  return (
    <>
      <Col className="get-started g-card d-flex my-2 col-sm-6 col-lg-4 p-2">
        <h3 className="mt-4">Let's Vote on it!</h3>
        <Form className="">
          <div className="d-grid">
            <Button
              className="my-2 start-vote-button"
              variant="primary"
              size="sm"
              type="submit"
              onClick={() => navigate("/home/new-vote")}
            >
              Start New Vote
            </Button>
          </div>
          <div>OR</div>
          <div className="d-grid">
            <div className="mb-2">
              Enter a lobby code to join a vote in progress
            </div>
            <Form.Group>
              <Form.Control
                type="text"
                id="movieSearch"
                placeholder="Lobby Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              className="mt-2 mb-5 joinVoteButton"
              variant="primary"
              disabled={!(code.length === 6) && true}
              size="sm"
              onClick={() => enterLobby()}
            >
              Join A Vote
            </Button>
          </div>
        </Form>
      </Col>
      <Toast
        onClose={() => setShow(false)}
        show={show}
        delay={3000}
        autohide
        className="toast"
      >
        <Toast.Body>
          Whoops! Looks like you entered an invalid lobby code
        </Toast.Body>
      </Toast>
    </>
  );
};

export default GetStarted;
