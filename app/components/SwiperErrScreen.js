import React, { useContext, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import PageContext from '../context/PageContext';
import theme from '../services/theme';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList, Touchable } from 'react-native';

const SwiperErrScreen = () => {
    const { movieList, updatePage, userId, colorMode, seenFilms, watchlist} = useContext(PageContext);
    const navigation = useNavigation();
    const currentTheme = theme[colorMode];
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
          setIsDisabled(false);
        }, 1500); 
    });

    return (
        <>
        <View style={[styles.header, {backgroundColor: currentTheme.swiperBackground}]}>
            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => {
                navigation.replace("Recs");
                updatePage("NULL");
                }}
                disabled={isDisabled}
            >
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
        </View>
        <View style={[styles.body, {backgroundColor: currentTheme.swiperBackground}]}>
            <Text style={[styles.text, {color: currentTheme.textColorSecondary}]}>Your request could not be fufilled. There may have not been enough films to recommend based on what you said. Additionally, Requests completely unrelated to film content, or containing overly foul language or gibberish may not be fufilled. Please try again with something different!</Text>
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: Dimensions.get('window').width * 1,
      height: '100%',
      paddingBottom: 20,
    },
    text: {
      margin: 20,
      textAlign: 'center',
    },
    body: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 40,
    },
    exitButton: {
        position: 'absolute',
        top: 5,
        left: 4,
        backgroundColor: "#ea2121",
        padding: 7,
        borderRadius: 40,
        borderWidth: 0.7,
        borderColor: "#681212",
        zIndex: 10, 
        paddingHorizontal: 15,
    },
    buttonText: {
        // fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },

});

export default SwiperErrScreen;