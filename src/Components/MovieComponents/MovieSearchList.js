import { useContext, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import MovieCard from "./MovieCard";
import "./MovieSearchList.css";

const MovieSearchList = ({ movieSearchResults, loading, setMovieList }) => {
  return (
    <Container>
      <Row className="text-align-center justify-content-center">
        {loading && <div className="my-5 text-shadow">Loading...</div>}
        {!loading &&
          movieSearchResults.length > 0 &&
          movieSearchResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                setMovieList={setMovieList}
                buttonText={"Select"}
              ></MovieCard>
          ))}
        {!loading && movieSearchResults.length === 0 && (
          <div className="my-5 text-shadow">No results to show yet. Try searching!</div>
        )}
      </Row>
    </Container>
  );
};

export default MovieSearchList;
