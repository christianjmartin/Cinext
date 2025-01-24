import React from 'react';
import camera from '../assets/camera.png';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'; 

export default function Header() {
    return (
        <View style={styles.headerContainer}>
            <Image source={camera} style={styles.image} /> 
            <Text style={styles.title}>MovieNext</Text>
        </View>
    );
};

const styles = StyleSheet.create ({
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
    },
    title: {
        fontFamily: 'Jakarta-sans',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    image: {
        width: 40,
        height: 40,
    },
});