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


const ABOUT = () => {
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
            <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>
                    MovieNext was created with the inspiration of scrolling through streaming service after streaming service, 
                    day after day, taking hours to find a new movie to see. Reminiscing on the hours spent shuffling through
                    these movies I had already seen, the idea of MovieNext was conspired.
            </Text>
        </View>
        </>
    );
};

const styles = StyleSheet.create({
    head: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
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
        textAlign: 'center',
        width: Dimensions.get('window').width * 0.8,
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

export default ABOUT;
