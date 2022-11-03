import MovieSearch from "./MovieSearch";
import { MovieListContext } from "../../Context";
import MovieSearchList from "./MovieSearchList";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { Container, Row } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";
import "./MovieLobby.css";

const MovieLobby = ({ lobbyData, userId, lobbyCode }) => {
  const [movieSearchResults, setMovieSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moviePickIDs, setPickIDs] = useState([]);
  const [show, setShow] = useState(false);
  const [toastText, setToastText] = useState("");


  useEffect(()=>{
    const localMovieList = localStorage.getItem("entries")
    localMovieList && setPickIDs(JSON.parse(localMovieList))
  
  },[])

  return (
    <>
      <Container className="s g-card">
        <MovieListContext.Provider
          value={{
            setPickIDs,
            lobbyData,
            moviePickIDs,
            setShow,
            setToastText,
            userId,
            lobbyCode,
          }}
        >
          <Row className=" p-3">
            <MovieSearch
              setLoading={setLoading}
              setMovieSearchResults={setMovieSearchResults}
              toastText={toastText}
              lobbyData={lobbyData}
            ></MovieSearch>
          </Row>
          <Row style={{ marginTop:"10px"}}>
            <MovieSearchList
              movieSearchResults={movieSearchResults}
              loading={loading}
            ></MovieSearchList>
          </Row>
        </MovieListContext.Provider>
      </Container>
      <Toast
        onClose={() => setShow(false)}
        show={show}
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
