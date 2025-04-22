import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Text, View, FlatList, Image, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, TextInput, TouchableHighlight } from 'react-native';
import { supabase } from '../services/supabase'; 
import PageContext from '../context/PageContext';
import { searchMovies } from '../services/tmdbApi';
import { useFocusEffect } from '@react-navigation/native';
// import { fetchMovieCredits } from '../services/tmdbApi';
import { fetchMovieDirectors } from '../services/apiComms';
import SortDropdown from './SortDropdown';
import waUp from '../assets/waUp.png';
import waDown from '../assets/waDown.png';
import baUp from '../assets/baUp.png';
import baDown from '../assets/baDown.png';
import X from '../assets/X.png';
import _ from 'lodash';
import theme from '../services/theme';
import { useNavigation } from '@react-navigation/native';

const Watchlist = () => {
    const { userId, setStaticMovie, updatePage, colorMode, watchlist, setWatchlist, currSortWatchlist, setCurrSortWatchlist, lastWatchlistFetch} = useContext(PageContext);
    // const [watchlist, setWatchlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editModeAvailable, setEditModeAvailable] = useState(true);
    const [sortingDropdownAvailable, setSortingDropdownAvailable] = useState(false);
    const [arrowDesc, setArrowDesc] = useState();
    const currentTheme = theme[colorMode];
    const navigation = useNavigation();

    // gets all of the films the user has in Watchlist
    const getFilms = async ( sortingOption ) => {
        try {
            let query = supabase
            .from('Watchlist')
            .select('Title, PosterPath, Director, Year, Rating, Description, tmdbID')
            .eq('AuthID', userId);

            // add the order based on the sorting option if exists
            switch (sortingOption) {
                case 'Alphabetical 1':
                    query = query.order('Title', { ascending: true });
                    break;
                case 'Alphabetical 2':
                    query = query.order('Title', { ascending: false });
                    break;
                case 'Date Added 1':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'Date Added 2':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'Release Date 1':
                    query = query.order('Year', { ascending: false});
                    break;
                case 'Release Date 2':
                    query = query.order('Year', { ascending: true });
                    break;
                case 'Rating 1':
                    query = query.order('Rating', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
                    break;
                case 'Rating 2':
                    query = query.order('Rating', { ascending: true, nullsFirst: false}).order('created_at', { ascending: false });
                    break;
                default:
                    query = query.order('created_at', { ascending: false });
            }

        const { data, error } = await query;

            if (error) {
                console.error('Error fetching Watchlist:');
            } else {
                // console.log('Fetched from Watchlist:', data);
                // console.log("data", data);
                // console.log("Watchlist", watchlist)
                if (!_.isEqual(data, watchlist)) {
                    // console.log("There were changes in Watchlist, updating Watchlist...");
                    setWatchlist(data || []);
                }
                else {
                    // console.log('no changes in Watchlist, nothing to do!');
                }
            }
        } catch (error) {
            console.error('Unexpected error: get films'); 
        }
    };

    // call "getFilms" on mount
    useFocusEffect(
        useCallback(() => {
            setSortingDropdownAvailable(false);
            arrowDirection();
            const now = Date.now();
            const secondsSinceLastFetch = (now - lastWatchlistFetch.current) / 1000;
        
            if (secondsSinceLastFetch < 1.5) {
                // console.log(`Blocked getFilms watchlist — only ${secondsSinceLastFetch.toFixed(2)}s since last fetch`);
                return;
            }
        
            
            lastWatchlistFetch.current = now;
            // console.log("getFilms watchlist called");
            
            getFilms(currSortWatchlist);
      
        }, [currSortWatchlist])
      );

    // if searching, update the UI to display search 
    const handleSearch = async (query) => {
        setSortingDropdownAvailable(false);
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
            console.error('Error fetching search results:');
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
                            .from('Watchlist')
                            .delete()
                            .eq('tmdbID', tmdbID)
                            .select()
            
                        if (error) {
                            console.error('Error deleting from Watchlist:');
                        } else {
                            // console.log('Deleted from Watchlist:', data);
                        }
                    } catch (error) {
                        console.error('Unexpected error: deleting from watchlist'); 
                    }
                }
                // call getFilms again to update the UI as they delete films
                getFilms(currSortWatchlist);
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

    // opens the options for sorting
    const openSortingOptions = () => {
        setSortingDropdownAvailable(!sortingDropdownAvailable);
    }

    // processes the sorting selection
    const handleSort = (sortingOption) => {
        setSortingDropdownAvailable(!sortingDropdownAvailable);
        setCurrSortWatchlist(sortingOption.option);
        setArrowDesc(sortingOption.desc);
        // console.log(sortingOption.option);
        getFilms(sortingOption.option);
    }

    // handles dismissal of keyboard and sorting dropdown when clicking
    const handleDismiss = () => {
        Keyboard.dismiss();
        setSortingDropdownAvailable(false);
    };

    const arrowDirection = () => {
        if (currSortWatchlist === "Alphabetical 1" || currSortWatchlist === "Date Added 2" || currSortWatchlist === "Release Date 2" || currSortWatchlist === "Rating 2") {
            setArrowDesc(false);
        }
        else { setArrowDesc(true); }
    }

    const FilmCard = React.memo(({ item, currentTheme, navigation, editMode, selectedMovies, addItemForDeletion, setStaticMovie, updatePage }) => {
        const handlePress = async () => {
          if (!item.Director && item.tmdbID) {
            try {
              const directors = await fetchMovieDirectors(item.tmdbID);
              item.Director = directors;
            } catch {
              item.Director = 'Unknown';
            }
          }
          setStaticMovie(item);
          updatePage("NULL");
          navigation.navigate("Static Movie");
        };
      
        return (
          <TouchableOpacity
            style={[
              styles.gridItem,
              {
                backgroundColor: currentTheme.gridItemColor,
                shadowColor: currentTheme.shadowColor,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={handlePress}
          >
            {item.PosterPath ? (
              <Image source={{ uri: `https://image.tmdb.org/t/p/w185${item.PosterPath}` }} style={styles.poster} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={[styles.placeholderText, { color: currentTheme.textColorSecondary }]}>No Image</Text>
              </View>
            )}
      
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
              {item.Title.length > 25 ? item.Title.slice(0, 25) + '...' : item.Title}
            </Text>
      
            {editMode && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => addItemForDeletion(item.tmdbID)}>
                <Text style={styles.deleteText}>
                  {selectedMovies.includes(item.tmdbID) ? 'Undo' : 'X'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      });

    const renderFilm = useCallback(
        ({ item }) => (
          <FilmCard
            item={item}
            currentTheme={currentTheme}
            navigation={navigation}
            editMode={editMode}
            selectedMovies={selectedMovies}
            addItemForDeletion={addItemForDeletion}
            setStaticMovie={setStaticMovie}
            updatePage={updatePage}
          />
        ),
        [editMode, selectedMovies, currentTheme]
      );

    return (
        // Watchlist films screen
        <TouchableWithoutFeedback onPress={handleDismiss}>
            <View style={[styles.container, {backgroundColor: currentTheme.background}]}>
                <View style={styles.headerContainer}>
                    {editModeAvailable && (
                    <TouchableOpacity style={styles.alignSortingSection} onPress={openSortingOptions}>
                        <Text style={{fontWeight: '500', color: currentTheme.textColorSecondary}}>{currSortWatchlist.slice(0,-2)}</Text>
                        {colorMode === 'dark' ? 
                            <Image style={styles.sortingIcon} source={arrowDesc ? waDown : waUp}/> 
                        : <Image style={styles.sortingIcon} source={arrowDesc ? baDown : baUp}/>}
                    </TouchableOpacity>
                    )}
                    {sortingDropdownAvailable && (
                        <SortDropdown 
                            option={handleSort}>
                        </SortDropdown>
                    )}
                    <Text style={[styles.header, {backgroundColor: currentTheme.headerColor, color: currentTheme.textColor}]}>Watchlist</Text>
                    {/* make the edit button appear only when the user is NOT searching for something */}
                    {editModeAvailable && 
                    (<TouchableOpacity style={[styles.editButton, {backgroundColor: currentTheme.editBtn}]} onPress={handleEditMode}>
                        <Text>{getEditButtonText()}</Text>
                    </TouchableOpacity>)}
                </View>
                <View>
                    <TextInput
                        style={[styles.searchBar, {backgroundColor: currentTheme.searchBar}]}
                        placeholder="Search for movies to add..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {!editModeAvailable && 
                        <TouchableOpacity style={styles.xBtn} onPress={()=>handleSearch('')}>
                            <Image source={X} style={styles.xImage}></Image>
                        </TouchableOpacity>
                    }
                </View>
                <FlatList
                    data={searching ? searchResults : watchlist}
                    keyExtractor={(item, index) => item.tmdbID?.toString() || index.toString()}
                    renderItem={renderFilm}
                    numColumns={3}
                    columnWrapperStyle={styles.row}
                    initialNumToRender={9}
                    maxToRenderPerBatch={6}
                    windowSize={7}
                    removeClippedSubviews={true}
                />
                <View style={styles.bottomSpacer}></View>
            </View>
        </TouchableWithoutFeedback>
    );
};
 
const styles = StyleSheet.create({
    container: {
        // marginTop: 15,
        marginBottom: -15,
        flex: 1,
        // padding: 10,
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
    xBtn: {
        position: 'absolute',
        zIndex: 20,
        top: 5.5,
        right: 7,
    },
    xImage: {
        height: 30,
        width: 30,
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
        // backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        // color: '#555',
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
        height: 16,
        width: 12, 
        marginTop: 1.2,
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

export default Watchlist;
