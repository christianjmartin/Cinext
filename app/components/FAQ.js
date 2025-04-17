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


const FAQ = () => {
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
                <View style={styles.QA}>
                    <Text style={[styles.infoContainer, styles.bold, {color: currentTheme.textColorSecondary}]}>What are the kinds of things I can ask for in a movie?</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>There is a very wide range of things to ask for. Some areas for example, but not limited to, are: Emotions, time periods, genres, niches, themes, directors, actors, visual style, writing style, pacing, tone, mood, and SO much more. Thinking outside the box and being detailed in your requests tends to yeild the best results!</Text>
                </View>
                <View style={styles.QA}>
                    <Text style={[styles.infoContainer, styles.bold, {color: currentTheme.textColorSecondary}]}>My request is taking a while, what can I do?</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>In order to provide the best recommendations possible, some processing time is needed. This ranges from around 15-60 seconds. During this time, you are able to browse the rest of the app while your recommendations process, however we don't advise leaving the app during this time as it can mess up the process.</Text>
                </View>
                <View style={styles.QA}>
                    <Text style={[styles.infoContainer, styles.bold, {color: currentTheme.textColorSecondary}]}>A movie was suggested that was in one of my lists, and I had the toggle off, whats going on?</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>After extensive filtering, the film recommendation algorithm keeps 5 movies no matter what, to prevent empty suggestions. Try refining and further detailing your ask to pinpoint new movies. Be creative!</Text>
                </View>
                <View style={styles.QA}>
                    <Text style={[styles.infoContainer, styles.bold, {color: currentTheme.textColorSecondary}]}>Why did my request count for the day go down by 2 after one request?</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>If too many movies were filtered from the recommendations, we need to get more to satisy the request to provide the best suggestions possible.</Text>
                </View>
                <View style={styles.QA}>
                    <Text style={[styles.infoContainer, styles.bold, {color: currentTheme.textColorSecondary}]}>Where are the ratings coming from?</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>Ratings come directly from TMDB, being an average of user ratings on that service.</Text>
                </View>
                <View style={styles.QA}>
                    <Text style={[styles.infoContainer, styles.bold, {color: currentTheme.textColorSecondary}]}>My requests just reset at an odd time?</Text>
                    <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>Requests per day reset at 12:00 AM CST, so this will be different for users based on location.</Text>
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
    },
    bold: {
        fontWeight: 'bold',
    },
    container: {
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
        width: Dimensions.get('window').width * 0.95,
        padding: 5,
    },
    exitButton: {
        left: -10,
    },
    QA: {
        padding: 24,
    },


});

export default FAQ;
