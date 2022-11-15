import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PlayerLobbyPage from "./Pages/PlayerLobbyPage";
import HomePage from "./Pages/HomePage";
import NewVoteSetup from "./Components/NewVoteSetup";

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
