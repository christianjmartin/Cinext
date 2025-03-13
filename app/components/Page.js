import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import PageContext from '../context/PageContext';
import Loading from './Loading';
import theme from '../services/theme';

import Recs from './Recs';
import Watchlist from './Watchlist';
import SeenFilms from './SeenFilms';
import MovieSwiper from './Swiper';
import StaticMovie from './StaticMovie';
import Settings from './Settings';
import DATA from './DATA';
import CONTACT from './CONTACT';
import ABOUT from './ABOUT';
import FAQ from './FAQ';

import Header from './Header';
import NavBar from './NavBar';

const Stack = createStackNavigator();

export default function Page() {
  const { colorMode, initialLoad, page} = useContext(PageContext);
  const currentTheme = theme[colorMode];

  if (initialLoad) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      
      {/* Header - Always Visible */}
      <View>
        <Header />
      </View>

      {/* Navigation Screens */}
      <View style={styles.main}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="Recs" component={Recs} />
          <Stack.Screen name="Watchlist" component={Watchlist} />
          <Stack.Screen name="Seen Films" component={SeenFilms} />
          <Stack.Screen name="Show Swiper" component={MovieSwiper} />
          <Stack.Screen name="Static Movie" component={StaticMovie} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="DATA" component={DATA}/>
          <Stack.Screen name="CONTACT" component={CONTACT}/>
          <Stack.Screen name="ABOUT" component={ABOUT}/>
          <Stack.Screen name="FAQ" component={FAQ}/>
        </Stack.Navigator>
      </View>

      {/* Bottom Navigation */}
      <View>
        {page !== "Show Swiper" && <NavBar />}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
});
