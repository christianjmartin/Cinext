import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import PageContext from '../context/PageContext';  
import { View, Alert, Text, StyleSheet, TextInput, ScrollView, Dimensions, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ActivityIndicator, AppState } from 'react-native';  
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { fetchLLMResponse } from '../services/apiComms.js';
import { getRequestsLeft } from '../database/dbFuncs.js';
import { fetchMovieDetails } from '../services/tmdbApi.js';
import { supabase } from '../services/supabase.js';
import { updateSuggestionSeenPreference } from '../database/preferences.js';
import { updateSuggestionWatchlistPreference } from '../database/preferences.js';
import { useNavigation } from '@react-navigation/native';
import { getMOTD } from '../database/dbFuncs.js';
import imdb from '../assets/IMDB.svg.png';
import tmdb2 from '../assets/tmdb2.png';
import MOTD from '../services/MOTD.json';
import Swiper from 'react-native-swiper';
import theme from '../services/theme.js';
import _ from 'lodash';

export default function Recs() {
  const {updatePage, updateMovieList, userId, colorMode, movieOTD, setMovieOTD, setStaticMovie, watchlist, setWatchlist, seenFilms, setSeenFilms, suggestSeen, setSuggestSeen, suggestWatchlist, setSuggestWatchlist, currSortSeen, currSortWatchlist, requestCount, setRequestCount, loading, setLoading, listInit, setListInit, requestCountDate, setRequestCountDate} = useContext(PageContext);  
  const [text, setText] = useState('');  
  // const [loading, setLoading] = useState(false);  
  const [isTyping, setIsTyping] = useState(false);
  // const [requestCount, setRequestCount] = useState();
  const navigation = useNavigation();
  // const [movieOTD, setMovieOTD] = useState({});
  const currentTheme = theme[colorMode];
  let noRating = 'N/A';
  const togglePositionSeen = useSharedValue(suggestSeen ? 35 : 5);
  const togglePositionWatchlist = useSharedValue(suggestWatchlist ? 35 : 5);

  // Toggles between pulling from "Seen" or not 
  const toggleSuggestSeen = () => {
      togglePositionSeen.value = withTiming(suggestSeen ? 5 : 35, { duration: 250 });
      setSuggestSeen(!suggestSeen);
      updateSuggestionSeenPreference(!suggestSeen, userId);
  };

  // Toggles between pulling from "Watchlist" or not 
  const toggleSuggestWatchlist = () => {
      togglePositionWatchlist.value = withTiming(suggestWatchlist ? 5 : 35, { duration: 250 });
      setSuggestWatchlist(!suggestWatchlist);
      updateSuggestionWatchlistPreference(!suggestWatchlist, userId);
  };

  // Animated styles for smooth transitions
  const animatedStyleSeen = useAnimatedStyle(() => ({
      transform: [{ translateX: togglePositionSeen.value }],
  }));

  const animatedStyleWatchlist = useAnimatedStyle(() => ({
      transform: [{ translateX: togglePositionWatchlist.value }],
  }));



  // gets all of the films the user has put in their watchlist
  const getFilms = async (sortingOptionSeen, sortingOptionWatchlist) => {
    try {
      let query = supabase
      .from('Watchlist')
      .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
      .eq('AuthID', userId);

      // add the order based on the sorting option if exists
      switch (sortingOptionWatchlist) {
          case 'Alphabetical 1':
              query = query.order('Title', { ascending: true });
              break;
          case 'Alphabetical 2':
              query = query.order('Title', { ascending: false });
              break;
          case 'Date Added 1':
              query = query.order('created_at', { ascending: false });
              break;
          case 'Date Added 2':
              query = query.order('created_at', { ascending: true });
              break;
          case 'Release Date 1':
              query = query.order('Year', { ascending: false});
              break;
          case 'Release Date 2':
              query = query.order('Year', { ascending: true });
              break;
          case 'Rating 1':
              query = query.order('Rating', { ascending: false }).order('created_at', { ascending: false });
              break;
          case 'Rating 2':
              query = query.order('Rating', { ascending: true }).order('created_at', { ascending: false });
              break;
          default:
              query = query.order('created_at', { ascending: false });
      }

    const { data, error } = await query;

        if (error) {
            console.error('Error fetching Watchlist:');
        } else {
            // console.log('Fetched from Watchlist:', data);
            // console.log("data", data);
            // console.log("Watchlist", watchlist)
            if (!_.isEqual(data, watchlist)) {
                // console.log("There were changes in Watchlist, updating Watchlist...");
                setWatchlist(data || []);
            }
            else {
                // console.log('no changes in Watchlist, nothing to do!');
            }
        }
    } catch (error) {
        console.error('Unexpected error: get films func'); 
    }
    try {
      let query = supabase
      .from('SeenFilms')
      .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
      .eq('AuthID', userId);

      // add the order based on the sorting option if exists
      switch (sortingOptionSeen) {
          case 'Alphabetical 1':
              query = query.order('Title', { ascending: true });
              break;
          case 'Alphabetical 2':
              query = query.order('Title', { ascending: false });
              break;
          case 'Date Added 1':
              query = query.order('created_at', { ascending: false });
              break;
          case 'Date Added 2':
              query = query.order('created_at', { ascending: true });
              break;
          case 'Release Date 1':
              query = query.order('Year', { ascending: false});
              break;
          case 'Release Date 2':
              query = query.order('Year', { ascending: true });
              break;
          case 'Rating 1':
              query = query.order('Rating', { ascending: false }).order('created_at', { ascending: false });
              break;
          case 'Rating 2':
              query = query.order('Rating', { ascending: true }).order('created_at', { ascending: false });
              break;
          default:
              query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

          if (error) {
              console.error('Error fetching SeenFilms:');
          } else {
              // console.log('Fetched from SeenFilms:', data);
              // console.log("data", data);
              // console.log("seenFilms", seenFilms)
              if (!_.isEqual(data, seenFilms)) {
                  // console.log("There were changes in seenfilms, updating seenfilms...");
                  setSeenFilms(data || []);
              }
              else {
                  // console.log('no changes in seenfilms, nothing to do!');
              }
          }
      } catch (error) {
          console.error('Unexpected error: in getfilms'); 
      }
  };

 
  // gets the film of the day and updates it in context api "movieOTD" object
  // const getMOTD = async (formattedDate) => {
  //   const motd = MOTD[formattedDate].title;
  //   // console.log(motd);
  //   try {
  //     const { data, error } = await supabase
  //       .from('MovieOfTheDay')
  //       .select('Date, Title, PosterPath, Director, Year, Rating, Description, tmdbID')
  //       .eq('Date', formattedDate);

  //     if (error) {
  //         console.error('Error fetching SeenFilms:');
  //     } else {
  //         // nothing exists in the database for this day 
  //         if (data.length === 0) {
  //           console.log('no movie of the day, internal error')
  //         }
  //         // something was there, update context for movieoftheday
  //         else {
  //           const movieOfTheDay = data[0];
  //           setMovieOTD(movieOfTheDay);
  //         }
  //     }
  //   } catch (error) {
  //       console.error('Unexpected error get motd:'); 
  //   }
  // }

  const updateRQC = async () => {
    const todayCST = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Chicago',
    });
    if (todayCST === requestCountDate) {
      // console.log("dont gotta refetch request count")
      return;
    }
    else {
      const count = await getRequestsLeft();
      setRequestCount(count);
      setRequestCountDate(todayCST);
    }
  }

  const fetchMOTD = async () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${month}-${day}`;

    // FOR TESTING
    // const formattedDate = "01-01";

    // Check if today's movie is already in context
    if (Object.keys(movieOTD).length > 0) {
      if (movieOTD?.Date === formattedDate) {
        // console.log("movie exists in context and is up to date.");
        return;
      } else {
        // console.log("new day -> fetching today's motd...");
        const todaysFilm = await getMOTD(formattedDate);
        setMovieOTD(todaysFilm);
        return;
      }
    }
    else {
      // console.log("ts was not in context, it better be in the DB");
      const todaysFilm = await getMOTD(formattedDate);
      setMovieOTD(todaysFilm);
      return; 
    }
  };

  useFocusEffect(
    useCallback(() => {

      // console.log("focus effect fired");
      updateRQC();
      fetchMOTD();
      // getFilms(currSortSeen, currSortWatchlist);
  
    }, [userId])
  );

  useEffect(() => {
    if (!listInit) {
      // console.log("one and done")
      setListInit(true);
      getFilms(currSortSeen, currSortWatchlist);
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // console.log("app state listener fired")
        fetchMOTD(); // or whatever needs refreshing
        updateRQC();
      }
    });

    return () => subscription.remove();
  }, []);

 


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
      Alert.alert("Error", "You typed too many characters");
      return;
    }
    // console.log(`Fetching movie recommendations...`);
    // setRequestCount(prevCount => prevCount - 1);
    setLoading(true);

    try {
        // fetch everything this user has already seen
        const { data, error } = await supabase
            .from('SeenFilms')
            .select('tmdbID')
            .eq('AuthID', userId);

        const { data: watchlistData, error: watchlistError } = await supabase
            .from('Watchlist')
            .select('tmdbID')
            .eq('AuthID', userId);
        
        if (error || watchlistError) {
            console.error('Error fetching movies:');
            Alert.alert("There was an error trying to fetch recommendations.");
            setLoading(false);
            setText('');
            Keyboard.dismiss();
            return;
        }

        // get the tmdbIDs of the movies the user has already seen or in watchlist (GENERAL / ALL)
        //const alreadyInListsMovieIDs = new Set([...data.map(m => m.tmdbID), ...watchlistData.map(m => m.tmdbID)]);
        let alreadyInListsMovieIDs = new Set();

        // Exclude Seen Films if the toggle is OFF
        if (!suggestSeen) {
            data.forEach(m => alreadyInListsMovieIDs.add(m.tmdbID));
        }

        // Exclude Watchlist Films if the toggle is OFF
        if (!suggestWatchlist) {
            watchlistData.forEach(m => alreadyInListsMovieIDs.add(m.tmdbID));
        }

       
        const result1 = await fetchLLMResponse(1, text, '');

        // error getting requests
        if (result1 == "err_getting_requests_wtf") {
          Alert.alert("There was an error getting your request count, try again later.");
          setLoading(false);
          setText('');
          Keyboard.dismiss();
          return;
        }
        // daily limit reached
        if (result1 == "bruh_yo_daily_limit_reached") {
          Alert.alert("Too many requests for today, try again tomorrow.");
          setLoading(false);
          setText('');
          Keyboard.dismiss();
          return;
        }
        // too many chars sent to llm
        if (result1 == "too_many_characters_in_prompt_brody") {
          Alert.alert("cmon crode", "you done typed way too much lmao");
          setLoading(false);
          setText('');
          Keyboard.dismiss();
          return;
        }

        setRequestCount(prevCount => prevCount - 1);
        const todayCST1 = new Date().toLocaleDateString('en-CA', {
          timeZone: 'America/Chicago',
        });
        setRequestCountDate(todayCST1);
        
    
        const responseText1 = result1?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';

        
        // what the user asked for 
        // console.log("The user said: ", text);

        // raw response from the api
        // console.log("api response: ", responseText1);

        // extract movies returned by following regex pattern, outlined in extractMovieList function 
        let movies1 = extractMovieList(responseText1);
        if (movies1.length === 0) {
            updateMovieList(['This is a special error case !@#$']);
            // ready to go, update page
            updatePage("Show Swiper");
            navigation.replace("Show Swiper");
            setLoading(false);
            setText('');
            Keyboard.dismiss();
            return;
        }

        // extract the information from the TMDB API for the UI (detailedMovies) object
        let detailedMovies = [];
        for (const movie of movies1) {
            try {
                const detailedMovie = await fetchMovieDetails(movie.trim());
                detailedMovies.push(detailedMovie || { Title: movie.trim(), error: true });
            } catch (error) {
                console.error(`Error fetching details for ${movie}:`);
                detailedMovies.push({ Title: movie.trim(), error: true });
            }
        }

        // The movies the user has NOT seen yet (KEEP)... or based on whatever they have toggled
        let uniqueMovies = detailedMovies.filter(movie => !alreadyInListsMovieIDs.has(movie.tmdbID));

        // the list of movies returned by the first response
        let excludeList = new Set(detailedMovies.map(movie => movie.Title));

        // console.log(excludeList);
        // console.log("The number of new films to the user:", uniqueMovies.length);

        // if there arent enough unqiue movies after filtering, try again
        if (uniqueMovies.length < 5) { 
            // console.log("Too many seen movies. Fetching another batch...");
            // console.log("exclude list: ", excludeList);

            

            const result2 = await fetchLLMResponse(2, text, Array.from(excludeList).join(', '));
            // console.log(result2);


            // error getting requests
            if (result2 == "err_getting_requests_wtf") {
              Alert.alert("There was an error getting your request count, try again later.");
              setLoading(false);
              setText('');
              Keyboard.dismiss();
              return;
            }
            // daily limit reached
            if (result2 == "bruh_yo_daily_limit_reached") {
              Alert.alert("That request needed 2 tokens... Too many requests for today, try again tomorrow. ");
              setLoading(false);
              setText('');
              Keyboard.dismiss();
              return;
            }
            // too many chars sent to llm
            if (result2 == "too_many_characters_in_prompt_brody") {
              Alert.alert("cmon crode", "you done typed way too much lmao");
              setLoading(false);
              setText('');
              Keyboard.dismiss();
              return;
            }


            setRequestCount(prevCount => prevCount - 1);
            const todayCST2 = new Date().toLocaleDateString('en-CA', {
              timeZone: 'America/Chicago',
            });
            setRequestCountDate(todayCST2);
            
            // Alert.alert("Due to your filtering needs, 2 requests are needed for this request.");
        
            const responseText2 = result2?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';

            // raw second response
            // console.log("the second api response: ", responseText2);

            // get movies via regex pattern 
            let movies2 = extractMovieList(responseText2);
            if (movies2.length > 0) {
                let detailedMovies2 = [];
                for (const movie of movies2) {
                    try {
                        const detailedMovie = await fetchMovieDetails(movie.trim());
                        detailedMovies2.push(detailedMovie || { Title: movie.trim(), error: true });
                    } catch (error) {
                        console.error(`Error fetching details for ${movie}:`);
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
    
        // cut off the amount of movies shown to the user to 21 at most
        if (uniqueMovies.length > 24) {
          let cutoffAmount = uniqueMovies.length % 24;
          uniqueMovies = uniqueMovies.slice(0, -cutoffAmount);
          // console.log("The number of films actually displayed (it was over 24):", uniqueMovies.length);
        }

        // update the movieList for context
        if (uniqueMovies.length === 0) {
          updateMovieList(['This is a special error case !@#$']);
        }
        else {updateMovieList(uniqueMovies);}
        

        // ready to go, update page
        updatePage("Show Swiper");
        navigation.replace("Show Swiper");
        setLoading(false);
        setText('');
        Keyboard.dismiss();

    } catch (error) {
        console.error('Error, they left the app or internal error');
        Alert.alert("Error, avoid leaving the app while suggestions generate!");
        setLoading(false);
        setText('');
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
    let day = date.slice(3);
    if (day) {
      const tempDay = parseInt(day);
      day = tempDay < 10 ? day[1] : day;
    }

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
      style={[styles.container, {backgroundColor: currentTheme.background}]}
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
            placeholder="Create a request..."
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            maxLength={200}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />

        {!loading && 
        <>
        <View style={styles.toggleSection}>
        <TouchableOpacity onPress={toggleSuggestWatchlist} style={[suggestWatchlist ? [styles.yes, {backgroundColor: currentTheme.seenBtn}] : styles.no, styles.toggleContainer]}>
              <Animated.View style={[styles.toggleCircle, animatedStyleWatchlist]}>
                  {/* {suggestWatchlist? <Text></Text> : <Text></Text> } */}
              </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSuggestSeen} style={[suggestSeen ? [styles.yes, {backgroundColor: currentTheme.seenBtn}] : styles.no, styles.toggleContainer]}>
              <Animated.View style={[styles.toggleCircle, animatedStyleSeen]}>
                  {/* {suggestSeen ? <Text></Text> : <Text></Text> } */}
              </Animated.View>
          </TouchableOpacity>
        </View>
        <View style={styles.toggleSectionText}>
          {suggestWatchlist ? <Text style={{fontSize: 12.5, color: currentTheme.textColorSecondary}}>Include watchlist films</Text> :  <Text style={{fontSize: 12.5, color: currentTheme.textColorSecondary}}>Include watchlist films</Text>}
          {suggestSeen ? <Text style={{fontSize: 12.5, color: currentTheme.textColorSecondary}}>Include my seen films</Text> :  <Text style={{fontSize: 12.5, color: currentTheme.textColorSecondary}}>Include my seen films</Text>}
        </View>
        </>
        }

        {loading ? <ActivityIndicator style={styles.padding} size="large" color="#A44443"></ActivityIndicator> :
        <>
        <TouchableOpacity style={[styles.submitButton, {borderColor: currentTheme.submitBtnBorder, backgroundColor: currentTheme.submitBtn}]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}> Submit</Text>
        </TouchableOpacity>

        <Text style={{fontSize: 12.5, color: currentTheme.textColorSecondary}}>Requests left today: {requestCount}</Text>
        </>
        }

        </View>
      
        <View style={[styles.box, {backgroundColor: currentTheme.backgroundSecondary, borderColor: currentTheme.border2, shadowColor: currentTheme.shadowColor2}]}>
            <Text style={[{color: currentTheme.textColorSecondary}, styles.motdHeader]}>Today in film</Text>
            <Text style={[{color: currentTheme.textColorSecondary}, styles.motdHeader]}>{movieOTD.Date ? extractStringDate(movieOTD.Date) : null} {movieOTD.Year ? movieOTD.Year : null}</Text>


    
                <TouchableOpacity style={styles.margin} onPress={() => {
                      setStaticMovie(movieOTD);
                      updatePage("NULL");
                      navigation.navigate("Static Movie");
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
                    <Image style={styles.imdbLogo} source={tmdb2}></Image>
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
    paddingTop: 10,
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
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    marginTop: 25,
    margin: 15,
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
    marginTop: 40,
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 10,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    width: 30,
    height: 17,
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
  toggleSectionText: { 
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  toggleContainer: {
    width: 70,
    height: 35,
    // backgroundColor: '#ccc',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    margin: 3,
    position: 'relative',
  },
  yes: {
    backgroundColor: '#57CB32',
  },
  no: {
    backgroundColor: '#A44443',
  },
  toggleCircle: {
      width: 30,
      height: 30,
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
