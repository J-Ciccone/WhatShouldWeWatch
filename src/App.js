import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PlayerLobbyPage from "./Pages/PlayerLobbyPage";
import MyNavBar from "./Components/MyNavBar";
import HomePage from "./Pages/HomePage";
import NewVoteSetup from "./Components/NewVoteSetup";
import RandomMoviePage from "./Pages/RandomMoviePage";
//No clue why appbar doesn't work for custom component
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/lobby/*" element={<PlayerLobbyPage />} />
          <Route path="/home/new-vote" element={<NewVoteSetup />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
