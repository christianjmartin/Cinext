import React, {useContext} from 'react';
import { View, Image, TouchableOpacity, Dimensions, StyleSheet} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import PageContext from '../context/PageContext';
import bookmark from '../assets/bookmark.png';
import bulb from '../assets/lightbulb.png';
import eyeball from '../assets/eyeball.png';

export default function NavBar() {
    const {updatePage} = useContext(PageContext);
    const navigation = useNavigation();

    const navigateWithReset = (screen) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: screen }], // ✅ Clears stack & starts fresh
            })
        );
    };
    
    return (
        <View style={styles.navBar}>
            <View style={styles.btnContainer}>

                {/* RECS */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        updatePage("NULL");
                        navigateWithReset("Recs");
                    }}
                    >
                    <Image source={bulb} style={styles.btnIcon}></Image>
                </TouchableOpacity>

                {/* WATCHLIST */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigateWithReset("Watchlist")
                        updatePage("NULL");
                    }}
                    >
                    <Image source={bookmark} style={styles.btnIcon}></Image>
                </TouchableOpacity>

                {/* SEEN FILMS  */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigateWithReset("Seen Films");
                        updatePage("NULL");
                    }}
                    >
                    <Image source={eyeball} style={styles.btnIcon}></Image>
                    {/* <Text style={styles.buttonText}>Queue</Text> */}
                    
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    navBar: {
        // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        backgroundColor: '#A44443',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    btnContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      width: Dimensions.get('window').width * 1,
    },
    button: {
    //   backgroundColor: "#6C100F",
      paddingLeft: 7,
      paddingRight: 7,
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
  