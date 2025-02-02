import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import PageContext from '../context/PageContext';

import Recs from './Recs';
import Watchlist from './Watchlist';
import NavBar from './NavBar';
import Header from './Header';
import MovieSwiper from './Swiper';
import SeenFilms from './SeenFilms';
import StaticMovie from './StaticMovie';
import Settings from './Settings';
import theme from '../services/theme';

// handles page navigation within the app via conditional rendering
export default function Page() {
  const { page, colorMode } = useContext(PageContext);
  const currentTheme = theme[colorMode];

  return (
    <View style={[styles.container, {backgroundColor: currentTheme.background}]}>

      {/* header placement */}
      <View style={styles.header}>
        <Header />
      </View>

      {/* the main screen of the app (within both header and navigation bar) */}
      <View style={styles.main}>
        {page === "Recs" ? <Recs /> : null}
        {page === "Watchlist" ? <Watchlist/> : null}
        {page === "Seen Films" ? <SeenFilms/> : null}
        {page === "Show Swiper" ? <MovieSwiper/> : null}
        {page === "Static Movie" ? <StaticMovie/> : null}
        {page === "Settings" ? <Settings/> : null}
      </View>

      {/* bottom navigation bar placement */}
      <View style={styles.navBar}>
        {page != "Show Swiper" ? <NavBar/> : null}
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#A44443',
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#A44443',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
