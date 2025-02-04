import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import PageContext from '../context/PageContext';
import imdb from '../assets/IMDB.svg.png';
import { addToSeen, addToWatchlist } from '../services/dbFuncs';
import theme from '../services/theme';

const MovieList = () => {
  const { movieList, updatePage, userId, colorMode} = useContext(PageContext);

  const currentTheme = theme[colorMode];
  const itemWidth = Dimensions.get('window').width * 0.8;
  const spacing = Dimensions.get('window').width * 0.1;
  const noRatingCase = 'N/A';

  const handleAddToSeen = async (Title, Director, Year, PosterPath, Description, Rating, tmdbID) => {
    await addToSeen(
        Title,
        Director,
        Year,
        PosterPath,
        Description,
        Rating,
        tmdbID,
        userId
    );
  };

  const handleAddToWatchlist = async (Title, Director, Year, PosterPath, Description, Rating, tmdbID) => {
    await addToWatchlist(
        Title,
        Director,
        Year,
        PosterPath,
        Description,
        Rating,
        tmdbID,
        userId
    );
  };
  


  if (movieList[0] === 'This is a special error case !@#$') {
    return (
      <>
      <View style={[styles.container, {backgroundColor: currentTheme.swiperBackground}]}>
      <TouchableOpacity
          style={styles.exitButton}
          onPress={() => updatePage("Recs")}
        >
          <Text style={styles.buttonText}>Go back and say sum else crody</Text>
      </TouchableOpacity>
      </View>
      </>
    )
  }
  else {
    return (
      <View style={[styles.container, {backgroundColor: currentTheme.swiperBackground}]}>
        {/* Exit Button */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => updatePage("Recs")}
        >
          <Text style={styles.buttonText}>Exit</Text>
        </TouchableOpacity>

        {/* Movie List */}
        <FlatList
          data={movieList.filter(item => !item.error)} // Filter out movies with errors
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: spacing / 2 }}
          decelerationRate="fast"
          snapToInterval={itemWidth + spacing}
          snapToAlignment="start"
          renderItem={({ item }) => (
            <View style={[styles.card, {backgroundColor: currentTheme.gridItemColor, shadowColor: currentTheme.shadowColor, borderColor: currentTheme.border, width: itemWidth, marginRight: spacing }]}>
              {/* Scrollable Content */}
              <ScrollView style={styles.cardContent}>
                <Text style={[styles.cardTextTitle, {color: currentTheme.movieTitle}]}>{item.Title}</Text>
                {item.PosterPath && (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${item.PosterPath}` }}
                    style={styles.poster}
                  />
                )}
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Directed by: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{item.Director}</Text>
                </Text>
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Released: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{item.Year}</Text>
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                    Rating: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{item.Rating ? item.Rating : noRatingCase}</Text>
                  </Text>
                  <Image style={styles.imdbLogo} source={imdb}></Image>
                </View>
                <Text style={[styles.descriptionText, {color: currentTheme.textColorSecondary, borderColor: currentTheme.border, backgroundColor: currentTheme.description}]}>{item.Description}</Text>
              </ScrollView>
          
              {/* Buttons at the Bottom */}
              <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.seenButton} onPress={() => handleAddToSeen(item.Title, item.Director, item.Year, item.PosterPath, item.Description, item.Rating, item.tmdbID)}>
                  <Text style={styles.buttonText}>I've Seen This</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.watchlistButton} onPress={() => handleAddToWatchlist(item.Title, item.Director, item.Year, item.PosterPath, item.Description, item.Rating, item.tmdbID)}>
                  <Text style={styles.buttonText}>Add to Watchlist</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    width: Dimensions.get('window').width * 0.9,
  },
  exitButton: {
    position: 'absolute',
    top: 5,
    left: 0,
    backgroundColor: "#ea2121",
    padding: 7,
    borderRadius: 5,
    borderWidth: 0.7,
    borderColor: "#681212",
    zIndex: 10, 
    paddingHorizontal: 15,
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
    marginTop: 50,
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
    color: '#580000',
  },
  poster: {
    width: '100%',
    height: Dimensions.get('window').width * 1,
    resizeMode: 'contain',
    marginTop: 10,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    padding: 15,
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


export default MovieList;
