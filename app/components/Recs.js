import React, { useContext, useState } from 'react';
import PageContext from '../context/PageContext';  
import { View, Text, StyleSheet, TextInput, FlatList, Dimensions, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';  
import { fetchLLMResponse } from '../services/geminiapi';
import { fetchMovieDetails } from '../services/tmdbApi.js';
import Swiper from 'react-native-swiper';

export default function Recs() {
  const { page, updatePage, updateMovieList, userId} = useContext(PageContext);  
  const [text, setText] = useState('');  
  // const [response, setResponse] = useState('');  
  // const [movieList, setMovieList] = useState([]);  
  const [loading, setLoading] = useState(false);  

  const handleSubmit = async () => {
    console.log('Submitted:', text);
    setLoading(true);
    // setResponse('');
    // setMovieList([]); // Clear previous movie list
  
    const prePromptText =
      "Provide a list of 10 movies, in the form 1. title ^ year 2. title ^ year... (DO NOT provide any other information and do not deviate from the format I specified, and if there is an error or unfufillment case of any kind please start the response with error777 so I can parse) from the following sentiment: ";
    const finalPrompt = prePromptText + text;
  
    try {
      // Fetch the response from the LLM
      const result = await fetchLLMResponse(finalPrompt);
      const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No valid response';
      console.log(responseText);
      // console.log(result);
  
      // Extract movie list from the response
      const movies = extractMovieList(responseText);
  
      if (movies.length === 0) {
        // setResponse('Sorry, this request cannot be fulfilled, please try another prompt!');
        updateMovieList(['This is a special error case !@#$']);
      } else {
        // setResponse(responseText);
  
        // Fetch detailed data for each movie from the backend
        const detailedMovies = [];
        for (const movie of movies) {
          try {
            const detailedMovie = await fetchMovieDetails(movie.trim());
            if (detailedMovie) {
              detailedMovies.push(detailedMovie);
            } else {
              detailedMovies.push({ Title: movie.trim(), error: true }); // Add default for missing data
            }
          } catch (error) {
            console.error(`Error fetching details for ${movie}:`, error);
            detailedMovies.push({ Title: movie.trim(), error: true }); // Add default for errors
          }
        }
  
        // Update movieList with detailed movie data
        console.log(detailedMovies[0]);
        updateMovieList(detailedMovies);
      }
    } catch (error) {
      console.error('Error:', error);
      // setResponse('Error fetching response.');
    } finally {
      console.log("FINALLY");
      updatePage("Show Swiper");
      setLoading(false);
    }
  
    setText('');
    Keyboard.dismiss();
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
          <Text style={styles.subtitle}>Enter what kind of movie you want to see next, then let us do the rest</Text>
          {/* <Text>Hi - {userId}</Text> */}

          <TextInput
            style={styles.textInputBox}
            placeholder="Create a prompt..."
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>

          {/* Display the Gemini response */}
          {/* {response && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          )} */}

          {/* If movieList has items, render the swiper component */}
          {/* {movieList.length > 0 && (
            <FlatList
              data={movieList}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.responseContainer}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  {item.error ? (
                    <Text style={styles.cardText}>Error: {item.error}</Text>
                  ) : (
                    <>
                      <Text style={styles.cardText}>Title: {item.title}</Text>
                      <Text style={styles.cardText}>Director: {item.director}</Text>
                      {item.posterPath && (
                        <Image
                          source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                          style={styles.poster}
                        />
                      )}
                    </>
                  )}
                </View>
              )}
            />
          )} */}
          

          

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
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingLeft: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6C100F',
    padding: 12,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 7,
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
