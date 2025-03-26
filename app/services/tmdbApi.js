import { fetchMovieData, fetchMovieDirectors, fetchMovieSearch } from './apiComms.js';

// searches for a movie by the title and year from TMDB API 
// returns the FIRST movie in the results 
export const fetchMovieDetails = async (query) => {
  const [movieTitle, year] = query.split('^').map(part => part.trim()); 
  // console.log(movieTitle);
  try {
    const movieData = await fetchMovieData(movieTitle, parseInt(year, 10));
    const movies = movieData.results; 

    if (!movies || movies.length === 0) {
      return null; // No results found
    }

    const exactMatch = movies.find(movie => 
      movie.title.toLowerCase() === movieTitle.toLowerCase()
    );

    // Return exact matching title, or first movie to come up in the search
    // edge cases for films where the search is unexpected (TMDB) handled here
    // have to hard code due to limitations by TMDB API in narrowing searches
    let movie;
    if (query === "Mother ^ 2009") {
      movie = movies.find(m => m.release_date === "2009-05-28") || null;
    } 
    else if (query === "Silence of the Lambs ^ 1991") {
      movie = movies.find(m=>m.title === "The Silence of the Lambs" || null);
    }
    else if (query === "Seven ^ 1995") {
      movie = movies.find(m=>m.title === "Se7en" || null);
    }
    else if (query === "Insomnia ^ 2002") {
      movie = movies.find(m=>m.release_date === "2002-05-24" || null);
    }
    else {
      movie = exactMatch || movies[0];
    }

    if (movie === null) {
      return null;
    }

    // Fetch movie credits to get directors
    const directors = await fetchMovieDirectors(movie.id);

    return {
      tmdbID: movie.id || null,
      Title: movie.title || 'Unknown',
      Director: directors || 'Unknown',
      PosterPath: movie.poster_path || null,
      Year: movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown',
      Rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
      Description: movie.overview || 'No description avaliable',
    };
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    throw error;
  }
};



// searches for a movie via the user's query 
// returns all movies in the result
export const searchMovies = async (query) => {
  try {
    // Call TMDB's search API
    const movieData = await fetchMovieSearch(query.trim());
    const movies = movieData.results;
    if (!movies || movies.length === 0) {
      return []; // Return an empty array if no results are found
    }

    // Map over the movies to extract only the basic details
    return movies.map(movie => ({
      tmdbID: movie.id,
      Title: movie.title || 'Unknown',
      PosterPath: movie.poster_path || null,
      Year: movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown',
      Rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
      Description: movie.overview || 'No description available',
    }));
  } catch (error) {
    console.error('Error searching movies:', error.message);
    throw error;
  }
};