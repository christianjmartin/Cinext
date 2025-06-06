import axios from 'axios';
import { CONFIG } from '../../config';
import { supabase } from '../services/supabase.js';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = CONFIG.URL;

// gemini
export const fetchLLMResponse = async (choice, sentiment, excludeList) => {
  try {
    // console.log(choice)
    // console.log(sentiment)
    // console.log("exclude list-----", excludeList)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.access_token) {
      throw new Error("No valid session/token found");
    }

    await SecureStore.setItemAsync("session", JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    }));

    const response = await axios.post(
      `${BASE_URL}/gemini`,
      { choice, sentiment, excludeList }, 
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`, // 👈 pass token here
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error connecting to backend:');
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
    console.error('Error fetching movie data:');
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
    console.error('Error fetching movie data:');
    throw error;
  }
};


export const fetchMovieSearch = async (searchQuery) => {
  try {
    const response = await axios.get(`${BASE_URL}/movieSearch`, {
      params: { query: searchQuery },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:');
    throw error;
  }
};

export const getAppStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/appStatus`, {});
    return response.data;
  } catch (error) {
    console.error('Error getting app status');
    throw error;
  }
}


export const fetchStreaming = async (movieID) => {
  try {
    const response = await axios.get(`${BASE_URL}/Streaming`, {
      params: { query: movieID },
    });
    // console.log("the response is: ", response.data);
    return response.data
  } catch (error) {
    console.error('Error fetching movie data:', error);
    throw error;
  }
};


