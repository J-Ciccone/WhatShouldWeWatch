import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import MovieCard from "./MovieCard";
import "./MovieSearchList.css";

const MovieSearchList = ({ movieSearchResults, loading, setMovieList }) => {
  return (
    <div className="text-align-center card-container row  justify-content-center">
      {loading && <div className="my-5">Loading...</div>}
      {!loading &&
        movieSearchResults.length > 0 &&
        movieSearchResults.map((movie) => (
          <div
            className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-2 mb-4"
            key={movie.id}
          >
            <MovieCard
              movie={movie}
              setMovieList={setMovieList}
              buttonText={"Select"}
            ></MovieCard>
          </div>
        ))}
      {!loading && movieSearchResults.length === 0 && (
        <h4 className="my-5">No results to show yet. Try searching!</h4>
      )}
    </div>
  );
};

export default MovieSearchList;
