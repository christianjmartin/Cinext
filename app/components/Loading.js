// import React from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import logo3 from '../assets/logo3.png';

const Loading = () => {
    return (
    <View style={[styles.container, { flex: 1, backgroundColor: 'black' }]}>
      <Image style={styles.logo} source={logo3}></Image>
    </View>
  )};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
    logo: {
      height: '100%',
      width: Dimensions.get('window').width * 0.85,
      resizeMode: 'contain',
    }

});

export default Loading;
