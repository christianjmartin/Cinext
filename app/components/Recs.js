import React, { useContext, useEffect, useState } from 'react';
import PageContext from '../context/PageContext';  
import { View, Alert, Text, StyleSheet, TextInput, ScrollView, Dimensions, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';  
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { fetchLLMResponse } from '../services/geminiapi';
import { fetchMovieDetails } from '../services/tmdbApi.js';
import { supabase } from '../services/supabase.js';
import { updateSuggestionSeenPreference } from '../services/preferences.js';
import { updateSuggestionWatchlistPreference } from '../services/preferences.js';
import imdb from '../assets/IMDB.svg.png';
import MOTD from '../services/MOTD.json';
import Swiper from 'react-native-swiper';
import theme from '../services/theme.js';
import _ from 'lodash';

export default function Recs() {
  const {updatePage, updateMovieList, userId, colorMode, movieOTD, setMovieOTD, setStaticMovie, watchlist, setWatchlist, seenFilms, setSeenFilms, suggestSeen, setSuggestSeen, suggestWatchlist, setSuggestWatchlist} = useContext(PageContext);  
  const [text, setText] = useState('');  
  const [loading, setLoading] = useState(false);  
  const [isTyping, setIsTyping] = useState(false);
  // const [movieOTD, setMovieOTD] = useState({});
  const currentTheme = theme[colorMode];
  let noRating = 'N/A';
  const togglePositionSeen = useSharedValue(suggestSeen === false ? 50 : 5);
  const togglePositionWatchlist = useSharedValue(suggestWatchlist === false ? 50 : 5);

  // toggles between pulling from seen or not 
  const toggleSuggestSeen = () => {
      togglePositionSeen.value = withTiming(suggestSeen === false ? 5 : 50, { duration: 250 });
      if (suggestSeen) {
        setSuggestSeen(false);
        updateSuggestionSeenPreference(false, userId);
      } else {
        setSuggestSeen(true);
        updateSuggestionSeenPreference(true, userId);
      }
  };

  // toggles between pulling from watchlist or not 
  const toggleSuggestWatchlist = () => {
    togglePositionWatchlist.value = withTiming(suggestWatchlist === false ? 5 : 50, { duration: 250 });
    if (suggestWatchlist) {
      setSuggestWatchlist(false);
      updateSuggestionWatchlistPreference(false, userId);
    } else {
      setSuggestWatchlist(true);
      updateSuggestionWatchlistPreference(true, userId);
    }
  };

  const animatedStyleSeen = useAnimatedStyle(() => ({
      transform: [{ translateX: togglePositionSeen.value }],
  }));

  const animatedStyleWatchlist = useAnimatedStyle(() => ({
      transform: [{ translateX: togglePositionWatchlist.value }],
  }));



  // gets all of the films the user has put in their watchlist
  const getFilms = async () => {
    try {
        const { data, error } = await supabase
            .from('Watchlist')
            .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
            .order('id', { ascending: false })
            .eq('UserID', userId);

        if (error) {
            console.error('Error fetching Watchlist:', error.message);
        } else {
            // console.log('Fetched from Watchlist:', data);
            // console.log("data", data);
            // console.log("watchlist", watchlist)
            if (!_.isEqual(data, watchlist)) {
                console.log("There were changes in watchlist, updating watchlist...");
                setWatchlist(data || []);
            }
            else {
                console.log('no changes in watchlist, nothing to do!');
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error); 
    }
    try {
      const { data, error } = await supabase
          .from('SeenFilms')
          .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
          .order('id', { ascending: false })
          .eq('UserID', userId);

      if (error) {
          console.error('Error fetching SeenFilms:', error.message);
      } else {
          // console.log('Fetched from SeenFilms:', data);
          // console.log("data", data);
          // console.log("seenFilms", seenFilms)
          if (!_.isEqual(data, seenFilms)) {
              console.log("There were changes in seenfilms, updating seenfilms...");
              setSeenFilms(data || []);
          }
          else {
              console.log('no changes in seenfilms, nothing to do!');
          }
      }
    } catch (error) {
        console.error('Unexpected error:', error); 
    }
  };

 
  // gets the film of the day and updates it in context api "movieOTD" object
  const getMOTD = async (formattedDate) => {
    const motd = MOTD[formattedDate].title;
    // console.log(motd);
    try {
      const { data, error } = await supabase
        .from('MovieOfTheDay')
        .select('Date, Title, PosterPath, Director, Year, Rating, Description, tmdbID')
        .eq('Date', formattedDate);

      if (error) {
          console.error('Error fetching SeenFilms:', error.message);
      } else {
          // nothing exists in the database for this day 
          if (data.length === 0) {
            const movieOfTheDay = await fetchMovieDetails(motd);
            console.log("movie of the day is:", movieOfTheDay);
            const { data2, error2 } = await supabase
              .from('MovieOfTheDay')
              .insert([{ Date: formattedDate, Title: movieOfTheDay.Title, Director: movieOfTheDay.Director, Year: parseInt(movieOfTheDay.Year), PosterPath: movieOfTheDay.PosterPath, Description: movieOfTheDay.Description, Rating: movieOfTheDay.Rating, tmdbID: movieOfTheDay.tmdbID }])
              .select();
        
            if (error2) {
              console.error('Error adding to Movie of the Day:', error2.message);
            } else {
              const updateContext = { Date: formattedDate, Title: movieOfTheDay.Title, Director: movieOfTheDay.Director, Year: parseInt(movieOfTheDay.Year), PosterPath: movieOfTheDay.PosterPath, Description: movieOfTheDay.Description, Rating: movieOfTheDay.Rating, tmdbID: movieOfTheDay.tmdbID }
              setMovieOTD(updateContext);
              console.log('Added a new film to the Movie of the Day table');
            }
          }
          // something was there, update context for movieoftheday
          else {
            const movieOfTheDay = data[0];
            setMovieOTD(movieOfTheDay);
          }
      }
    } catch (error) {
        console.error('Unexpected error:', error); 
    }
  }

  useEffect(() => {
    const fetchMOTD = async () => {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${month}-${day}`;

      // FOR TESTING
      // const formattedDate = "01-01";
  
      // first, check if today's movie is already in context
      if (Object.keys(movieOTD).length > 0) {
        if (movieOTD?.Date === formattedDate) {
          console.log("movie exists in context and is up to date.");
          return;
        } else {
          console.log("new day -> fetching today's motd...");
          await getMOTD(formattedDate);
          return;
        }
      }
      else {
        console.log("ts was not in context, it better be in the DB");
        await getMOTD(formattedDate);
        return; 
      }
    };
  
    fetchMOTD();
    getFilms();
  }, [userId]);
  

  // this function does the following
  // fetches the films that are in the user's lists (Seen and Watchlist) and creates a Set of their respective ID's from TMDB
  // prompts the Google AI to provide 40 movies on the sentiment -> variable: "text"
  // extracts the response, if no movies were returned, the AI could not fufill the users request.
  // gets the movie details from the response by calling the TMDB API with the film TITLE and YEAR as parameters for the search
  // gets the unique movies (movies the user hasn't seen or already in watchlist)
  // if the number of unique movies is < 5, get 20 more movies (not including the first 40 so duplicates), and do that all again.
  // on this batch of movies, a small number of re-reccommends is deemed okay to limit the amount of null responses
  // to do this, we skip over the first 10 movies in watchlist or seen lists (if exists), then include the rest in the final result. 
  // unique films from the first 40 results and if necessary, what is needed from the next 20 results are concatenated into a list
  // if this list is over 30 entries long, it is cut down to 30.
  // finally, the list of 30 or less films is updated in context into the movieList object via the "updateMovieList" function from context.
  const handleSubmit = async () => {
    if (text === '') {
      Alert.alert("Missing Input", "Enter text to get recommendations.");
      return;
    }
    else if (text.length > 200) {
      Alert.alert("cmon crode", "you done typed way too much lmao");
      return;
    }
    console.log(`Fetching movie recommendations...`);
    setLoading(true);

    try {
        // fetch everything this user has already seen
        const { data, error } = await supabase
            .from('SeenFilms')
            .select('tmdbID')
            .eq('UserID', userId);

        const { data: watchlistData, error: watchlistError } = await supabase
            .from('Watchlist')
            .select('tmdbID')
            .eq('UserID', userId);
        
        if (error || watchlistError) {
            console.error('Error fetching movies:', error || watchlistError);
            return;
        }

        // get the tmdbIDs of the movies the user has already seen or in watchlist (GENERAL / ALL)
        const alreadyInListsMovieIDs = new Set([...data.map(m => m.tmdbID), ...watchlistData.map(m => m.tmdbID)]);

        // get 40 movies based on the sentiment
        let firstPrompt = `Provide a list of 40 movies in this exact format:
        1. title ^ year
        2. title ^ year
        ...
        (Strictly follow this format—no extra information, no deviations.)
        Ensure there are no repeats.
        If a movie's official title includes intentional stylized spelling (such as numbers replacing letters, symbols, or unique formatting), preserve that as accurately as possible. However, do **not** invent stylization where it does not exist.
        Special case: If a movie's title has a dot icon in it, put a period instead of providing the actual dot. 
        Remember absolutely no repeating movies.
        Make sure there are no contraversial picks unless specifically asked for.
        If there are not 40 movies available given the sentiment, give as many as you can but no repeats.
        Choose from the following sentiment: ${text}`;

        const result1 = await fetchLLMResponse(firstPrompt);
        const responseText1 = result1?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';

        
        // what the user asked for 
        console.log("The user said: ", text);

        // raw response from the api
        console.log(responseText1);

        // extract movies returned by following regex pattern, outlined in extractMovieList function 
        let movies1 = extractMovieList(responseText1);
        if (movies1.length === 0) {
            updateMovieList(['This is a special error case !@#$']);
            return;
        }

        // extract the information from the TMDB API for the UI (detailedMovies) object
        let detailedMovies = [];
        for (const movie of movies1) {
            if (movie.includes("Seven ^ 1995")) {
              console.log("imposter film spotted lol")
              continue;
            }
            try {
                const detailedMovie = await fetchMovieDetails(movie.trim());
                detailedMovies.push(detailedMovie || { Title: movie.trim(), error: true });
            } catch (error) {
                console.error(`Error fetching details for ${movie}:`, error);
                detailedMovies.push({ Title: movie.trim(), error: true });
            }
        }

        // The movies the user has NOT seen yet (KEEP)
        let uniqueMovies = detailedMovies.filter(movie => !alreadyInListsMovieIDs.has(movie.tmdbID));

        // the list of movies returned by the first response
        let excludeList = new Set(detailedMovies.map(movie => movie.Title));

        // console.log(excludeList);
        console.log("The number of new films to the user:", uniqueMovies.length);

        // if there arent enough unqiue movies after filtering, try again
        if (uniqueMovies.length < 5) { 
            console.log("Too many seen movies. Fetching another batch...");

            // prompt AI API again, explicity telling to not include movies from first response
            let finalPrompt = `Provide a list of 20 movies in this exact format:
            1. title ^ year
            2. title ^ year
            ...
            (Strictly follow this format—no extra information, no deviations.)
            Choose from the following sentiment: ${text}.
            DO NOT include these movies: ${Array.from(excludeList).join(', ')}.
            If that list included everything possible, don't give me anything, that is okay. Just fill in the blanks if there are any. the 20 movies is just the max, it could be 0, 1, 5 or 20...
            Ensure there are no repeats.
            If a movie's official title includes intentional stylized spelling (such as numbers replacing letters, symbols, or unique formatting), preserve that as accurately as possible. However, do **not** invent stylization where it does not exist.
            Special case: If a movie's title has a dot icon in it, put a period instead of providing the actual dot.
            Remember absolutely no repeating movies.
            Make sure there are no contraversial picks unless specifically asked for.`;

            const result2 = await fetchLLMResponse(finalPrompt);
            const responseText2 = result2?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';

            // raw second response
            console.log(responseText2);

            // get movies via regex pattern 
            let movies2 = extractMovieList(responseText2);
            if (movies2.length > 0) {
                let detailedMovies2 = [];
                for (const movie of movies2) {
                    try {
                        const detailedMovie = await fetchMovieDetails(movie.trim());
                        detailedMovies2.push(detailedMovie || { Title: movie.trim(), error: true });
                    } catch (error) {
                        console.error(`Error fetching details for ${movie}:`, error);
                        detailedMovies2.push({ Title: movie.trim(), error: true });
                    }
                }

                const newUniqueMovies = [];
                let counter = 0;
                let skipLimitReached = false;

                // skip over the first 10 movies in watchlist or seen lists (if exists), then include the rest in the final result. 
                for (const movie of detailedMovies2) {
                    if (!alreadyInListsMovieIDs.has(movie.tmdbID)) {
                        if (!skipLimitReached) {
                            newUniqueMovies.push(movie);
                        }
                    } else {
                        //first 10 seen / watchlist movies
                        if (counter < 10) {
                            counter++;
                            continue; // dont activate "skipLimitReached = true;" yet
                        }
                        // after skipping first 10 seen, just push everything
                        skipLimitReached = true;
                    }

                    // once skipping is done, push everything
                    if (skipLimitReached) {
                        newUniqueMovies.push(movie);
                    }
                }

                // merge old list, containing fully unique, with new in which contains a mixed bag
                uniqueMovies = [...uniqueMovies, ...newUniqueMovies];
            }
        }
    
        // cut off the amount of movies shown to the user to 30 at most
        if (uniqueMovies.length > 30) {
          let cutoffAmount = uniqueMovies.length % 30;
          uniqueMovies = uniqueMovies.slice(0, -cutoffAmount);
          console.log("The number of films actually displayed (it was over 30):", uniqueMovies.length);
        }

        // update the movieList for context
        if (uniqueMovies.length === 0) {
          updateMovieList(['This is a special error case !@#$']);
        }
        else {updateMovieList(uniqueMovies);}

    } catch (error) {
        console.error('Error:', error);
    } finally {
        updatePage("Show Swiper");
        setLoading(false);
        setText('');
        Keyboard.dismiss();
    }
  };



  // function outlines a regex pattern to identify movies returned by the AI 
  const extractMovieList = (text) => {
    const listPattern = /(\d{1,2})\.([^\n]+)/g;  
    const movies = [];
    let match;

    while ((match = listPattern.exec(text)) !== null) {
      movies.push(match[2]);  
    }

    return movies;  
  };

  const extractStringDate = (date) => {
    const month = date.slice(0,2);
    const day = date.slice(3);
    // console.log(date);
    
    switch (month) {
        case "01": return `January ${day}`;
        case "02": return `February ${day}`;
        case "03": return `March ${day}`;
        case "04": return `April ${day}`;
        case "05": return `May ${day}`;
        case "06": return `June ${day}`;
        case "07": return `July ${day}`;
        case "08": return `August ${day}`;
        case "09": return `September ${day}`;
        case "10": return `October ${day}`;
        case "11": return `November ${day}`;
        case "12": return `December ${day}`;
        default: return "Invalid month"; // Handle unexpected input
    }
};


  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, {backgroundColor: currentTheme.backgroundSecondary, borderColor: currentTheme.border2, shadowColor: currentTheme.shadowColor2}]}>
          {/* {isTyping ? <View style={styles.invisiblePadding}></View> : <Text style={[styles.subtitle, {color: currentTheme.textColorSecondary}]}>Enter what kind of movie you want to see next, then let us do the rest</Text>} */}
          <Text style={[styles.subtitle, {color: currentTheme.textColorSecondary}]}>Enter what kind of movie you want to see next, then let us do the rest</Text>
          {/* <Text>Hi - {userId}</Text> */}

          <TextInput
            style={[styles.textInputBox, {backgroundColor: currentTheme.searchBar}]}
            placeholder="Create a prompt..."
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            maxLength={200}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />

        <View style={styles.toggleSection}>
          <TouchableOpacity onPress={toggleSuggestSeen} style={styles.toggleContainer}>
              <Animated.View style={[styles.toggleCircle, animatedStyleSeen]}>
                  {suggestSeen ? <Text>YES SEEN</Text> : <Text>NO SEEN</Text> }
              </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSuggestWatchlist} style={styles.toggleContainer}>
              <Animated.View style={[styles.toggleCircle, animatedStyleWatchlist]}>
                  {suggestWatchlist? <Text>YES WLIST</Text> : <Text>NO WLIST</Text> }
              </Animated.View>
          </TouchableOpacity>
        </View>

          {loading ? <ActivityIndicator style={styles.padding} size="large" color="#A44443"></ActivityIndicator> :
          <TouchableOpacity style={[styles.submitButton, {borderColor: currentTheme.submitBtnBorder, backgroundColor: currentTheme.submitBtn}]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}> Submit</Text>
          </TouchableOpacity>}
          <TouchableOpacity>
            <Text style={{color: 'white'}}>Exclude movies i've seen from recs?</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{color: 'white'}}>Exclude movies in my watchlist from recs?</Text>
          </TouchableOpacity>

        </View>
      
        <View style={[styles.box, {backgroundColor: currentTheme.backgroundSecondary, borderColor: currentTheme.border2, shadowColor: currentTheme.shadowColor2}]}>
            <Text style={[{color: currentTheme.textColorSecondary}, styles.motdHeader]}>Today in film</Text>
            <Text style={[{color: currentTheme.textColorSecondary}, styles.motdHeader]}>{movieOTD.Date ? extractStringDate(movieOTD.Date) : null}, {movieOTD.Year ? movieOTD.Year : null}</Text>


    
                <TouchableOpacity style={styles.margin} onPress={() => {
                      setStaticMovie(movieOTD);
                      updatePage("Static Movie");
                    }}>
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500${movieOTD.PosterPath}` }}
                      style={styles.poster}
                    ></Image>
                </TouchableOpacity>

            <View style={[styles.row, styles.centered]}>
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Directed by: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{movieOTD.Director}</Text>
                </Text>
            </View>

            <View style={styles.spaceAround}>
                <View style={styles.ratingContainer}>
                    <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                      Rating: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{movieOTD.Rating ? movieOTD.Rating : noRating}</Text>
                    </Text>
                    <Image style={styles.imdbLogo} source={imdb}></Image>
                </View>
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Released: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{movieOTD.Year}</Text>
                </Text>
            </View>
            
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 43,
    justifyContent: 'top',
    alignItems: 'center',
    width: Dimensions.get('window').width * 1,
  },
  scrollContainer: {
    flexGrow: 1, // Allows scrolling past the screen height
    alignItems: "center",
    paddingBottom: 50, // Prevents last item from getting cut off
  },
  padding: {
    padding: 5,
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 10,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInputBox: {
    height: 50,
    borderColor: '#bcbcbc',
    borderWidth: 1,
    width: 300,
    borderRadius: 15,
    paddingLeft: 8,
    marginBottom: 20,
  },
  submitButton: {
    // borderColor: '#942020',
    padding: 10,
    width: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 3,
    margin: 3,
    marginBottom: 8,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  invisiblePadding: {
    padding: 20,
  },

  // movie of the day styling 
  box: {
    marginTop: 20,
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 10,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden',
  },
  motdHeader: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  poster: {
    width: '100%',
    height: Dimensions.get('window').height * 0.55,
    resizeMode: 'contain',
    marginTop: 12,
  },
  cardText: {
    fontSize: 16,
    marginVertical: 1,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  imdbLogo: {
    width: 40,
    height: 20,
    marginLeft: 5,
    resizeMode: 'contain',
  },
  row: {
    flexDirection: 'row', 
  },
  width: {
    width: Dimensions.get('window').width * 0.9,
  },
  spaceAround: {
    flexDirection: 'row', 
    justifyContent: 'space-around'
  },
  centered: {
    justifyContent: 'center',
  },
  height: {
    height: Dimensions.get('window').height * 0.358,
  },
  descriptionBox: {
    flexGrow: 1, 
    justifyContent: "center", 
    alignSelf: "center",
  },
  margin: {
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14, 
    marginVertical: 10,
    textAlign: 'left',
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
  ratingContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },

  // toggles
  toggleSection: { 
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  toggleContainer: {
    width: 100,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    position: 'relative',
},
toggleCircle: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
},
emoji: {
    fontSize: 40,
},
});
