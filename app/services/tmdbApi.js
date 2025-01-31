import axios from 'axios';
import {CONFIG} from '../../config.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'; 
const TMDB_API_KEY = CONFIG.TMDB_API_KEY; 

export const fetchMovieDetails = async (query) => {
  const [movieTitle, year] = query.split('^').map(part => part.trim()); 
  // console.log("Year:", year);

  try {
    // Search for the movie by title and year
    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: movieTitle,
        year: parseInt(year, 10), // make sure it is the right movie narrowing down by the year 
      },
    });

    const movies = searchResponse.data.results;

    if (!movies || movies.length === 0) {
      return null; // No results found
    }

    // Return first movie to come up in the search 
    const movie = movies[0]; 

    // Fetch movie credits to get directors
    const creditsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}/credits`, {
      params: { api_key: TMDB_API_KEY },
    });

    // filter the crew by the job bein director
    const directors = creditsResponse.data.crew
      .filter(person => person.job === 'Director')
      .map(director => director.name); 

    // console.log("Directors:", directors);

    return {
      tmdbID: movie.id || null,
      Title: movie.title || 'Unknown',
      Director: directors.join(', ') || 'Unknown',
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





export const searchMovies = async (query) => {
  try {
    // Call TMDB's search API
    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query.trim(), // Trim whitespace from the search query
      },
    });

    const movies = searchResponse.data.results;

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






export const fetchMovieCredits = async (tmdbID) => {
  console.log("FANUM TAXXXX")
  try {
    const creditsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbID}/credits`, {
      params: { api_key: TMDB_API_KEY },
    });

    const directors = creditsResponse.data.crew
      .filter(person => person.job === 'Director')
      .map(director => director.name);

    console.log(directors.join(', '));
    return directors.join(', '); // Combine director names into a single string
  } catch (error) {
    console.error('Error fetching credits:', error.message);
    return 'Unknown';
  }
};