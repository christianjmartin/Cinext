import { supabase } from './supabase'; 

/*
The functions below encapsulate the logic to add to Watchlist and Seen Films lists.
To be used in the following components:
  - StaticMovie.js
  - Swiper.js
*/

// adds to a film to the watchlist
// deletes from watchlist first, then re-adds, to enhance immediate feedback for users 
const addToWatchlist = async (title, director, year, posterPath, description, rating, tmdbID, userId) => {
    if (await FilmInWatchlist(title, director, year, userId, tmdbID)) {
      // Delete the movie first, then add it again so it goes to the top of the list
      try {
        const { data, error } = await supabase
          .from('Watchlist')
          .delete()
          .eq('Title', title)
          .eq('Director', director)
          .eq('Year', year)
          .eq('tmdbID', tmdbID)
          .eq('UserID', userId)
          .select();
    
        if (error) {
          console.error('Error deleting first to Watchlist,:', error.message);
        } else {
          // console.log('deleted from Watchlist:', data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }

    // enter this regardless of the if (NO else)
    try {
      const { data, error } = await supabase
        .from('Watchlist')
        .insert([{ Title: title, Director: director, Year: parseInt(year), PosterPath: posterPath, UserID: userId, Description: description, Rating: rating, tmdbID: tmdbID }])
        .select();
  
      if (error) {
        console.error('Error adding to Watchlist:', error.message);
      } else {
        // console.log('Added to Watchlist:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
};
  


// adds to the seen list for users 
// if the film is in watchlist, delete it because they just saw it 
// deletes from seen first, then re-adds, to enhance immediate feedback for users 
const addToSeen = async (title, director, year, posterPath, description, rating, tmdbID, userId) => {
  if (await alreadySeen(title, director, year, userId, tmdbID)) {
    // Delete the movie first, then add it again so it goes to the top of the list
    try {
      const { data, error } = await supabase
        .from('SeenFilms')
        .delete()
        .eq('Title', title)
        .eq('Director', director)
        .eq('Year', year)
        .eq('tmdbID', tmdbID)
        .eq('UserID', userId)
        .select();
  
      if (error) {
        console.error('Error deleting first to SeenFilms:', error.message);
      } else {
        // console.log('deleted from SeenFilms:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  // if the movie is in the watchlist, delete it because they just saw it 
  if (await FilmInWatchlist(title, director, year, userId, tmdbID)) {
    try {
      const { data, error } = await supabase
        .from('Watchlist')
        .delete()
        .eq('Title', title)
        .eq('Director', director)
        .eq('Year', year)
        .eq('tmdbID', tmdbID)
        .eq('UserID', userId)
        .select();
  
      if (error) {
        console.error('Error deleting first to Watchlist,:', error.message);
      } else {
        // console.log('deleted from Watchlist:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  // enter this regardless of the if (NO else)
  try {
    const { data, error } = await supabase
      .from('SeenFilms')
      .insert([{ Title: title, Director: director, Year: parseInt(year), PosterPath: posterPath, UserID: userId, Description: description, Rating: rating, tmdbID: tmdbID }])
      .select();

    if (error) {
      console.error('Error adding to SeenFilms:', error.message);
    } else {
      // console.log('Added to SeenFilms:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};



// checks if the movie has been seen by the user 
// returns a boolean 
const alreadySeen = async (title, director, year, userId, tmdbID) => {
  try {
    const { data, error } = await supabase
      .from('SeenFilms')
      .select()
      .eq('Title', title)
      .eq('Director', director)
      .eq('Year', year)
      .eq('tmdbID', tmdbID)
      .eq('UserID', userId) // Ensure user-specific query

    if (error) {
      console.error('Error fetching data:', error);
      return false; // Return false if there's an error
    }

    // console.log('Data', data);

    // Check if any records match
    if (data && data.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false; // Return false in case of unexpected errors
  }
};

// checks if the film is in the watchlist already 
// returns a boolean 
const FilmInWatchlist = async (title, director, year, userId, tmdbID) => {
  try {
    const { data, error } = await supabase
      .from('Watchlist')
      .select()
      .eq('Title', title)
      .eq('Director', director)
      .eq('Year', year)
      .eq('tmdbID', tmdbID)
      .eq('UserID', userId)


    if (error) {
      console.error('Error fetching data:', error);
      return false; 
    }

    // console.log('Data', data); 

    // Check if any records match
    if (data && data.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
};

export { addToWatchlist, addToSeen };