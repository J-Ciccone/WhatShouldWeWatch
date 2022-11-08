import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import MovieLobby from "../Components/MovieComponents/MovieLobby";
import VALUES from "../Values";
import Vote from "../Components/VotingComponents/Vote";
import EndGameScreen from "../Components/EndGameComponents/EndGameScreen";
import { useNavigate } from "react-router-dom";

const PlayerLobbyPage = () => {
  const navigate = useNavigate();
  const [lobbyData, setLobbyData] = useState({});

  const lobbyCode = localStorage.getItem("lobbyCode");
  const userId = localStorage.getItem("user");

  useEffect(() => {
    const dbRef = getDatabase();
    const lobbyRef = ref(dbRef, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      setLobbyData(data);
      console.log(data.users[userId]);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <>
      <div style={{ height: "100%" }}>
        <div className="row justify-content-center text-align-center">
          <div
            className="l"
            style={{ height: "200px", width: "200px", cursor: "pointer", zIndex: 9 }}
            onClick={() => navigate(`/home`)}
          ></div>
          <h2>{`Lobby Code: ${lobbyCode}`}</h2>
        </div>

        {lobbyData.stage === VALUES.PICKING && (
          <MovieLobby
            lobbyData={lobbyData}
            userId={userId}
            lobbyCode={lobbyCode}
          ></MovieLobby>
        )}
        {lobbyData.stage === VALUES.VOTING && (
          <Vote lobbyData={lobbyData} userId={userId}></Vote>
        )}
        {lobbyData.stage === VALUES.DONE && (
          <EndGameScreen
            movies={lobbyData.movies}
            lobbyData={lobbyData}
          ></EndGameScreen>
        )}
      </div>
    </>
  );
};

export default PlayerLobbyPage;
