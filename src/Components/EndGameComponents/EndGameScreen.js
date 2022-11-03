import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../../Services/LobbyService";
const EndGameScreen = ({ movies , lobbyData}) => {
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
    navigate(`/home`)
    
  };
  return (
    <>
      <div>
        <h2 className="big my-5 text-align-center text-shadow">{`The Winner is...`}</h2>
        <div
          className="d-flex justify-content-center"
          style={{ height: "50vh" }}
        >
          <img alt="winner" src={winner.image} />
        </div>
        <h1 className="mt-4 big text-align-center text-shadow">{`${winner.title}!`}</h1>
        <div className="d-flex justify-content-center"><Button className="btn-secondary" onClick={()=>exitGame()}>Exit Lobby</Button></div>
        
      </div>
    </>
  );
};

export default EndGameScreen;
