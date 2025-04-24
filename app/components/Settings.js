import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { updateColorPreference, updateNavColorPreference } from '../database/preferences.js';
import { useNavigation } from '@react-navigation/native';
import PageContext from '../context/PageContext';
import vader from '../assets/vader.png';
import yoda from '../assets/yoda.png';
import theme from '../services/theme.js';
import arrow from '../assets/arrow.webp';
import arrow2 from '../assets/arrow2.png';

const Settings = () => {
    const { colorMode, updateColorMode, userId, updatePage, navColorMode, setNavColorMode} = useContext(PageContext);
    const currentTheme = theme[colorMode];
    const navigation = useNavigation();
    const togglePosition = useSharedValue(colorMode === 'dark' ? 105 : 5);
    const navTogglePosition = useSharedValue(navColorMode === 'black' ? 105 : 5);

    // toggles between light and dark mode, calling updateColorMode from context 
    const toggleTheme = () => {
        togglePosition.value = withTiming(colorMode === 'dark' ? 5 : 105, { duration: 250 });
        // console.log(colorMode);
        let updatedColor;
        if (colorMode === 'dark') {
            updatedColor = 'light';
        } else { updatedColor = 'dark'; }
        // console.log("updated color is" , updatedColor)
        updateColorPreference(updatedColor, userId);
        updateColorMode(); 
    };

    const toggleNavTheme = () => {
        const newColor = navColorMode === 'black' ? 'red' : 'black';
        navTogglePosition.value = withTiming(newColor === 'red' ? 5 : 105, { duration: 250 });
        updateNavColorPreference(newColor, userId);
        setNavColorMode(newColor);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: togglePosition.value }],
    }));

    const navAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: navTogglePosition.value }],
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
            <View style={styles.col}>
                <TouchableOpacity style={styles.faqBtn} onPress={() => {
                    navigation.navigate("DATA");
                }}>
                    <Text style={[styles.faqText, {color: currentTheme.textColorSecondary}]}>Film Data</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.faqBtn} onPress={() => {
                    navigation.navigate("CONTACT");
                }}>
                    <Text style={[styles.faqText, {color: currentTheme.textColorSecondary}]}>Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.faqBtn} onPress={() => {
                    navigation.navigate("PRIVACY");
                }}>
                    <Text style={[styles.faqText, {color: currentTheme.textColorSecondary}]}>Privacy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.faqBtn} onPress={() => {
                    navigation.navigate("ABOUT");
                }}>
                    <Text style={[styles.faqText, {color: currentTheme.textColorSecondary}]}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.faqBtn} onPress={() => {
                    navigation.navigate("FAQ");
                }}>
                    <Text style={[styles.faqText, {color: currentTheme.textColorSecondary}]}>FAQ</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <TouchableOpacity onPress={toggleTheme} style={styles.toggleContainer}>
                <Animated.View style={[styles.toggleCircle, animatedStyle]}>
                <Text allowFontScaling={false} style={styles.emoji}>{colorMode === 'dark' ? '🌙' : '🌞'}</Text>
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleNavTheme} style={styles.toggleContainer}>
                <Animated.View style={[styles.toggleCircle, navAnimatedStyle]}>
                <View style={[navColorMode === 'black' ? styles.emojiBlack : styles.emojiRed]}>
                    <Text allowFontScaling={false} style={styles.emoji}>
                    {navColorMode === 'black' ? '⚫' : '🔴'}
                    </Text>
                </View>
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
    },
    col: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-end', 
    },
    container: {
        flex: 1,
        paddingTop: 30,
        paddingBottom: 240,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 50,
    },
    toggleContainer: {
        width: 200,
        height: 100,
        backgroundColor: '#ccc',
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        marginBottom: 0,
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
    emojiBlack: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 3,
    },
    emojiRed: {
        justifyContent: 'center',
        alignItems: 'center',
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
        textAlign: 'right',
    },
    faqBtn: {
        padding: 12,
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
