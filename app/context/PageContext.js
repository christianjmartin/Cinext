import React, { useRef, createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getRequestsLeft } from '../database/dbFuncs';
import { createClient } from '../database/createClient';
import { supabase } from '../services/supabase.js';
import { getMOTD } from '../database/dbFuncs';
import { getAppStatus } from '../services/apiComms.js';
import { Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { useGoogleConnectionMonitor } from '../services/useGoogleConnectionMonitor';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [page, setPage] = useState("Recs");
  // const [previousPage, setPreviousPage] = useState(null);
  const [movieList, setList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [staticMovie, setStaticMovie] = useState(null);
  const [colorMode, setColorMode] = useState("dark");
  const colorScheme = useColorScheme();
  const [navColorMode, setNavColorMode] = useState("black"); // background color for dark mode
  const [movieOTD, setMovieOTD] = useState({});
  const [seenFilms, setSeenFilms] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [suggestSeen, setSuggestSeen] = useState(false);
  const [suggestWatchlist, setSuggestWatchlist] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true);
  const [currSortSeen, setCurrSortSeen] = useState('Date Added 1');
  const [currSortWatchlist, setCurrSortWatchlist] = useState('Date Added 1');
  const [requestCount, setRequestCount] = useState();
  const [requestCountDate, setRequestCountDate] = useState();
  const [loading, setLoading] = useState(false);
  const [listInit, setListInit] = useState(false);
  const lastSeenFilmsFetch = useRef(0);
  const lastWatchlistFetch = useRef(0); 
  const initStatusCheck = useRef(true);
  const alertedStatusDown = useRef(false);
  useGoogleConnectionMonitor(setPage);



  useEffect(() => {
    if (page === "offline") { return; }
    const appStatusChecker = async () => {
      if (page === "offline") { return; }
      const status = await getAppStatus();
      // console.log("checking status ...")
      // console.log(initStatusCheck.current);
      if (status.off) {
        // console.log(alertedStatusDown.current);
        if (initStatusCheck.current) {
          initStatusCheck.current = false;
          alertedStatusDown.current = true;
          setPage("maintenance");
        }
        else if (!alertedStatusDown.current) {
          Alert.alert("Cinext will shut down in 3 minutes for maintenance");
          alertedStatusDown.current = true;
          setTimeout(() => {
            setPage("maintenance");
          }, 180000);
        }
        return;
      }
      initStatusCheck.current = false;
    }
    appStatusChecker();

    const intervalId = setInterval(appStatusChecker, 3 * 60 * 1000);

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session) {
        // console.log("Token refreshed, storing new valuess");
        SecureStore.setItemAsync("session", JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        }));
      }
    });

    const initializeClient = async () => {
        try {
            const preferences = await createClient(colorScheme);

            if (preferences?.offline) {
              // console.log("App launched offline — skipping Supabase setup.");
              setPage("offline");
              return;
            }

            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${month}-${day}`;
            const todaysFilm = await getMOTD(formattedDate);
            setMovieOTD(todaysFilm);

            if (preferences.id) setUserId(preferences.id);
            const reqs = await getRequestsLeft();
            setRequestCount(reqs);
            const todayCST = new Date().toLocaleDateString('en-CA', {
              timeZone: 'America/Chicago',
            });
            setRequestCountDate(todayCST);

            if (!preferences) {
                console.error("Error: createClient() returned null or undefined.");
                return;
            }

            // console.log("Loaded Preferences:");
            
            // Update context states safely
            if (preferences.navColor) setNavColorMode(preferences.navColor)
            if (preferences.color) setColorMode(preferences.color);
            if (preferences.suggestSeen !== undefined) setSuggestSeen(preferences.suggestSeen);
            if (preferences.suggestWatchlist !== undefined) setSuggestWatchlist(preferences.suggestWatchlist);

            // setInitialLoad(false);
        } catch (error) {
            console.error("Error initializing client:", error);
        }
        finally {
          setTimeout(() => {
            setInitialLoad(false);
          }, 1500);
        }
    };

    initializeClient();

    return () => {
      authListener.subscription?.unsubscribe();
      clearInterval(intervalId); 
    }
  }, [setColorMode, setSuggestSeen, setSuggestWatchlist, setRequestCount, setMovieOTD]);




  // this function handles updating components for page views
  // sets previous page for easy back button logic 
  const updatePage = (newPage) => {
    // setPreviousPage(page);
    setPage(newPage);
  };

  const updateMovieList = (newList) => {
    // console.log("updating list of movies for context");
    setList(newList);
  };

  // updates the colorMode variable for toggling dark vs light mode 
  const updateColorMode = () => {
    // prob gonna want to update this for the user so it holds, like storage or supabase
    if (colorMode === "light") {
      setColorMode("dark");
    }
    else { setColorMode("light") };
  }

  return (
    <PageContext.Provider value={{ page, updatePage, movieList, updateMovieList, userId, staticMovie, setStaticMovie, updateColorMode, colorMode, movieOTD, setMovieOTD, seenFilms, setSeenFilms, watchlist, setWatchlist, suggestSeen, suggestWatchlist, setSuggestSeen, setSuggestWatchlist, initialLoad, currSortSeen, setCurrSortSeen, currSortWatchlist, setCurrSortWatchlist, requestCount, setRequestCount, loading, setLoading, listInit, setListInit, requestCountDate, setRequestCountDate, lastSeenFilmsFetch, lastWatchlistFetch, navColorMode, setNavColorMode}}>
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
