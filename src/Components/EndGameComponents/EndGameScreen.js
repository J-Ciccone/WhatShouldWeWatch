import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./EndGame.css";
const EndGameScreen = ({ movies, lobbyData }) => {
  const navigate = useNavigate();

  console.log(movies);
  let keys = Object.keys(movies);
  keys = keys.sort((a, b) => {
    if (movies[a].votes < movies[b].votes) return 1;
    if (movies[a].votes > movies[b].votes) return -1;
    return 0;
  });

  const winner = movies[keys[0]];
  const exitGame = async () => {
    navigate(`/home`);
  };
  return (
    <div className="row justify-content-center ">
      <div className="row justify-content-center ">
        <div className="card col-md-8 col-xs-12 mb-3 p-0 rounded">
          <div className="row g-0 ">
            <div className="col-md-8  p-5">
              <div className="card-body" style={{color:"black"}}>
              <h5 className="card-title pb-4">Let's Watch</h5>
                <h2 className="card-title pb-2"><strong>{winner.title}</strong></h2>
                <p className="card-text">
                  {winner.plot}
                </p>
                <p className="card-text">
                  <small className="text-muted">{winner.description}</small>
                </p>
              </div>
            </div>
            <div class="col-md-4">
              <img
                src={winner.image}
                className="img-fluid rounded-start"
                alt="..."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 pb-5" style={{ width: "fit-content" }}>
        <Button className="btn-primary" onClick={() => exitGame()}>
          Exit Lobby
        </Button>
      </div>
    </div>
  );
};

export default EndGameScreen;
