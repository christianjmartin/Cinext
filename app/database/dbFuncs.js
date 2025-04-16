import { supabase } from '../services/supabase';

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
          .eq('AuthID', userId)
          .select();
    
        if (error) {
          console.error('Error deleting first to Watchlist');
        } else {
          // console.log('deleted from Watchlist:', data);
        }
      } catch (error) {
        console.error('error adding watchlist');
      }
    }

    // enter this regardless of the if (NO else)
    try {
      const { data, error } = await supabase
        .from('Watchlist')
        .insert([{ Title: title, Director: director, Year: parseInt(year), PosterPath: posterPath, Description: description, Rating: rating, tmdbID: tmdbID }])
        .select();
  
      if (error) {
        console.error('Error adding to Watchlist:');
      } else {
        // console.log('Added to Watchlist:', data);
      }
    } catch (error) {
      console.error('Unexpected error adding watchlist');
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
        .eq('AuthID', userId)
        .select();
  
      if (error) {
        console.error('Error deleting first to SeenFilms:');
      } else {
        // console.log('deleted from SeenFilms:', data);
      }
    } catch (error) {
      console.error('Unexpected error: adding to seen');
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
        .eq('AuthID', userId)
        .select();
  
      if (error) {
        console.error('Error deleting first to Watchlist,:');
      } else {
        // console.log('deleted from Watchlist:', data);
      }
    } catch (error) {
      console.error('Unexpected error: add seen films');
    }
  }

  // enter this regardless of the if (NO else)
  try {
    const { data, error } = await supabase
      .from('SeenFilms')
      .insert([{ Title: title, Director: director, Year: parseInt(year), PosterPath: posterPath, Description: description, Rating: rating, tmdbID: tmdbID }])
      .select();

    if (error) {
      console.error('Error adding to SeenFilms:');
    } else {
      // console.log('Added to SeenFilms:', data);
    }
  } catch (error) {
    console.error('Unexpected error: adding film to seen films ');
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
      .eq('AuthID', userId) // Ensure user-specific query

    if (error) {
      console.error('Error fetching data: already seen');
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
    console.error('Unexpected error: checking already seen');
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
      .eq('AuthID', userId)


    if (error) {
      console.error('Error fetching data checking if film in watchlist');
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
    console.error('Unexpected error checking film in watchlist');
    return false;
  }
};

const getRequestsLeft = async () => {
  // const today = new Date().toISOString().split('T')[0];

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Chicago',
});

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  let userId = userData?.user?.id;
  console.log("request getter fired");
  // const tomorrow = new Date();
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // const today = tomorrow.toISOString().split('T')[0];
  try {
    const { data: existingRequest, error } = await supabase
      .from('Requests')
      .select('Count, Date')
      .eq('Date', today)
      .eq('AuthID', userId)
      .single();

    let requestsLeft = 25;
    // console.log(existingRequest);
    if (!error && existingRequest && existingRequest.Date === today) {
      requestsLeft = 25 - existingRequest.Count;
    }
    return requestsLeft;
  } catch (error) {
    console.error('Error request left check');
  }
};

// gets the film of the day and updates it in context api "movieOTD" object
const getMOTD = async (formattedDate) => {
  // const motd = MOTD[formattedDate].title;
  // console.log(motd);
  try {
    const { data, error } = await supabase
      .from('MovieOfTheDay')
      .select('Date, Title, PosterPath, Director, Year, Rating, Description, tmdbID')
      .eq('Date', formattedDate);

    if (error) {
        console.error('Error fetching SeenFilms:');
        return null;
    } else {
        // nothing exists in the database for this day 
        if (data.length === 0) {
          console.log('no movie of the day, internal error')
          return null;
        }
        // something was there, update context for movieoftheday
        else {
          const movieOfTheDay = data[0];
          return movieOfTheDay;
        }
    }
  } catch (error) {
      console.error('Unexpected error get motd:'); 
      return null;
  }
}

export { addToWatchlist, addToSeen, getRequestsLeft, getMOTD };