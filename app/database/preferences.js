import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase.js';
import { v4 as uuidv4, validate as isUUID } from 'uuid';

export const updateColorPreference = async ( color, userId ) => {
    // console.log(color);
    try {
        const {data, error} = await supabase
            .from('Client')
            .update({Color: color})
            .eq('AuthID', userId)

        // console.log("updating color pref");
    }
    catch (error) {
        console.error("error updating color pref");
    }
}

export const updateSuggestionSeenPreference = async ( bool, userId ) => {
    try {
        const {data, error} = await supabase
            .from('Client')
            .update({SuggestSeen: bool})
            .eq('AuthID', userId)

        // console.log("updating seen films inclusion pref");
    }
    catch (error) {
        console.error("error updating seen pref");
    }
}

export const updateSuggestionWatchlistPreference = async (bool, userId) => {
    try {
        const { data, error } = await supabase
            .from('Client')
            .update({ SuggestWatchlist: bool })
            .eq('AuthID', userId) // Ensuring it's treated as UUID
            .select(); // Returns the updated row

        if (error) throw error;

        // console.log("Updating watchlist inclusion pref");
    } catch (error) {
        console.error("error updating watchlist pref");
    }
};



