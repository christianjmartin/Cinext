import axios from 'axios';
import { CONFIG } from '../../config';
import { supabase } from '../services/supabase.js';
import { Alert } from 'react-native'
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
          Authorization: `Bearer ${session.access_token}`, 
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error connecting to backend:');
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status == 401 && error.response.data.error == "Unauthorized") {
        // could call the access token getter from fetchLLM and RETRY then finally return data
        Alert.alert("Please update Cinext to use this feature");
        throw { fatal: true, message: "Unauthorized - app update required" };
      };
    }
    throw error;
  }
};



// tmdb movie data
export const fetchMovieData = async (movieTitle, year) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.access_token) {
    throw new Error("No valid session/token found");
  }

  // await SecureStore.setItemAsync("session", JSON.stringify({
  //   access_token: session.access_token,
  //   refresh_token: session.refresh_token
  // }));
  
  try {
    const response = await axios.get(`${BASE_URL}/movieDetails`, {
      params: { query: movieTitle, year },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:');
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status == 401 && error.response.data.error == "Unauthorized") {
        // could call the access token getter from fetchLLM and RETRY then finally return data
        Alert.alert("Please update Cinext to use this feature");
        throw { fatal: true, message: "Unauthorized - app update required" };
      };
    }
    throw error;
  }
};

export const fetchMovieDirectors = async (movieID) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.access_token) {
    throw new Error("No valid session/token found");
  }

  // await SecureStore.setItemAsync("session", JSON.stringify({
  //   access_token: session.access_token,
  //   refresh_token: session.refresh_token
  // }));

  try {
    const response = await axios.get(`${BASE_URL}/movieDirectors`, {
      params: { query: movieID },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
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
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status == 401 && error.response.data.error == "Unauthorized") {
        Alert.alert("Please update Cinext to use this feature");
        throw { fatal: true, message: "Unauthorized - app update required" };
      };
    }
    throw error;
  }
};


export const fetchMovieSearch = async (searchQuery) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.access_token) {
    throw new Error("No valid session/token found");
  }

  // await SecureStore.setItemAsync("session", JSON.stringify({
  //   access_token: session.access_token,
  //   refresh_token: session.refresh_token
  // }));
  

  try {
    const response = await axios.get(`${BASE_URL}/movieSearch`, {
      params: { query: searchQuery },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie data:');
    // console.log(error.response.status)
    // console.log(error.response.data.error)
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status == 401 && error.response.data.error == "Unauthorized") {
        Alert.alert("Please update Cinext to use this feature");
        throw { fatal: true, message: "Unauthorized - app update required" };
      };
    }
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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.access_token) {
    throw new Error("No valid session/token found");
  }

  // await SecureStore.setItemAsync("session", JSON.stringify({
  //   access_token: session.access_token,
  //   refresh_token: session.refresh_token
  // }));
  
  try {
    const response = await axios.get(`${BASE_URL}/Streaming`, {
      params: { query: movieID },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    console.log("the response is: ", response.data);
    return response.data
  } catch (error) {
    console.error('Error fetching movie data:', error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status == 401 && error.response.data.error == "Unauthorized") {
        Alert.alert("Please update Cinext to use this feature");
        throw { fatal: true, message: "Unauthorized - app update required" };
      };
    }
    throw error;
  }
};


