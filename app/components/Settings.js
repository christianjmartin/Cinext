import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import PageContext from '../context/PageContext';

const Settings = () => {
    const { colorMode, updateColorMode } = useContext(PageContext);
    const togglePosition = useSharedValue(colorMode === 'dark' ? 105 : 5);

    const toggleTheme = () => {
        togglePosition.value = withTiming(colorMode === 'dark' ? 5 : 105, { duration: 250 });
        updateColorMode(); 
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: togglePosition.value }],
    }));

    return (
        <TouchableOpacity onPress={toggleTheme} style={styles.toggleContainer}>
            <Animated.View style={[styles.toggleCircle, animatedStyle]}>
                <Text style={styles.emoji}>{colorMode === 'dark' ? '🌙' : '🌞'}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        width: 200, // Width of toggle
        height: 100,
        backgroundColor: '#ccc', // Light grey background
        borderRadius: 50, // Rounded edges
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        position: 'relative',
    },
    toggleCircle: {
        width: 90,
        height: 90,
        borderRadius: 45, // Makes it circular
        backgroundColor: 'white', // Circle color
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    emoji: {
        fontSize: 40, // Adjust emoji size
    },
});

export default Settings;
