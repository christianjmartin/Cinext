import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const SortDropdown = ({ option }) => {
    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity style={[styles.sortBtn, styles.radiusTop]} onPress={() => option({option: 'Alphabetical 1', desc: false})}>
                <Text>Movie Name - A-Z</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortBtn, styles.darker]} onPress={() => option({option: 'Alphabetical 2', desc: true})}>
                <Text>Movie Name - Z-A</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortBtn} onPress={() => option({option: 'Date Added 2', desc: false})}>
                <Text>Date Added - Oldest First</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortBtn, styles.darker]} onPress={() => option({option: 'Date Added 1', desc: true})}>
                <Text>Date Added - Newest First</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortBtn} onPress={() => option({option: 'Release Date 2', desc: false})}>
                <Text>Release Date - Oldest First</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortBtn, styles.darker]} onPress={() => option({option: 'Release Date 1', desc: true})}>
                <Text>Release Date - Newest First</Text>
            </TouchableOpacity>
            {/* arrow down */}
            <TouchableOpacity style={styles.sortBtn} onPress={() => option({option: 'Rating 1', desc: true})}>
                <Text>Average Rating - Highest First</Text>
            </TouchableOpacity>
            {/* arrow up */}
            <TouchableOpacity style={[styles.sortBtn, styles.darker, styles.radiusBottom]} onPress={() => option({option: 'Rating 2', desc: false})}>
                <Text>Average Rating - Lowest First</Text>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    dropdownContainer: {
        position: 'absolute',
        marginTop: 40,
        zIndex: 10,
    },
    sortBtn: {
        paddingVertical: 12,
        paddingHorizontal: 7,
        paddingRight: 24,
        textAlign: 'center',
        borderWidth: 0.0,
        borderColor: '#adadad',
        backgroundColor: '#F5f5f5',
        borderRightWidth: 1,
        borderLeftWidth: 1,
    },
    darker: {
        backgroundColor: '#e5e5e5',
    },
    radiusTop: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderTopWidth: 1,
        borderColor: '#adadad',
    },
    radiusBottom: {
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomWidth: 1,
        borderColor: '#adadad',
    }
});

export default SortDropdown;