import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase.js';
import NetInfo from '@react-native-community/netinfo';


/**
 * Fetches client data from Supabase or creates a new entry if none exists.
 * Updates context state accordingly.
 */

const checkInternetConnection = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 sec timeout
  
    try {
      const response = await fetch("https://clients3.google.com/generate_204", {
        method: "GET",
        cache: "no-cache",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.status === 204;
    } catch (e) {
      clearTimeout(timeout);
      return false;
    }
};

export const createClient = async (colorScheme) => {
    try {
        const hasConnection = await checkInternetConnection();
        if (!hasConnection) {
            console.warn("Confirmed no internet — skipping Supabase calls.");
            return { offline: true };
        }

        // restore an existing session
        const storedSession = await SecureStore.getItemAsync("session");

        if (storedSession) {
            // console.log("Restoring existing session...");
            const parsedSession = JSON.parse(storedSession);

            // Restore session in Supabase
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession(parsedSession);

            // const { data: sessionData, error: sessionError } = await supabase.auth.setSession("diosjsooj");

            if (!sessionError && sessionData?.session) {
                // console.log("Session successfully restored!!!:");

                // Use the existing user ID
                return await fetchClientData(sessionData.session.user.id);
            } else {
                console.warn("Session restoration failed, signing in anonymously...");
                //await SecureStore.deleteItemAsync("session"); // Clear invalid session
            }
        }

        // no valid session, sign in anonymously
        // console.log("No session found, signing in anonymously...");
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

        if (signInError) {
            console.error("Anonymous sign-in failed:");
            return null;
        }

        // console.log("Signed in anonymously:");

        // retrieve the new session
        const { data: newSessionData } = await supabase.auth.getSession();

        if (!newSessionData?.session) {
            console.error("Failed to retrieve new session.");
            return null;
        }

        // await SecureStore.setItemAsync("session", JSON.stringify(newSessionData.session));
        await SecureStore.setItemAsync("session", JSON.stringify({
            access_token: newSessionData.session.access_token,
            refresh_token: newSessionData.session.refresh_token
          }));

        return await fetchClientData(signInData.user.id, colorScheme);

    } catch (error) {
        console.error("Unexpected error in createClient:");
        return null;
    }
};

/**
 * Fetches user settings from Supabase or inserts default settings if user is new.
 */
const fetchClientData = async (userId, colorScheme) => {
    try {
        // Fetch existing user settings from the "Client" table
        const { data: clientData, error: clientError } = await supabase
            .from('Client')
            .select('Color, SuggestSeen, SuggestWatchlist, NavColor')
            .eq('AuthID', userId)
            .single();

        if (clientError && clientError.code !== 'PGRST116') {
            console.error('Error retrieving client data:');
            return null;
        }

        // If user does not exist, insert default settings
        if (!clientData) {
            const defaultColor = colorScheme === 'dark' ? 'dark' : 'light';
            const defaultNavColor = colorScheme === 'dark' ? 'black' : 'red';
            // console.log('New client detected, inserting default settings...');
            const { error: insertError } = await supabase
                .from('Client')
                .insert([{Color: defaultColor, SuggestSeen: false, SuggestWatchlist: false, NavColor: defaultNavColor }]);

            if (insertError) {
                console.error('Error creating new client:');
                return null;
            }

            return { id: userId, color: defaultColor, suggestSeen: false, suggestWatchlist: false, navColor: defaultNavColor };
        }

        // console.log('Client data loaded:');

        return {
            id: userId,
            color: clientData.Color,
            navColor: clientData.NavColor,
            suggestSeen: clientData.SuggestSeen,
            suggestWatchlist: clientData.SuggestWatchlist
        };

    } catch (error) {
        console.error('Unexpected error retrieving or creating client:');
        return null;
    }
};
