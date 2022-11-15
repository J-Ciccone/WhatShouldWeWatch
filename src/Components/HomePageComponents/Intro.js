import "./Intro.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import "./Intro.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addUserToLobby } from "../../Services/LobbyService";
import Toast from "react-bootstrap/Toast";

//TODO Add new screens to set rules for the new room, or just join a room if it is able to be joined
const Intro = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const enterLobby = async () => {
    localStorage.setItem("entries", []);
    addUserToLobby(code).then((valid) => {
      if (valid) {
        navigate(`/lobby/${code}`);
      } else {
        setShowToast(true);
        setCode("");
      }
    });
    localStorage.setItem("lobbyCode", code);
  };
  return (
    <>
      <div className="intro-container ml-5 drop-shadow container-fluid">
        <div className="intro-text-container">
          <div className="intro-text">What Should We Watch?</div>
          <div>
            <strong>
              <em className="intro-text-small">
                Movie night has never been so easy
              </em>
            </strong>
          </div>
          <div className="get-started row">
            <div className="col-auto">
              <Button
                className="my-2 start-vote-button btn-round"
                variant="primary"
                size="sm"
                type="submit"
                onClick={() => navigate("/home/new-vote")}
              >
                Start New Vote
              </Button>
            </div>
            <div className="col-md-auto col-sm-12">OR</div>
            <div className="col-auto">
              <div className="">
                Enter a lobby code to join a vote in progress
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  value={code}
                  className="form-control lobby-code-input"
                  placeholder="Lobby Code"
                  aria-label="Lobby Code"
                  aria-describedby="basic-addon2"
                  onChange={(e) => setCode(e.target.value)}
                />
                <div className="input-group-append ">
                  <button
                    className="btn btn-primary join-vote-button btn-round"
                    type="button"
                    disabled={!(code.length === 6) && true}
                    onClick={() => enterLobby()}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-img"></div>
      </div>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
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

export default Intro;
