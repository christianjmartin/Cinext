import React, { useEffect, useState, useContext } from 'react';
import { Text, View, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { supabase } from '../services/supabase'; 
import PageContext from '../context/PageContext';

const StaticMovie = () => {
    const { staticMovie, previousPage } = useContext(PageContext);

    console.log("the movie that will be shown here is: -> ", staticMovie)
    return (
        <>
        <Text>{staticMovie.Title}</Text>
        <Text>{staticMovie.Director}</Text>
        <Text>{staticMovie.Year}</Text>
        <Text>{staticMovie.Rating}</Text>
        <Text>{staticMovie.Description}</Text>
        <Text>the previous page was - {previousPage}</Text>
        </>
    )
}

export default StaticMovie;
