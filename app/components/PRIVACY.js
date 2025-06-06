import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Dimensions, ScrollView} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { updateColorPreference } from '../database/preferences.js';
import { useNavigation } from '@react-navigation/native';
import PageContext from '../context/PageContext.js';
import tmdbOfficial from '../assets/tmdbOfficial.png';
import theme from '../services/theme.js';
import arrow from '../assets/arrow.webp';
import arrow2 from '../assets/arrow2.png';


const PRIVACY = () => {
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
        <ScrollView style={[styles.scroll, {backgroundColor: currentTheme.background}]}>
            <View style={{alignItems: 'center'}}>
                <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>Cinext does not collect personally identifiable information. We use anonymous authentication to allow users to access features such as saving watchlists, marking films as seen, and limiting daily requests.</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>Cinext uses the TMDB API for movie data, the Google Gemini API for AI-powered recommendations, and Supabase to manage authentication and store user preferences and films.</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>User preferences (e.g. dark mode, seen films, watchlist choices, list inclusions) are linked to a randomly assigned, anonymous user ID. All data is securely stored and used only to provide core app functionality and basic personalization. We do not share this data with third parties or use it for advertising or analytics.</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>We do not collect names, emails, phone numbers, or device identifiers.</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>If you have any questions or concerns about your privacy while using Cinext, feel free to contact us at cinextofficial@gmail.com.</Text>
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
        alignItems: 'center',
        height: '100%',
    },
    scroll: {
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

export default PRIVACY;
