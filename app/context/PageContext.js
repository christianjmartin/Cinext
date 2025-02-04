import React, { createContext, useState, useEffect } from 'react';
import { getOrCreateUserId } from '../services/userID';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [page, setPage] = useState("Recs");
  const [previousPage, setPreviousPage] = useState(null);
  const [movieList, setList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [staticMovie, setStaticMovie] = useState(null);
  const [colorMode, setColorMode] = useState("light");
  const [movieOTD, setMovieOTD] = useState({});

  // initialize userId when the context is created
  useEffect(() => {
    const initializeUserId = async () => {
      const id = await getOrCreateUserId();
      setUserId(id);
    };

    initializeUserId();
  }, []);



  // this function handles updating components for page views
  // sets previous page for easy back button logic 
  const updatePage = (newPage) => {
    console.log("page updating to", newPage);
    setPreviousPage(page);
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
    <PageContext.Provider value={{ page, previousPage, updatePage, movieList, updateMovieList, userId, staticMovie, setStaticMovie, updateColorMode, colorMode, movieOTD, setMovieOTD }}>
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
