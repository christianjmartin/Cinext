import React, { useEffect, useState, useContext } from 'react';
import { Text, View, FlatList, Image, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, TextInput, TouchableHighlight } from 'react-native';
import { supabase } from '../services/supabase'; 
import PageContext from '../context/PageContext';
import { searchMovies } from '../services/tmdbApi';
import { fetchMovieCredits } from '../services/tmdbApi';
import whiteArrows from '../assets/whiteArrows.png';
import blackArrows from '../assets/blackArrows.png';
import _ from 'lodash';
import theme from '../services/theme';

const SeenFilms = () => {
    const { userId, setStaticMovie, updatePage, colorMode, seenFilms, setSeenFilms } = useContext(PageContext);
    // const [seenFilms, setSeenFilms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editModeAvailable, setEditModeAvailable] = useState(true);
    const currentTheme = theme[colorMode];

    // gets all of the films the user has seen
    const getFilms = async () => {
        try {
            const { data, error } = await supabase
                .from('SeenFilms')
                .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
                .order('id', { ascending: false })
                .eq('UserID', userId);

            if (error) {
                console.error('Error fetching SeenFilms:', error.message);
            } else {
                // console.log('Fetched from SeenFilms:', data);
                // console.log("data", data);
                // console.log("seenFilms", seenFilms)
                if (!_.isEqual(data, seenFilms)) {
                    console.log("There were changes in seenfilms, updating seenfilms...");
                    setSeenFilms(data || []);
                }
                else {
                    console.log('no changes in seenfilms, nothing to do!');
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error); 
        }
    };

    // call "getFilms" on mount
    useEffect(() => {
        getFilms();
        // console.log("color mode is", colorMode);
        // console.log(currentTheme.background);
    }, []);
    

    // if searching, update the UI to display search 
    const handleSearch = async (query) => {
        setEditMode(false);
        setEditModeAvailable(false);
        setSearchQuery(query);
        if (query.trim() === '') {
            setSearching(false);
            setSearchResults([]);
            setEditModeAvailable(true);
            return;
        }
        setSearching(true);

        try {
             // Fetch from TMDB what the user puts in the search box 
            const results = await searchMovies(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]); // Fallback in case of API failure
        }
    };

    // edit mode where the user can choose which movies they want to delete 
    // if selectedMovies > 0 and this function was called, that means there are movies to delete
    const handleEditMode = async () => {
        if (editMode) {
            setEditMode(false);
            // console.log(selectedMovies);

            // selectedMovies holding the TMDB ID's of films the user has selected
            if (selectedMovies.length > 0) {
                for (const tmdbID of selectedMovies) {
                    try {
                        // delete the films they have selected
                        const { data, error } = await supabase
                            .from('SeenFilms')
                            .delete()
                            .eq('tmdbID', tmdbID)
                            .select()
            
                        if (error) {
                            console.error('Error deleting from SeenFilms:', error.message);
                        } else {
                            // console.log('Deleted from SeenFilms:', data);
                        }
                    } catch (error) {
                        console.error('Unexpected error:', error); 
                    }
                }
                // call getFilms again to update the UI as they delete films
                getFilms();
            }
            setSelectedMovies([]);
        }
        else {
            setEditMode(true);
        }
    }

    // button will be -> "edit", "cancel" OR "delete(COUNT)"
    const getEditButtonText = () => {
        if (!editMode) return "Edit"; // Not edit mode
        return selectedMovies.length > 0 ? `Delete (${selectedMovies.length})` : "Cancel"; // In edit mode
    }; 

    const addItemForDeletion = (tmdbID) => {
        setSelectedMovies(selectedMovies.includes(tmdbID) 
                ? selectedMovies.filter(id => id !== tmdbID) // remove from list of to be deleted (BTN WAS UNDO)
                : [...selectedMovies, tmdbID] // add film to the list of to be deleted (BTN WAS X)
        );
    }

    // render a film card
    const renderFilm = ({ item }) => (
        <TouchableOpacity style={[styles.gridItem, {backgroundColor: currentTheme.gridItemColor, shadowColor: currentTheme.shadowColor, borderColor: currentTheme.border}]} onPress={async () => {
            // make sure it holds director so when user clicks it to go to static movie page, necessary info is there
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
            {/* handle a case where a movie doesnt have a poster gracefully  */}
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
            <Text style={[styles.title, {color: currentTheme.textColor}]}>{item.Title.length > 25 ? item.Title.slice(0, 25) + '...' : item.Title}</Text>

            {editMode && ( // Show X button when editing
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => addItemForDeletion(item.tmdbID)}
                >
                    <Text style={styles.deleteText}>{selectedMovies.includes(item.tmdbID) ? "Undo" : "X"}</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        // Seen films screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.alignSortingSection}>
                        <Text style={{color: currentTheme.textColorSecondary}}>Recent</Text>
                        {colorMode === 'dark' ? <Image style={styles.sortingIcon} source={whiteArrows}/> : <Image style={styles.sortingIcon} source={blackArrows}/>}
                    </TouchableOpacity>
                    <Text style={[styles.header, {backgroundColor: currentTheme.headerColor, color: currentTheme.textColor}]}>Movies I've Seen</Text>
                    {/* make the edit button appear only when the user is NOT searching for something */}
                    {editModeAvailable && 
                    (<TouchableOpacity style={[styles.editButton, {backgroundColor: currentTheme.editBtn}]} onPress={handleEditMode}>
                        <Text>{getEditButtonText()}</Text>
                    </TouchableOpacity>)}
                </View>
                <TextInput
                    style={[styles.searchBar, {backgroundColor: currentTheme.searchBar}]}
                    placeholder="Search for movies to add..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <FlatList
                    data={searching ? searchResults : seenFilms}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderFilm}
                    numColumns={3}
                    horizontal={false}
                    scrollEnabled={true}
                    columnWrapperStyle={styles.row}
                />
                <View style={styles.bottomSpacer}></View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
        marginBottom: -2,
        flex: 1,
        padding: 10,
        alignItems: 'center',
        width: Dimensions.get('window').width * 1,
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 7,
        width: Dimensions.get('window').width * 1,
    },
    searchBar: {
        zIndex: 1,
        width: Dimensions.get('window').width * 0.95,
        height: 40,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
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
        borderRadius: 7,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: -3,
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
    editButton: {
        position: 'absolute',
        top: 6,
        right: 4,
        padding: 4,
        paddingHorizontal: 9,
        textAlign: 'center',
        borderWidth: 0.7,
        borderColor: '#888888',
        borderRadius: 5,
    },
    deleteButton: {
        zIndex: 2000,
        backgroundColor: '#e11616',
        padding: 7,
        paddingHorizontal: 12,
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: 40,
        opacity: 0.8,
    },
    deleteText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 15,
    },
    bottomSpacer: {
        marginTop: 15,
    },
    sortingIcon: {
        height: 20,
        width: 20, 
        marginTop: 1,
        marginLeft: 4,
    },
    alignSortingSection: {
        position: 'absolute',
        flexDirection: 'row',
        top: 3,
        left: 0,
        padding: 7,
        marginTop: 0.8,
        textAlign: 'center',
        zIndex: 2,
        opacity: 0.75,
    },

});

export default SeenFilms;
