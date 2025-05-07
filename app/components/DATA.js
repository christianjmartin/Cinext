import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { updateColorPreference } from '../database/preferences.js';
import { useNavigation } from '@react-navigation/native';
import PageContext from '../context/PageContext.js';
import tmdbOfficial from '../assets/tmdbOfficial.png';
import theme from '../services/theme.js';
import arrow from '../assets/arrow.webp';
import arrow2 from '../assets/arrow2.png';


const DATA = () => {
    const { colorMode, updateColorMode, userId, updatePage} = useContext(PageContext);
    const currentTheme = theme[colorMode];
    const navigation = useNavigation();
    
    return (
        <>
        <View style={[styles.head, {backgroundColor: currentTheme.background}]}>
            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => {navigation.goBack()
                                updatePage("Settings")}}
                >
                {colorMode === "dark" ? <Image source={arrow2} style={styles.backBtn}></Image> 
                : <Image source={arrow} style={styles.backBtn}></Image>}
            </TouchableOpacity>
        </View>
        <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
            <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>All film data used by Cinext, including Posters, Titles, Directors, Descriptions, Ratings and Dates is provided by TMDB (The Movie Database).</Text>
            <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>This product uses the TMDB API but is not endorsed or certified by TMDB.</Text>
            <Image source={tmdbOfficial} style={styles.tmdbLogo}></Image>
        </View>
        </>
    );
};

const styles = StyleSheet.create({
    head: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: 70,
    },
    container: {
        alignItems: 'center',
        height: '100%',
    },
    backBtn: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        opacity: 0.42,
        borderRadius: 20,
    },
    infoContainer: {
        width: Dimensions.get('window').width * 0.8,
        marginVertical: 7,
    },
    tmdbLogo: {
        width: Dimensions.get('window').width * 0.8,
        resizeMode: 'contain',
        marginTop: -80,
    },
    exitButton: {
        left: -10,
    },


});

export default DATA;
