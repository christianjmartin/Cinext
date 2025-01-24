import React, { createContext, useState, useEffect } from 'react';
import { getOrCreateUserId } from '../services/userID';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [page, setPage] = useState("Recs");
  const [previousPage, setPreviousPage] = useState(null);
  const [movieList, setList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [staticMovie, setStaticMovie] = useState(null);

  // Initialize userId when the context is created
  useEffect(() => {
    const initializeUserId = async () => {
      const id = await getOrCreateUserId();
      setUserId(id);
    };

    initializeUserId();
  }, []);

  const updatePage = (newPage) => {
    console.log("page updating");
    setPreviousPage(page);
    setPage(newPage);
  };

  const updateMovieList = (newList) => {
    console.log("updating list of movies for context");
    setList(newList);
  };

  return (
    <PageContext.Provider value={{ page, previousPage, updatePage, movieList, updateMovieList, userId, staticMovie, setStaticMovie }}>
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
