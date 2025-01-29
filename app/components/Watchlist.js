import React, { useEffect, useState, useContext } from 'react';
import { Text, View, FlatList, Image, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../services/supabase'; 
import PageContext from '../context/PageContext';
import { searchMovies } from '../services/tmdbApi';
import { fetchMovieCredits } from '../services/tmdbApi';

const Watchlist = () => {
    const { userId, setStaticMovie, updatePage } = useContext(PageContext);
    const [watchlist, setWatchlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const getFilms = async () => {
        try {
            const { data, error } = await supabase
                .from('Watchlist')
                .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
                .order('id', { ascending: false })
                .eq('UserID', userId);

            if (error) {
                console.error('Error fetching Watchlist:', error.message);
            } else {
                console.log('Fetched from Watchlist:', data);
                setWatchlist(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error); 
        }
    };

    useEffect(() => {
        getFilms();
    }, []);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setSearching(false);
            setSearchResults([]);
            return;
        }
        setSearching(true);

        try {
            const results = await searchMovies(query); // Fetch from TMDB
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]); // Fallback in case of API failure
        }
    };


    const renderFilm = ({ item }) => (
        <TouchableOpacity style={styles.gridItem} onPress={async () => {
            // get the director (need for if searched for from component)
            if (!item.Director) {
                try {
                    if (item.tmdbID) {
                        const directors = await fetchMovieCredits(item.tmdbID);
                        item.Director = directors; // add the director(s) to the film object 
                    }
                } catch (error) {
                    console.error('Error fetching directors:', error);
                    item.Director = 'Unknown';
                }
            }
            setStaticMovie(item);
            updatePage("Static Movie");
        }}>
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.header}>My Watchlist</Text>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search for movies to add..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <FlatList
                    data={searching ? searchResults : watchlist}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderFilm}
                    numColumns={3}
                    horizontal={false}
                    scrollEnabled={true}
                    columnWrapperStyle={styles.row}
                />
            </View>
        </TouchableWithoutFeedback>
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
    searchBar: {
        width: Dimensions.get('window').width * 0.95,
        height: 40,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    row: {
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    gridItem: {
        width: Dimensions.get('window').width / 3 - 15,
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

export default Watchlist;
