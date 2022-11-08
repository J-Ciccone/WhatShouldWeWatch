import Form from "react-bootstrap/Form";
import { useContext, useState } from "react";
import { Container } from "react-bootstrap";
import "./MovieSearch.css";
import { MovieListContext } from "../../Context";
import MovieService from "../../Services/MovieService";
import MoviePickList from "./MoviePickList";

const MovieSearch = ({ setLoading, setMovieSearchResults }) => {
  const movContext = useContext(MovieListContext);

  const [search, setSearch] = useState("");

  const submitHandler = () => {
    getMovie(search);
  };

  const getMovie = async (search) => {
    setLoading(true);
    const data = await MovieService.searchMovie(search);
    setLoading(false);
    setMovieSearchResults(data.results);
  };

  return (
    <>
      <div className="search p-3 row">
        <div className="col-xs-12 col-md-8 text-align-center">
          <Form.Text muted>
            Enter the name of the movie you would like to pick
          </Form.Text>
          <div className="input-group mb-3">
            <input
              className="form-control lobby-code-input"
              aria-label="movieSearch"
              aria-describedby="movieSearch"
              type="text"
              id="movieSearch"
              placeholder="Your favorite movie..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-primary join-vote-button btn-round"
              type="button"
              id="movieSearch"
              onClick={submitHandler}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
          <div>{`SELECT: ${movContext.lobbyData.numMovies} MOVIES(S)`}</div>
        </div>
      </div>
      <div className="movie-picks">
        <MoviePickList></MoviePickList>
      </div>
    </>
  );
};

export default MovieSearch;
