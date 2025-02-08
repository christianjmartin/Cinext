import React, { useEffect, useState, useContext } from 'react';
import { Text, View, FlatList, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { addToSeen, addToWatchlist } from '../services/dbFuncs'
import imdb from '../assets/IMDB.svg.png';
import PageContext from '../context/PageContext';
import arrow from '../assets/arrow.webp';
import arrow2 from '../assets/arrow2.png';
import theme from '../services/theme';


const StaticMovie = () => {
    const { staticMovie, previousPage, updatePage, userId, colorMode} = useContext(PageContext);
    const currentTheme = theme[colorMode];

    let noRating = 'N/A';

    const handleAddToSeen = async () => {
      await addToSeen(
          staticMovie.Title,
          staticMovie.Director,
          staticMovie.Year,
          staticMovie.PosterPath,
          staticMovie.Description,
          staticMovie.Rating,
          staticMovie.tmdbID,
          userId
      );
    };
    
    const handleAddToWatchlist = async () => {
      await addToWatchlist(
          staticMovie.Title,
          staticMovie.Director,
          staticMovie.Year,
          staticMovie.PosterPath,
          staticMovie.Description,
          staticMovie.Rating,
          staticMovie.tmdbID,
          userId
      );
    };



    return (
    <>
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => updatePage(previousPage)}
                >
                {colorMode === "dark" ? <Image source={arrow2} style={styles.backBtn}></Image> 
                : <Image source={arrow} style={styles.backBtn}></Image>}
            </TouchableOpacity>
            <View style={[styles.card, {backgroundColor: currentTheme.gridItemColor, shadowColor: currentTheme.shadowColor, borderColor: currentTheme.border}]}>
              {/* Scrollable Content */}
              <ScrollView style={styles.cardContent}>
                <Text style={[styles.cardTextTitle, {color: currentTheme.movieTitle}]}>{staticMovie.Title}</Text>
                {staticMovie.PosterPath && (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${staticMovie.PosterPath}` }}
                    style={styles.poster}
                  />
                )}
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Directed by: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{staticMovie.Director}</Text>
                </Text>
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Released: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{staticMovie.Year}</Text>
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                    Rating: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{staticMovie.Rating ? staticMovie.Rating : noRating}</Text>
                  </Text>
                  <Image style={styles.imdbLogo} source={imdb}></Image>
                </View>
                <Text style={[styles.descriptionText, {color: currentTheme.textColorSecondary, borderColor: currentTheme.border, backgroundColor: currentTheme.description}]}>{staticMovie.Description}</Text>
              </ScrollView>
          
              {/* Buttons at the Bottom */}
              <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.seenButton} onPress={handleAddToSeen}>
                  <Text style={styles.buttonText}>I've Seen This</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.watchlistButton} onPress={handleAddToWatchlist}>
                  <Text style={styles.buttonText}>Add to Watchlist</Text>
                </TouchableOpacity>
              </View>
            </View>
        </View> 
    </>
    )  
}

const styles = StyleSheet.create({
    container: {
      marginBottom: 35,
    },
    exitButton: {
      position: 'absolute',
      top: 52,
      left: -5,
      zIndex: 10, 
    },
    backBtn: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
      opacity: 0.42,
      borderRadius: 20,
    },
    card: {
      justifyContent: 'center',
      borderRadius: 10,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      marginTop: 38,
      borderWidth: 2,
    },
    cardText: {
      fontSize: 16,
      marginVertical: 2,
      textAlign: 'center',
    },
    descriptionText: {
      fontSize: 15, 
      marginVertical: 10,
      textAlign: 'left',
      padding: 7,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderRadius: 5,
    },
    bold: {
      fontWeight: 'bold',
    },
    cardTextTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 5,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    poster: {
      width: '100%',
      height: Dimensions.get('window').width * 1.1,
      resizeMode: 'contain',
      marginTop: 5,
    },
    btnContainer: {
      flexDirection: "row",
      justifyContent: 'center',
      padding: 15,
      paddingBottom: 5,
    },
    seenButton: {
      backgroundColor: "#8EE357",
      padding: 12,
      marginHorizontal: 5,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#62B42D",
    },
    watchlistButton: {
      backgroundColor: "#B2B2B2",
      padding: 12,
      marginHorizontal: 5,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#979797",
    },
    buttonText: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
    },
    imdbLogo: {
      width: 40,
      height: 20,
      marginLeft: 5,
      resizeMode: 'contain',
    },
    ratingContainer: {
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center', 
    }
  });

export default StaticMovie;
