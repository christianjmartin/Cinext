import React, { useEffect, useRef, useState, useContext } from 'react';
import { Animated, Dimensions, Text } from 'react-native';
import PageContext from '../context/PageContext';
import theme from '../services/theme';

const Disclaimer = () => {
  const [textWidth, setTextWidth] = useState(0);
  const {colorMode} = useContext(PageContext);
  const opacity = useRef(new Animated.Value(1)).current;
  const currentTheme = theme[colorMode];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      onLayout={(e) => {
        setTextWidth(e.nativeEvent.layout.width);
      }}
      style={{
        position: 'absolute',
        top: 14,
        left: Dimensions.get('window').width / 2 - textWidth / 2,
        opacity,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{ fontSize: 14, color: currentTheme.textColorSecondary}}
      >
        Swipe to explore →
      </Text>
    </Animated.View>
  );
};

export default Disclaimer;