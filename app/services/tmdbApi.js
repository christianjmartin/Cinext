import axios from 'axios';
import {CONFIG} from '../../config.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'; 
const TMDB_API_KEY = CONFIG.TMDB_API_KEY; 

export const fetchMovieDetails = async (query) => {
  const [movieTitle, year] = query.split('^').map(part => part.trim()); 
  console.log("Year:", year);

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

    console.log("Directors:", directors);

  


    return {
      title: movie.title || 'Unknown',
      director: directors.join(', ') || 'Unknown',
      posterPath: movie.poster_path || null,
      releaseDate: movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown',
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
      description: movie.overview || 'No description avaliable',
    };
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    throw error;
  }
};
