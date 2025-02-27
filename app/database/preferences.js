import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase.js';

export const updateColorPreference = async ( color, userId ) => {
    console.log(color);
    try {
        const {data, error} = await supabase
            .from('Client')
            .update({Color: color})
            .eq('UserID', userId)

        console.log("updating color pref to ", color);
    }
    catch (error) {
        console.error('bruh', error);
    }
}

export const updateSuggestionSeenPreference = async ( bool, userId ) => {
    try {
        const {data, error} = await supabase
            .from('Client')
            .update({SuggestSeen: bool})
            .eq('UserID', userId)

        console.log("updating color pref to ", bool);
    }
    catch (error) {
        console.error('bruh', error);
    }
}

export const updateSuggestionWatchlistPreference = async ( bool, userId) => {
    try {
        const {data, error} = await supabase
            .from('Client')
            .update({SuggestWatchlist: bool})
            .eq('UserID', userId)

        console.log("updating color pref to ", bool);
    }
    catch (error) {
        console.error('bruh', error);
    }

}


