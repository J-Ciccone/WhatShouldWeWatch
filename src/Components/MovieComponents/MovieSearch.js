import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useContext, useState } from "react";
import { Container } from "react-bootstrap";
import "./MovieSearch.css";
import { MovieListContext } from "../../Context";
import MovieService from "../../Services/MovieService";
import MoviePickList from "./MoviePickList";

const MovieSearch = ({ setLoading, setMovieSearchResults,lobbyData }) => {
  const movContext = useContext(MovieListContext);

  const [search, setSearch] = useState("");

  const submitHandler = (event) => {
    event.preventDefault();
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
      <Row className="search">
        <Col className="col-auto g-card search-form">
          <Form onSubmit={submitHandler}>
            <Form.Group>
              <h3 className="text-align-center" htmlFor="movieSearch">
                Search for a movie
              </h3>
              <Form.Control
                className="movieSearchInput"
                type="text"
                id="movieSearch"
                placeholder="Your favorite movie..."
                onChange={(e) => setSearch(e.target.value)}
              />
              <Form.Text muted>
                Enter the name of the movie you would like to pick
              </Form.Text>
            </Form.Group>
            <div className="d-grid">
              <Button variant="primary" className="btn-round" size="sm" type="submit">
                Search
              </Button>
            </div>
            <small>{`SELECT: ${movContext.lobbyData.numMovies} MOVIES(S)`}</small>
          </Form>
        </Col>
        <Col className="col-auto">
          <MoviePickList></MoviePickList>
        </Col>
      </Row>
    </>
  );
};

export default MovieSearch;
