import React, { createContext, useState, useEffect } from 'react';
import { getRequestsLeft } from '../database/dbFuncs';
import { createClient } from '../database/createClient';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [page, setPage] = useState("Recs");
  // const [previousPage, setPreviousPage] = useState(null);
  const [movieList, setList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [staticMovie, setStaticMovie] = useState(null);
  const [colorMode, setColorMode] = useState("dark");
  const [movieOTD, setMovieOTD] = useState({});
  const [seenFilms, setSeenFilms] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [suggestSeen, setSuggestSeen] = useState(false);
  const [suggestWatchlist, setSuggestWatchlist] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true);
  const [currSortSeen, setCurrSortSeen] = useState('Date Added 1');
  const [currSortWatchlist, setCurrSortWatchlist] = useState('Date Added 1');
  const [requestCount, setRequestCount] = useState();
  const [loading, setLoading] = useState(false);  

  useEffect(() => {
    const initializeClient = async () => {
        try {
            const preferences = await createClient();
            if (preferences.id) setUserId(preferences.id);
            const reqs = await getRequestsLeft();
            setRequestCount(reqs);

            if (!preferences) {
                console.error("Error: createClient() returned null or undefined.");
                return;
            }

            console.log("Loaded Preferences:");
            
            // Update context states safely
            if (preferences.color) setColorMode(preferences.color);
            if (preferences.suggestSeen !== undefined) setSuggestSeen(preferences.suggestSeen);
            if (preferences.suggestWatchlist !== undefined) setSuggestWatchlist(preferences.suggestWatchlist);

        } catch (error) {
            console.error("Error initializing client:");
        }
        finally {
          setInitialLoad(false);
        }
    };

    // if (userId) {
        initializeClient();
    // }
  }, [setColorMode, setSuggestSeen, setSuggestWatchlist, setRequestCount]);




  // this function handles updating components for page views
  // sets previous page for easy back button logic 
  const updatePage = (newPage) => {
    // setPreviousPage(page);
    setPage(newPage);
  };

  const updateMovieList = (newList) => {
    console.log("updating list of movies for context");
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
    <PageContext.Provider value={{ page, updatePage, movieList, updateMovieList, userId, staticMovie, setStaticMovie, updateColorMode, colorMode, movieOTD, setMovieOTD, seenFilms, setSeenFilms, watchlist, setWatchlist, suggestSeen, suggestWatchlist, setSuggestSeen, setSuggestWatchlist, initialLoad, currSortSeen, setCurrSortSeen, currSortWatchlist, setCurrSortWatchlist, requestCount, setRequestCount, loading, setLoading}}>
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
