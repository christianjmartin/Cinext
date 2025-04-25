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
import PRIVACY from './PRIVACY';
import OfflineScreen from './Offline';
import MaintenanceScreen from './Maintenance';
import BlankNavBar from './BlankNavBar';
import BlankNavBar2 from './BlankNavBar2';
import BlankHeader from './BlankHeader';

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
      {(page !== "maintenance" && page !== "offline")? 
      <View>
        <Header />
      </View>
      :
      <View>
        <BlankHeader/>
      </View>
      }

      {/* Navigation Screens */}
      <View style={styles.main}>
        {page === "offline" ? (
          <OfflineScreen />
        ) : 

        page === "maintenance" ? (
          <MaintenanceScreen/>
        ) :
        
        (
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
            <Stack.Screen name="PRIVACY" component={PRIVACY}/>
          </Stack.Navigator>
        )}
      </View>

      {/* Bottom Navigation */}
      {page !== "Show Swiper" && page !== "offline" && page !== "maintenance" && (
        <View>
          <NavBar />
        </View>
      )}
      {page === "Show Swiper" && (
        <View>
          <BlankNavBar />
        </View>
      )}
      {(page === "maintenance" || page === "offline") && (
        <View>
          <BlankNavBar2 />
        </View>
      )}

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
