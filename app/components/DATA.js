import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { updateColorPreference } from '../database/preferences.js';
import { useNavigation } from '@react-navigation/native';
import PageContext from '../context/PageContext.js';
import tmdbOfficial from '../assets/tmdbOfficial.png';
import justWatch from '../assets/JustWatch_Logo.svg.png';
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
        <ScrollView style={[styles.container, {backgroundColor: currentTheme.background}]}>
            <View style={{alignItems: 'center'}}>
                <View style={{alignItems: 'center'}}>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>All film data used by Cinext, including Posters, Titles, Directors, Descriptions, Ratings and Dates is provided by TMDB (The Movie Database).</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>This product uses the TMDB API but is not endorsed or certified by TMDB.</Text>
                    <Image source={tmdbOfficial} style={styles.tmdbLogo}></Image>
                </View>
                <View style={{marginTop: 80, alignItems: 'center'}}>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary, marginTop: -80}]}>Streaming data provided by JustWatch.</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>Supported streaming services are: Netflix, Max, Hulu, Paramount Plus, Disney+, Amazon Prime, Apple TV+, Peacock, MGM Plus, Starz, and Fubo TV.</Text>
                    <Image source={justWatch} style={styles.jwLogo}></Image>
                </View>
            </View>
        </ScrollView>
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
        // alignItems: 'center',
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
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    jwLogo: {
        width: 200,
        height: 100,
        resizeMode: 'contain',
    },
    exitButton: {
        left: -10,
    },


});

export default DATA;
