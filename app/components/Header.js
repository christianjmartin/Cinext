import React, { useContext } from 'react';
import camera from '../assets/camera.png';
import settings from '../assets/settings-2.png';
import PageContext from '../context/PageContext';  
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'; 

export default function Header() {
    const {updatePage} = useContext(PageContext);
    return (
        <View style={styles.headerContainer}>
            <Image source={camera} style={styles.image} /> 
            <Text style={styles.title}>MovieNext</Text>
            <View style={styles.spacer}></View>
            <TouchableOpacity onPress={() => updatePage("Settings")}>
                <Image source={settings} style={[styles.image, styles.settings]}></Image>
            </TouchableOpacity>
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
    settings: {
        marginRight: 5,
    },
    spacer: {
        flexGrow: 1,
    }
});