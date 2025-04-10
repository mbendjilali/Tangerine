// Suggestion Service
// Manages movie suggestions using the Mistral API

import { getSuggestions, getReplacementSuggestion } from '../api/mistralApi.js';
import { searchMovieByTitle } from '../api/omdbApi.js';
import { getMovies, getCurrentSuggestions, saveSuggestions } from '../models/mediaData.js';

/**
 * Get movie suggestions and update the UI
 * @param {Function} onLoadStart - Callback when loading starts
 * @param {Function} onLoadComplete - Callback with the loaded suggestions
 * @param {Function} onError - Callback when an error occurs
 */
export async function getMovieSuggestions(onLoadStart, onLoadComplete, onError) {
    try {
        // Call the loading start callback
        if (typeof onLoadStart === 'function') {
            onLoadStart();
        }
        
        // Check if we have any movies
        const toWatchMovies = getMovies('toWatch');
        const watchedMovies = getMovies('watched');
        
        const hasMovies = toWatchMovies.length > 0 || watchedMovies.length > 0;
        if (!hasMovies) {
            if (typeof onLoadComplete === 'function') {
                onLoadComplete([]);
            }
            return;
        }
        
        // Get user's movie preferences
        const allMovies = [...toWatchMovies, ...watchedMovies];
        
        // Create list of movie IDs and titles to avoid recommending movies already in the lists
        const existingMovieIds = allMovies.map(movie => movie.imdbID);
        const existingMovieTitles = allMovies.map(movie => movie.Title.toLowerCase());
        
        // Prepare a sample of movies to send to Mistral (to avoid making the prompt too large)
        // Take some from both lists for better variety
        const toWatchSample = toWatchMovies.slice(0, 5);
        const watchedSample = watchedMovies.slice(0, 5);
        
        const movieSample = [...toWatchSample, ...watchedSample].map(movie => {
            return {
                title: movie.Title,
                year: movie.Year,
                genre: movie.Genre || 'Unknown',
                rating: movie.userRating || 'Not rated'
            };
        });
        
        // Get suggestions from Mistral API
        const suggestionData = await getSuggestions(movieSample, existingMovieTitles);
        
        // Search for these movies in OMDB to get posters and complete information
        const suggestionsWithDetails = await Promise.all(
            suggestionData.slice(0, 5).map(async (suggestion) => {
                try {
                    const movieDetails = await searchMovieByTitle(suggestion.title, suggestion.year);
                    if (movieDetails) {
                        // Double-check that this movie isn't already in the user's lists
                        if (existingMovieIds.includes(movieDetails.imdbID)) {
                            console.log(`Skipping ${movieDetails.Title} as it's already in the user's lists`);
                            return null;
                        }
                        
                        return {
                            ...movieDetails,
                            reason: suggestion.reason || 'Recommended based on your taste'
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching details for ${suggestion.title}:`, error);
                    return null;
                }
            })
        );
        
        // Filter out any null results
        const validSuggestions = suggestionsWithDetails.filter(s => s !== null);
        
        // Save suggestions to the data structure
        saveSuggestions(validSuggestions);
        
        // Call the completion callback with suggestions
        if (typeof onLoadComplete === 'function') {
            onLoadComplete(validSuggestions);
        }
        
    } catch (error) {
        console.error('Error getting suggestions:', error);
        
        // Call the error callback
        if (typeof onError === 'function') {
            onError(error);
        }
    }
}

/**
 * Replace a single suggestion with a new one
 * @param {string} imdbID - IMDB ID of the suggestion to replace
 * @param {Function} onReplaceStart - Callback when replacement starts
 * @param {Function} onReplaceComplete - Callback when replacement completes
 * @param {Function} onError - Callback when an error occurs
 */
export async function replaceSuggestion(imdbID, onReplaceStart, onReplaceComplete, onError) {
    try {
        // Call the replacement start callback
        if (typeof onReplaceStart === 'function') {
            onReplaceStart(imdbID);
        }
        
        // Get a new suggestion
        const toWatchMovies = getMovies('toWatch');
        const watchedMovies = getMovies('watched');
        const suggestions = getCurrentSuggestions();
        
        // Create list of movie IDs and titles to avoid recommending movies already in the lists
        const allMovies = [...toWatchMovies, ...watchedMovies];
        const existingMovieIds = [...allMovies.map(movie => movie.imdbID), 
                                  ...suggestions.map(movie => movie.imdbID)];
        const existingMovieTitles = [...allMovies.map(movie => movie.Title.toLowerCase()),
                                    ...suggestions.map(movie => movie.Title.toLowerCase())];
        
        // Prepare a sample of movies
        const movieSample = allMovies.slice(0, 10).map(movie => {
            return {
                title: movie.Title,
                year: movie.Year,
                genre: movie.Genre || 'Unknown',
                rating: movie.userRating || 'Not rated'
            };
        });
        
        // Get a new suggestion from Mistral
        const suggestionData = await getReplacementSuggestion(movieSample, existingMovieTitles);
        
        // Get the detailed movie info from OMDB
        const movieDetails = await searchMovieByTitle(suggestionData.title, suggestionData.year);
        
        if (movieDetails) {
            // Double-check that this movie isn't already in the user's lists
            if (existingMovieIds.includes(movieDetails.imdbID)) {
                console.log(`Skipping ${movieDetails.Title} as it's already in the user's lists`);
                
                // Call the error callback
                if (typeof onError === 'function') {
                    onError(new Error('Suggested movie already in lists'));
                }
                return;
            }
            
            const newSuggestion = {
                ...movieDetails,
                reason: suggestionData.reason || 'Recommended based on your taste'
            };
            
            // Replace the suggestion in the data
            // Find and replace the suggestion with the given imdbID
            const currentSuggestions = getCurrentSuggestions();
            const index = currentSuggestions.findIndex(s => s.imdbID === imdbID);
            
            if (index !== -1) {
                const updatedSuggestions = [...currentSuggestions];
                updatedSuggestions[index] = newSuggestion;
                saveSuggestions(updatedSuggestions);
                
                // Call the completion callback
                if (typeof onReplaceComplete === 'function') {
                    onReplaceComplete(imdbID, newSuggestion);
                }
                
                return newSuggestion;
            }
        }
        
        throw new Error('Could not get movie details for suggestion');
        
    } catch (error) {
        console.error('Error replacing suggestion:', error);
        
        // Call the error callback
        if (typeof onError === 'function') {
            onError(error);
        }
        
        return null;
    }
} 