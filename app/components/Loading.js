import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import logo3 from '../assets/logo3.png';

const Loading = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();


  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colorScheme === 'dark' ? 'black' : 'white',}]}>
      <Animated.Image
        source={logo3}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: '100%',
    width: Dimensions.get('window').width * 0.85,
    resizeMode: 'contain',
  },
});

export default Loading;
