import React, {useContext} from 'react';
import { View, StyleSheet} from 'react-native';
import PageContext from '../context/PageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../services/theme';

export default function BlankNavBar2() {
    const {colorMode} = useContext(PageContext);
    const insets = useSafeAreaInsets();
    const currentTheme = theme[colorMode];
    
    return (
        <View style={[styles.navBar, {backgroundColor: '#151515', paddingBottom: insets.bottom, marginBottom: -insets.bottom}]}>
        </View>
    );
};

const styles = StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});
  