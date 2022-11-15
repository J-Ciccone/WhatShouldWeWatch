import MovieSearch from "./MovieSearch";
import { MovieListContext } from "../../Context";
import MovieSearchList from "./MovieSearchList";
import { useEffect, useState } from "react";
import Toast from "react-bootstrap/Toast";

const MovieLobby = ({ lobbyData, userId, lobbyCode }) => {
  const [movieSearchResults, setMovieSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moviePickIDs, setPickIDs] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  useEffect(() => {
    const localMovieList = localStorage.getItem("entries");
    localMovieList && setPickIDs(JSON.parse(localMovieList));
    
  }, []);

  return (
    <>
      <MovieListContext.Provider
        value={{
          setPickIDs,
          lobbyData,
          moviePickIDs,
          setShowToast,
          setToastText,
          toastText,
          userId,
          lobbyCode,
        }}
      >
        
          <MovieSearch
            setLoading={setLoading}
            setMovieSearchResults={setMovieSearchResults}
            lobbyData={lobbyData}
          ></MovieSearch>
       
          <MovieSearchList
            movieSearchResults={movieSearchResults}
            loading={loading}
          ></MovieSearchList>
      </MovieListContext.Provider>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        className="toast"
      >
        <Toast.Body>{toastText}</Toast.Body>
      </Toast>
    </>
  );
};

export default MovieLobby;
