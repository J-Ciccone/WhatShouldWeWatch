import MovieCard from "./MovieCard";

const MovieSearchList = ({ movieSearchResults, loading }) => {
  return (
    <div className="text-align-center card-container row py-5 px-3 justify-content-center">
      {loading && <div className="my-5">Loading...</div>}
      {!loading &&
        movieSearchResults.length > 0 &&
        movieSearchResults.map((movie) => (
          <div key={movie.id} className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-2 mb-4">
            <div className="h-100" >
              <MovieCard movie={movie}></MovieCard>
            </div>
          </div>
        ))}
      {!loading && movieSearchResults.length === 0 && (
        <h4 className="my-5">No results to show yet. Try searching!</h4>
      )}
    </div>
  );
};

export default MovieSearchList;
