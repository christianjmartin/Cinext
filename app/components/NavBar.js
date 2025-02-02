import React, {useContext, useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import bookmark from '../assets/bookmark.png';
import bulb from '../assets/lightbulb.png';
import eyeball from '../assets/eyeball.png';
import PageContext from '../context/PageContext';

// navigation bar at the bottom, main pages of the app 
export default function NavBar() {
    const {updatePage} = useContext(PageContext);
    
    return (
        <View>
            <View style={styles.btnContainer}>

                {/* RECS */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePage("Recs")}
                    >
                    <Image source={bulb} style={styles.btnIcon}></Image>
                </TouchableOpacity>

                {/* WATCHLIST */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePage("Watchlist")}
                    >
                    <Image source={bookmark} style={styles.btnIcon}></Image>
                </TouchableOpacity>

                {/* SEEN FILMS  */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePage("Seen Films")}
                    >
                    <Image source={eyeball} style={styles.btnIcon}></Image>
                    {/* <Text style={styles.buttonText}>Queue</Text> */}
                    
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    btnContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      width: Dimensions.get('window').width * 1,
    },
    button: {
      backgroundColor: "#6C100F",
      paddingLeft: 7,
      paddingRight: 7,
      paddingTop: 2,
      paddingBottom: 2,
      borderRadius: 50,
    },
    btnIcon: {
      width: 70,
      height: 37,
      marginTop: 5,
      marginBottom: 5,
      resizeMode: 'contain',
    }
  });
  