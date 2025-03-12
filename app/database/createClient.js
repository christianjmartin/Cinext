import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase.js';

/**
 * Fetches client data from Supabase or creates a new entry if none exists.
 * Updates context state accordingly.
 */
export const createClient = async () => {
    try {
        // restore an existing session
        const storedSession = await SecureStore.getItemAsync("session");

        if (storedSession) {
            console.log("Restoring existing session...");
            const parsedSession = JSON.parse(storedSession);

            // Restore session in Supabase
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession(parsedSession);

            if (!sessionError && sessionData?.session) {
                console.log("Session successfully restored:", sessionData.session);

                // Use the existing user ID
                return await fetchClientData(sessionData.session.user.id);
            } else {
                console.warn("Session restoration failed, signing in anonymously...");
                await SecureStore.deleteItemAsync("session"); // Clear invalid session
            }
        }

        // no valid session, sign in anonymously
        console.log("No session found, signing in anonymously...");
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

        if (signInError) {
            console.error("Anonymous sign-in failed:", signInError);
            return null;
        }

        console.log("Signed in anonymously:", signInData.user);

        // retrieve the new session
        const { data: newSessionData } = await supabase.auth.getSession();

        if (!newSessionData?.session) {
            console.error("Failed to retrieve new session.");
            return null;
        }

        await SecureStore.setItemAsync("session", JSON.stringify(newSessionData.session));

        return await fetchClientData(signInData.user.id);

    } catch (error) {
        console.error("Unexpected error in createClient:", error);
        return null;
    }
};

/**
 * Fetches user settings from Supabase or inserts default settings if user is new.
 */
const fetchClientData = async (userId) => {
    try {
        // Fetch existing user settings from the "Client" table
        const { data: clientData, error: clientError } = await supabase
            .from('Client')
            .select('Color, SuggestSeen, SuggestWatchlist')
            .eq('AuthID', userId)
            .single();

        if (clientError && clientError.code !== 'PGRST116') {
            console.error('Error retrieving client data:', clientError.message);
            return null;
        }

        // If user does not exist, insert default settings
        if (!clientData) {
            console.log('New client detected, inserting default settings...');
            const { error: insertError } = await supabase
                .from('Client')
                .insert([{Color: 'dark', SuggestSeen: false, SuggestWatchlist: false }]);

            if (insertError) {
                console.error('Error creating new client:', insertError.message);
                return null;
            }

            return { id: userId, color: 'dark', suggestSeen: false, suggestWatchlist: false };
        }

        console.log('Client data loaded:', clientData);

        return {
            id: userId,
            color: clientData.Color,
            suggestSeen: clientData.SuggestSeen,
            suggestWatchlist: clientData.SuggestWatchlist
        };

    } catch (error) {
        console.error('Unexpected error retrieving or creating client:', error);
        return null;
    }
};
