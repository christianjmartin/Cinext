import React, { useEffect, useState, useContext } from 'react';
import { Text, View, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabase'; 
import PageContext from '../context/PageContext';

const SeenFilms = () => {
    const { userId, setStaticMovie, updatePage } = useContext(PageContext);
    const [seenFilms, setSeenFilms] = useState([]);

    const getFilms = async () => {
        try {
            const { data, error } = await supabase
                .from('SeenFilms')
                .select('Title, PosterPath, Director, Year, Rating, Description')
                .eq('UserID', userId);

            if (error) {
                console.error('Error fetching SeenFilms:', error.message);
            } else {
                console.log('Fetched from SeenFilms:', data);
                setSeenFilms(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error); 
        }
    };

    // run once (mount)
    useEffect(() => {
        getFilms();
    }, []);

    const renderFilm = ({ item }) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => {
            // console.log(item);
            setStaticMovie(item);
            updatePage("Static Movie")}} 
        >
            {item.PosterPath ? (
                <Image 
                    source={{ uri: `https://image.tmdb.org/t/p/w500${item.PosterPath}` }} 
                    style={styles.poster}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No Image</Text>
                </View>
            )}
            <Text style={styles.title}>{item.Title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Movies I've Seen</Text>
            <FlatList
                data={seenFilms}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderFilm}
                numColumns={3} // Number of columns for the grid
                horizontal={false}
                scrollEnabled={true}
                columnWrapperStyle={styles.row} // Styling for the row
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 27,
        flex: 1,
        padding: 10,
        alignItems: 'center',
        width: Dimensions.get('window').width * 1,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        padding: 7,
        width: Dimensions.get('window').width * 1,
    },
    row: {
        justifyContent: 'flex-start', // Align items to the left
        marginBottom: 10,
    },
    gridItem: {
        width: Dimensions.get('window').width / 3 - 15, // Ensure consistent width for 4 columns
        margin: 3,
        backgroundColor: '#fff',
        borderRadius: 7,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginTop: -3,
    },
    poster: {
        marginTop: 5,
        width: Dimensions.get('window').width / 3 - 15, 
        height: Dimensions.get('window').width / 3 + 15, 
        resizeMode: 'contain',
    },
    placeholder: {
        width: Dimensions.get('window').width / 3 - 15,
        height: Dimensions.get('window').width / 3 + 15,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#555',
        fontSize: 14,
    },
    title: {
        padding: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
export default SeenFilms;
