import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList, Linking } from 'react-native';
import PageContext from '../context/PageContext';
import imdb from '../assets/IMDB.svg.png';
import tmdb2 from '../assets/tmdb2.png';
import { addToSeen, addToWatchlist } from '../database/dbFuncs';
import Disclaimer from './Disclaimer';
import theme from '../services/theme';
import check from '../assets/checkmark.png';
import justWatch from '../assets/JustWatch_Logo.svg.png'
import { useNavigation } from '@react-navigation/native';
import { fetchStreaming } from '../services/apiComms';
import SwiperErrScreen from './SwiperErrScreen';

const MovieList = () => {
  const { movieList, updatePage, userId, colorMode, seenFilms, watchlist} = useContext(PageContext);
  const [isDisabled, setIsDisabled] = useState(true);

  const [seenMovies, setSeenMovies] = useState({});
  const [watchlistMovies, setWatchlistMovies] = useState({});

  const [openStreamingById, setOpenStreamingById] = useState({});
  const [streamingById, setStreamingById] = useState({});
  const [servicesRenderedById, setServicesRenderedById] = useState({});
  const cachedStreaming = useRef({});

  const currentTheme = theme[colorMode];
  const itemWidth = Dimensions.get('window').width * 0.8;
  const spacing = Dimensions.get('window').width * 0.1;
  const noRatingCase = 'N/A';
  const navigation = useNavigation();





  const serviceColors = {
    'Netflix': '#C55151',
    'Max': '#6690FF',
    'Hulu': '#1CE783',
    'Paramount Plus': '#4F92FF',
    'Disney+': '#51B7E3',
    'Amazon Prime': '#69BED3',
    'Apple TV+': '#000000',
    'Peacock': '#FFC800',
    'MGM Plus': '#d6b256',
    'Fubo TV': '#E66B31',
    'Starz': '#308AA0',
    'Not available to stream on our list of services': '#838383'
  };

  const providerKeywords = {
    'Netflix': 'Netflix',
    'Max': 'Max',
    'Hulu': 'Hulu',
    'Paramount': 'Paramount Plus',
    'Disney': 'Disney+',
    'Amazon': 'Amazon Prime',
    'Apple': 'Apple TV+',
    'Peacock': 'Peacock',
    'MGM': 'MGM Plus',
    'Fubo': 'Fubo TV',
    'Starz': 'Starz',
  };

  const getServiceColor = (name) => {
    for (const key in serviceColors) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return serviceColors[key];
      }
    }
    return null;
  };


  const normalizeAndFilterServices = (services) => {
    const unique = new Set();
    services.forEach((service) => {
      for (const keyword in providerKeywords) {
        if (service.toLowerCase().includes(keyword.toLowerCase())) {
          unique.add(providerKeywords[keyword]);
          break;
        }
      }
    });
  
    return [...unique];
  };

  const handleShowStreaming = async (tmdbID) => {
    setOpenStreamingById(prev => ({
      ...prev,
      [tmdbID]: !prev[tmdbID]
    }));
  
    // Only fetch if not cached
    if (!cachedStreaming.current[tmdbID]) {
      // console.log("need to fetch")
      const currServices = await fetchStreaming(tmdbID);
      const finalList = normalizeAndFilterServices(currServices.streamingServices.map(s => s.trim()));
      const result = finalList.length > 0 ? finalList : ["Not available to stream on our list of services"];
      cachedStreaming.current[tmdbID] = result;
  
      setStreamingById(prev => ({
        ...prev,
        [tmdbID]: result
      }));
      
      setTimeout(() => {
        setServicesRenderedById(prev => ({
          ...prev,
          [tmdbID]: true
        }));
      }, 0);
    }
  };
    

  const handleAddToSeen = async (movie) => {
    setSeenMovies(prev => ({ ...prev, [movie.tmdbID]: true }));

    // Remove from watchlist if present
    setWatchlistMovies(prev => ({ ...prev, [movie.tmdbID]: false }));

    await addToSeen(
      movie.Title, movie.Director, movie.Year, movie.PosterPath,
      movie.Description, movie.Rating, movie.tmdbID, userId
    );
  };

  const handleAddToWatchlist = async (movie) => {
    setWatchlistMovies(prev => ({ ...prev, [movie.tmdbID]: true }));

    await addToWatchlist(
      movie.Title, movie.Director, movie.Year, movie.PosterPath,
      movie.Description, movie.Rating, movie.tmdbID, userId
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDisabled(false);
    }, 1500); 

    const seenState = {};
    const watchlistState = {};

    movieList.forEach(movie => {
      seenState[movie.tmdbID] = seenFilms.some(seenMovie => seenMovie.tmdbID === movie.tmdbID);
      watchlistState[movie.tmdbID] = watchlist.some(watchMovie => watchMovie.tmdbID === movie.tmdbID);
    });

    setSeenMovies(seenState);
    setWatchlistMovies(watchlistState);
    return () => clearTimeout(timer);
}, [movieList, seenFilms, watchlist]);

  


  if (movieList[0] === 'This is a special error case !@#$') {
    return (
      <View style={{backgroundColor: currentTheme.swiperBackground, height: '100%', width: '100%'}}>
        <SwiperErrScreen/>
      </View>
    )
  }
  else {
    return (
    
      <View style={[styles.container, {backgroundColor: currentTheme.swiperBackground}]}>
        {/* Exit Button */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => {
            updatePage("NULL");
            navigation.replace("Recs");
          }}
          disabled={isDisabled}
        >
          <Text allowFontScaling={false} style={styles.buttonText}>Exit</Text>
        </TouchableOpacity>
        <Disclaimer/>

        {/* Movie List */}
        <FlatList
          data={movieList.filter(item => !item.error)} // Filter out movies with errors
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: spacing }}
          decelerationRate="fast"
          snapToInterval={itemWidth + spacing}
          snapToAlignment="start"
          renderItem={({ item }) => (
            <View style={[styles.card, {backgroundColor: currentTheme.gridItemColor, shadowColor: currentTheme.shadowColor, borderColor: currentTheme.border, width: itemWidth, marginRight: spacing }]}>
              {/* Scrollable Content */}
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.cardContent}>
                <Text style={[styles.cardTextTitle, {color: currentTheme.movieTitle}]}>{item.Title}</Text>
                {item.PosterPath && (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${item.PosterPath}` }}
                    style={styles.poster}
                  />
                )}
                <View>
                  <TouchableOpacity onPress={() => {
                    // console.log(item.Title)
                    handleShowStreaming(item.tmdbID)
                  }
                  }>
                    <Text style={{textAlign: "center", alignItems: "flex-start", color: "#838383", fontSize: 17, marginTop: 3}}>Where to watch ▽</Text>
                  </TouchableOpacity>
                </View>
                {openStreamingById[item.tmdbID] && servicesRenderedById[item.tmdbID] && (
                  <>
                  <View>
                    {streamingById[item.tmdbID]?.map((service, index) => (
                      <Text
                        key={index}
                        style={{
                          textAlign: 'center',
                          marginBottom: 2.5,
                          fontWeight: 'bold',
                          color: getServiceColor(service)
                        }}
                      >
                        {service}
                      </Text>
                    )) || null}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 7}}>
                    <Text
                      style={{ color: currentTheme.textColorSecondary, fontSize: 13.1 }}
                      allowFontScaling={false}
                    >
                      Link to full list here:
                    </Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`https://www.themoviedb.org/movie/${item.tmdbID}/watch`)}>
                      <Image
                        source={justWatch}
                        style={{ width: 72, height: 15, resizeMode: 'contain', marginTop: 2, marginLeft: 5 }}
                      />
                    </TouchableOpacity>
                  </View>
                  </>
                )}
                <View style={{
                    width: Dimensions.get('window').width * 0.5,
                    height: 3,
                    backgroundColor: currentTheme.textColor,
                    opacity: 0.2,
                    borderRadius: 3,
                    marginTop: 2,
                    alignSelf: 'center',
                  }} />
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary, marginTop: 12}]}>
                  Directed by: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{item.Director}</Text>
                </Text>
                <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                  Released: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{item.Year}</Text>
                </Text>
                
                <View style={styles.ratingContainer}>
                  <Text style={[styles.cardText, {color: currentTheme.textColorSecondary}]}>
                    Rating: <Text style={[styles.bold, styles.cardText, {color: currentTheme.textColor}]}>{item.Rating ? item.Rating : noRatingCase}</Text>
                  </Text>
                  <Image style={styles.imdbLogo} source={tmdb2}></Image>
                </View>
                <Text style={[styles.descriptionText, {color: currentTheme.textColorSecondary, borderColor: currentTheme.border, backgroundColor: currentTheme.description}]}>{item.Description}</Text>
              </ScrollView>
          
              {/* Buttons at the Bottom */}
              <View style={styles.btnContainer}>

              <TouchableOpacity
                style={[styles.watchlistButton, { backgroundColor: currentTheme.watchlistBtn }]}
                onPress={() => handleAddToWatchlist(item)}
              >
                <Text style={styles.buttonText} allowFontScaling={false} >Add to Watchlist</Text>
                {watchlistMovies[item.tmdbID] ? <Image style={styles.checkmark} source={check} /> : null}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.seenButton, { backgroundColor: currentTheme.seenBtn }]}
                onPress={() => handleAddToSeen(item)}
              >
                <Text style={styles.buttonText} allowFontScaling={false} >I've Seen This</Text>
                {seenMovies[item.tmdbID] ? <Image style={styles.checkmark} source={check} /> : null}
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
    width: Dimensions.get('window').width * 1,
    height: '100%',
    paddingBottom: 20,
  },
  exitButton: {
    position: 'absolute',
    top: 5,
    left: 4,
    backgroundColor: "#ea2121",
    padding: 7,
    borderRadius: 40,
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
    // borderWidth: 1,
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
    // height: Dimensions.get('height').width * 0.5,
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
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#57CB32",
  },
  watchlistButton: {
    backgroundColor: "#B2B2B2",
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#969696",
  },
  buttonText: {
    // fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  imdbLogo: {
    width: 30,
    height: 17,
    marginLeft: 5,
    resizeMode: 'contain',
  },
  ratingContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  checkmark: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    position: 'absolute',
    right: 5,
    top: 2.5,
    opacity: 0.3,
  }
});


export default MovieList;
