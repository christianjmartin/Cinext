import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase.js';

/**
 * Fetches client data from Supabase or creates a new entry if none exists.
 * Updates context state accordingly.
 */
export const createClient = async ({userId}) => {
  try {
    // Fetch existing user settings
    const { data, error } = await supabase
      .from('Client')
      .select('UserID, Color, SuggestSeen, SuggestWatchlist')
      .eq('UserID', userId)
      .single(); // Ensures we get only one result

    if (error && error.code !== 'PGRST116') {
      console.error('Error retrieving client data:', error.message);
      return null;
    }

    // If user does not exist, insert default settings
    if (!data) {
      console.log('New client detected, inserting default settings...');
      const { error: insertError } = await supabase
        .from('Client')
        .insert([{ UserID: userId, Color: 'light', SuggestSeen: false, SuggestWatchlist: false }]);

      if (insertError) {
        console.error('Error creating new client:', insertError.message);
        return null;
      }

      // Return default values
      return { id: userId, color: 'light', suggestSeen: false, suggestWatchlist: false };
    }

    // // If user exists, update context state
    // setColorMode(data.Color);
    // setSuggestSeen(data.SuggestSeen);
    // setSuggestWatchlist(data.SuggestWatchlist);

    console.log('Client data loaded:', data);
    
    return {
      id: userId,
      color: data.Color,
      suggestSeen: data.SuggestSeen,
      suggestWatchlist: data.SuggestWatchlist
    };

  } catch (error) {
    console.error('Unexpected error retrieving or creating client:', error);
    return null;
  }
};
