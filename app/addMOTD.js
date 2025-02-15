// const { supabase } = require('./services/supabase.js');
// const MOTD = require('./services/MOTD.json');
// const { fetchMovieDetails } = require('./services/tmdbApi.js');


// async function insertMovies() {
//     for (const [key, value] of Object.entries(MOTD)) {
//         console.log(`Key: ${key}, Value:`, value);
//         try {
//             const movieOfTheDay = await fetchMovieDetails(value.title);
//             console.log("Movie of the Day is:", movieOfTheDay);

//             const { data2, error2 } = await supabase
//                 .from('MovieOfTheDay')
//                 .insert([{
//                     Date: key,
//                     Title: movieOfTheDay.Title,
//                     Director: movieOfTheDay.Director,
//                     Year: parseInt(movieOfTheDay.Year),
//                     PosterPath: movieOfTheDay.PosterPath,
//                     Description: movieOfTheDay.Description,
//                     Rating: movieOfTheDay.Rating,
//                     tmdbID: movieOfTheDay.tmdbID
//                 }])
//                 .select();
        
//             if (error2) {
//                 console.error('Error adding to Movie of the Day:', error2.message);
//             }
            
//         } catch (error) {
//             console.error('Unexpected error:', error); 
//         }
//     }
// }

// insertMovies().catch(console.error);
