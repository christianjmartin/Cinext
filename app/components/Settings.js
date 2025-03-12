import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { updateColorPreference } from '../database/preferences.js';
import { useNavigation } from '@react-navigation/native';
import PageContext from '../context/PageContext';
import vader from '../assets/vader.png';
import yoda from '../assets/yoda.png';
import theme from '../services/theme.js';
import arrow from '../assets/arrow.webp';
import arrow2 from '../assets/arrow2.png';

const Settings = () => {
    const { colorMode, updateColorMode, userId, updatePage} = useContext(PageContext);
    const currentTheme = theme[colorMode];
    const navigation = useNavigation();
    const togglePosition = useSharedValue(colorMode === 'dark' ? 105 : 5);

    // toggles between light and dark mode, calling updateColorMode from context 
    const toggleTheme = () => {
        togglePosition.value = withTiming(colorMode === 'dark' ? 5 : 105, { duration: 250 });
        console.log(colorMode);
        let updatedColor;
        if (colorMode === 'dark') {
            updatedColor = 'light';
        } else { updatedColor = 'dark'; }
        // console.log("updated color is" , updatedColor)
        updateColorPreference(updatedColor, userId);
        updateColorMode(); 
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: togglePosition.value }],
    }));

    return (
        <>
        <View style={[styles.head, {backgroundColor: currentTheme.background}]}>
            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => {navigation.goBack()
                                updatePage("NULL")}}
                >
                {colorMode === "dark" ? <Image source={arrow2} style={styles.backBtn}></Image> 
                : <Image source={arrow} style={styles.backBtn}></Image>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.faqBtn} onPress={() => {
                navigation.navigate("FAQ");
            }}>
                <Text style={[styles.faqText, {color: currentTheme.textColorSecondary}]}>FAQ</Text>
            </TouchableOpacity>
        </View>
        <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
            <TouchableOpacity onPress={toggleTheme} style={styles.toggleContainer}>
                <Animated.View style={[styles.toggleCircle, animatedStyle]}>
                    <Text style={styles.emoji}>{colorMode === 'dark' ? <Text>🌙</Text>: <Text>🌞</Text>}</Text>
                </Animated.View>
            </TouchableOpacity>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    toggleContainer: {
        width: 200,
        height: 100,
        backgroundColor: '#ccc',
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        marginBottom: 100,
    },
    toggleCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    emoji: {
        fontSize: 50,
    },
    exitButton: {
        left: -10,
    },
    colorIcon: {
        height: 70,
        width: 70,
        resizeMode: 'contain',
    },
    faqText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    faqBtn: {
        padding: 12,
        paddingRight: 15,
        paddingTop: 15,
    },
    backBtn: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
        opacity: 0.42,
        borderRadius: 20,
    },

});

export default Settings;
