import React, { useContext, useState } from 'react';
import PageContext from '../context/PageContext';  
import { View, Text, StyleSheet, TextInput, FlatList, Dimensions, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';  
import { fetchLLMResponse } from '../services/geminiapi';
import { fetchMovieDetails } from '../services/tmdbApi.js';
import { supabase } from '../services/supabase.js';
import Swiper from 'react-native-swiper';
import theme from '../services/theme.js';

export default function Recs() {
  const { page, updatePage, updateMovieList, userId, colorMode} = useContext(PageContext);  
  const [text, setText] = useState('');  
  const [loading, setLoading] = useState(false);  
  const currentTheme = theme[colorMode];

  const handleSubmit = async () => {
    console.log(`Fetching movie recommendations...`);
    setLoading(true);

    try {
        // fetch everythign this user has already seen
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
        console.log(alreadyInListsMovieIDs);

        // get 10 movies based on the sentiment
        let firstPrompt = `Provide a list of 40 movies in this exact format:
        1. title ^ year
        2. title ^ year
        ...
        (Strictly follow this format—no extra information, no deviations.)
        Ensure there are no repeats.
        If a movie's official title includes intentional stylized spelling (such as numbers replacing letters, symbols, or unique formatting), preserve that as accurately as possible. However, do **not** invent stylization where it does not exist.
        Choose from the following sentiment: ${text}`;

        const result1 = await fetchLLMResponse(firstPrompt);
        const responseText1 = result1?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';

        // raw response from the api
        console.log("The user said: ", text);
        console.log(responseText1);

        let movies1 = extractMovieList(responseText1);
        if (movies1.length === 0) {
            updateMovieList(['This is a special error case !@#$']);
            return;
        }

        // extract the information from the TMDB API for the UI (detailedMovies) object
        let detailedMovies = [];
        for (const movie of movies1) {
            try {
                const detailedMovie = await fetchMovieDetails(movie.trim());
                detailedMovies.push(detailedMovie || { Title: movie.trim(), error: true });
            } catch (error) {
                console.error(`Error fetching details for ${movie}:`, error);
                detailedMovies.push({ Title: movie.trim(), error: true });
            }
        }

        // The movies the user has NOT seen yet KEEP EM!!!
        // unique movies contains the whole object of each 
        let uniqueMovies = detailedMovies.filter(movie => !alreadyInListsMovieIDs.has(movie.tmdbID));

        // Get list of excluded movies (movies the user HAS seen from the first prompt)
        let excludeList = new Set(detailedMovies.filter(movie => alreadyInListsMovieIDs.has(movie.tmdbID)).map(m => m.Title));

        let excludeListLength = excludeList.size;
        console.log("The number of films user has seen from the list:", excludeListLength);
        console.log("The number of films displayed:", uniqueMovies.length);

        // if there arent enough unqiue movies after filtering, try again
        if (uniqueMovies.length < 5) { 
            console.log("Too many seen movies. Fetching another batch...");

            // prompt AI API again, explicity telling to not include movies the user has seen 
            let finalPrompt = `Provide a list of 20 movies in this exact format:
            1. title ^ year
            2. title ^ year
            ...
            (Strictly follow this format—no extra information, no deviations.)
            DO NOT include these movies: ${Array.from(excludeList).join(', ')}. 
            Ensure there are no repeats.
            If a movie's official title includes intentional stylized spelling (such as numbers replacing letters, symbols, or unique formatting), preserve that as accurately as possible. However, do **not** invent stylization where it does not exist.
            Choose from the following sentiment and think outside the box: ${text}`;

            const result2 = await fetchLLMResponse(finalPrompt);
            const responseText2 = result2?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';

            // raw second response
            console.log(responseText2);

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

                for (const movie of detailedMovies2) {
                    if (!alreadyInListsMovieIDs.has(movie.tmdbID)) {
                        //Only add unique movies while skipping first 10 seen movies
                        if (!skipLimitReached) {
                            newUniqueMovies.push(movie);
                        }
                    } else {
                        //first 10 seen / watchlist movies
                        if (counter < 10) {
                            counter++;
                            continue;
                        }
                        // after skipping first 10 seen, just push everything
                        skipLimitReached = true;
                    }

                    // once skipping is done, push everything
                    if (skipLimitReached) {
                        newUniqueMovies.push(movie);
                    }
                }

                // merge old list, containing fully unique, with new, containing a mixed bag

                // IF WANT FULLY UNIQUE, UNCOMMENT BELOW --> however sometimes the user will get literally nothing 
                // const newUniqueMovies = detailedMovies2.filter(movie => !alreadyInListsMovieIDs.has(movie.tmdbID));
                uniqueMovies = [...uniqueMovies, ...newUniqueMovies];
            }
        }
    
        //CONSDIER USING THIS BECAUSE COULD MAKE IT HARDER FOR USERS TO SPAM THEIR LISTS, THEN USE SAME PROMPT WITH MORE UNIQUE SUGGESTIONS
        if (uniqueMovies.length > 30) {
          let cutoffAmount = uniqueMovies.length % 30;
          uniqueMovies = uniqueMovies.slice(0, -cutoffAmount);
          console.log("The number of films actually displayed (it was over 30):", uniqueMovies.length);
        }
       

        // update the movieList for context
        updateMovieList(uniqueMovies);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log("FINALLY");
        updatePage("Show Swiper");
        setLoading(false);
        setText('');
        Keyboard.dismiss();
    }
  };



  const extractMovieList = (text) => {
    // const listPattern = /(\d{1,2})\.\s+([^\n]+)/g;  
    const listPattern = /(\d{1,2})\.([^\n]+)/g;  
    const movies = [];
    let match;

    while ((match = listPattern.exec(text)) !== null) {
      movies.push(match[2]);  
    }

    return movies;  
  };

  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={[styles.subtitle, {color: currentTheme.textColorSecondary}]}>Enter what kind of movie you want to see next, then let us do the rest</Text>
          {/* <Text>Hi - {userId}</Text> */}

          <TextInput
            style={[styles.textInputBox, {backgroundColor: currentTheme.searchBar}]}
            placeholder="Create a prompt..."
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity style={[styles.submitButton, {borderColor: currentTheme.border2}]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 20,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInputBox: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    width: 300,
    // backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingLeft: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#A44443',
    padding: 12,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 7,
    borderWidth: 1,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 3,
    backgroundColor: '#f5f5f5',
    borderRadius: 17,
    borderColor: 'gray',
  },
  responseText: {
    fontSize: 18,
    color: '#333',
    padding: 7,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
    margin: 10,
  },
  cardText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  poster: {
    width: 133,
    height: 200,
    marginTop: 10,
    alignSelf: 'center',
  }
});
