import axios from 'axios';
import {CONFIG} from '../../config.js';

const API_KEY = CONFIG.GEMINI_API_KEY;

// fetches the response from the gemini API, passing in a full prompt for getting film reccomendations
export const fetchLLMResponse = async (text) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: text }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;  
  } catch (error) {
    console.error('Error fetching from Gemini:', error);
    throw error; 
  }
};
