import axios from 'axios';
import { CONFIG } from '../../config';
import { supabase } from '../services/supabase.js';

const BASE_URL = CONFIG.URL;

// gemini
export const fetchLLMResponse = async (text, sentiment) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.access_token) {
      throw new Error("No valid session/token found");
    }

    const response = await axios.post(
      `${BASE_URL}/gemini`,
      { text, sentiment }, 
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`, // 👈 pass token here
        },
      }
    );

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

