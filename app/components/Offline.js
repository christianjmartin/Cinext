import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import theme from '../services/theme.js';


const Offline = () => {
    const currentTheme = theme["dark"];
    
    return (
        <>
        <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
            <Text style={[styles.infoContainer, {color: currentTheme.textColorSecondary}]}>
                    You are offline, please go online and restart the app to use Cinext!
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
    infoContainer: {
        textAlign: 'center',
        width: Dimensions.get('window').width * 0.8,
        fontSize: 17,
        marginTop: 50,
    },
});

export default Offline;
