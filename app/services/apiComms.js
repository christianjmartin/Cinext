import axios from 'axios';
import { CONFIG } from '../../config';

const BASE_URL = CONFIG.URL;

// gemini
export const fetchLLMResponse = async (text, sentiment, userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/gemini`, {text, sentiment, userId});
    // console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error connecting to backend:', error);
    throw error;
  }
};




// tmdb movie data
export const fetchMovieData = async (movieTitle, year) => {
  try {
    const response = await axios.get(`${BASE_URL}/movieDetails`, {
      params: { query: movieTitle, year },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:', error);
    throw error;
  }
};

export const fetchMovieDirectors = async (movieID) => {
  try {
    const response = await axios.get(`${BASE_URL}/movieDirectors`, {
      params: { query: movieID },
    });
    if (response) {
      const directors = response.data.crew
        .filter(person => person.job === 'Director')
        .map(director => director.name); 
      return directors.join(', ');
    }
    else { return ('tf bruh')};
  } catch (error) {
    console.error('Error fetching movie data:', error);
    throw error;
  }
};


export const fetchMovieSearch = async (searchQuery) => {
  try {
    const response = await axios.get(`${BASE_URL}/movieSearch`, {
      params: { query: searchQuery },
    });
    // console.log("the response is: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:', error);
    throw error;
  }
};

