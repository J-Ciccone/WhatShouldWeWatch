import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../../Services/LobbyService";
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
    <>
      <div
        className="winner-img"
        style={{
          backgroundImage: `linear-gradient(#393e41, rgba(20, 20, 20, 0.579)),url(${winner.image})`,
        }}
      />
      <div
        className="row  justify-content-center text-align-center"
        style={{ color: "black" }}
      >
        <div className="col-sm-2 mb-3 col-md-4 p-4 g-card winner-row">
          <h2 className="">{`Let's Watch...`}</h2>
          <div
            style={{
              height: "40vh",
              background: `url(${winner.image}) center/contain no-repeat`,
            }}
          ></div>
          <h2 className="mt-4 text-align-center">{`${winner.title}!`}</h2>
          <div>
            <Button className="btn-primary" onClick={() => exitGame()}>
              Exit Lobby
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EndGameScreen;
