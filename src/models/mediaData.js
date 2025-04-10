// Media Data Model
// Manages the application data for movies and other media

import { showMovieDetails } from '../components/movieDetails.js';
import { initSearch } from '../components/search.js';
import { fetchMovieDetails } from '../api/omdbApi.js';
import { getMovieSuggestions } from '../services/suggestionService.js';

// Global data store
export let mediaData = {
    toWatch: [],
    watched: [],
    selectedMovie: null,
    searchResults: [],
    suggestions: []
};

// Store the callback to update UI when data changes
let updateUICallback = null;

/**
 * Set a callback function that will be called when data changes to update the UI
 * @param {Function} callback - The function to call when data changes
 */
export function setUpdateUICallback(callback) {
    updateUICallback = callback;
}

/**
 * Call the UI update callback if it exists
 * @param {string} list - The list that was updated ('toWatch' or 'watched' or 'both')
 */
function triggerUIUpdate(list) {
    if (typeof updateUICallback === 'function') {
        updateUICallback(list);
    }
}

/**
 * Initialize the media data from local storage
 */
export function initMediaData() {
    loadFromLocalStorage();
    initSearch();
}

/**
 * Load media data from local storage
 */
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('moviePickerData');
    if (savedData) {
        try {
            mediaData = JSON.parse(savedData);
            
            // Ensure all required properties exist
            mediaData.toWatch = mediaData.toWatch || [];
            mediaData.watched = mediaData.watched || [];
            mediaData.searchResults = mediaData.searchResults || [];
            mediaData.suggestions = mediaData.suggestions || [];
            
            console.log('Loaded data from local storage:', mediaData);
        } catch (error) {
            console.error('Error parsing saved data:', error);
            mediaData = {
                toWatch: [],
                watched: [],
                selectedMovie: null,
                searchResults: [],
                suggestions: []
            };
        }
    }
}

/**
 * Save media data to local storage
 */
function saveToLocalStorage() {
    localStorage.setItem('moviePickerData', JSON.stringify(mediaData));
}

/**
 * Get movies from a specific list
 * @param {string} list - List to get movies from ('toWatch' or 'watched')
 * @returns {Array} Array of movie objects
 */
export function getMovies(list) {
    return mediaData[list] || [];
}

/**
 * Sort movies by chosen criteria
 * @param {Array} movies - Array of movies to sort
 * @param {string} sortBy - Sort criterion
 * @returns {Array} Sorted array of movies
 */
export function sortMovies(movies, sortBy) {
    const sortedMovies = [...movies];
    
    switch (sortBy) {
        case 'title-asc':
            sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
            break;
        case 'title-desc':
            sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
            break;
        case 'year-asc':
            sortedMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
            break;
        case 'year-desc':
            sortedMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
            break;
        case 'rating-desc':
            sortedMovies.sort((a, b) => {
                const ratingA = a.userRating || parseFloat(a.imdbRating) || 0;
                const ratingB = b.userRating || parseFloat(b.imdbRating) || 0;
                return ratingB - ratingA;
            });
            break;
        case 'date-added-desc':
            // Newest first - default order
            sortedMovies.sort((a, b) => {
                const dateA = new Date(a.dateAdded || 0);
                const dateB = new Date(b.dateAdded || 0);
                return dateB - dateA;
            });
            break;
        case 'date-added-asc':
            // Oldest first
            sortedMovies.sort((a, b) => {
                const dateA = new Date(a.dateAdded || 0);
                const dateB = new Date(b.dateAdded || 0);
                return dateA - dateB;
            });
            break;
        case 'date-watched-desc':
            sortedMovies.sort((a, b) => {
                const dateA = new Date(a.watchedDate || 0);
                const dateB = new Date(b.watchedDate || 0);
                return dateB - dateA;
            });
            break;
        case 'date-watched-asc':
            sortedMovies.sort((a, b) => {
                const dateA = new Date(a.watchedDate || 0);
                const dateB = new Date(b.watchedDate || 0);
                return dateA - dateB;
            });
            break;
    }
    
    return sortedMovies;
}

/**
 * Filter movies by selected genre
 * @param {Array} movies - Array of movies to filter
 * @param {string} filterBy - Filter criterion
 * @returns {Array} Filtered array of movies
 */
export function filterMovies(movies, filterBy) {
    if (filterBy === 'all') {
        return movies;
    }
    
    return movies.filter(movie => {
        if (!movie.Genre) return false;
        return movie.Genre.toLowerCase().includes(filterBy.toLowerCase());
    });
}

/**
 * Add a movie to the to-watch list
 * @param {Object} movie - Movie data object
 * @returns {boolean} - True if added successfully, false if already exists
 */
export function addToWatchList(movie) {
    // Check if movie already exists in either list
    if (findMovieInLists(movie.imdbID)) {
        return false;
    }
    
    mediaData.toWatch.unshift(movie);
    saveToLocalStorage();
    triggerUIUpdate('toWatch');
    return true;
}

/**
 * Find a movie in any list by imdbID
 * @param {string} imdbID - Movie IMDB ID
 * @returns {Object|null} - Movie object if found, null otherwise
 */
export function findMovieInLists(imdbID) {
    const inToWatch = mediaData.toWatch.find(m => m.imdbID === imdbID);
    if (inToWatch) return inToWatch;
    
    const inWatched = mediaData.watched.find(m => m.imdbID === imdbID);
    if (inWatched) return inWatched;
    
    return null;
}

/**
 * Mark a movie as watched
 * @param {string} imdbID - Movie IMDB ID
 * @param {number} rating - User rating (1-10)
 */
export function markAsWatched(imdbID, rating = null) {
    const movieIndex = mediaData.toWatch.findIndex(m => m.imdbID === imdbID);
    if (movieIndex === -1) return;
    
    const movie = mediaData.toWatch[movieIndex];
    
    // Add user rating if provided
    if (rating !== null) {
        movie.userRating = rating;
    }
    
    // Remove from to-watch list
    mediaData.toWatch.splice(movieIndex, 1);
    
    // Add to watched list at the beginning
    mediaData.watched.unshift(movie);
    
    saveToLocalStorage();
    triggerUIUpdate('both');
    
    // If this was the selected movie, update the detail view
    if (mediaData.selectedMovie && mediaData.selectedMovie.imdbID === imdbID) {
        mediaData.selectedMovie = movie;
        showMovieDetails(movie, 'watched');
    }
}

/**
 * Mark a movie as unwatched
 * @param {string} imdbID - Movie IMDB ID
 */
export function markAsUnwatched(imdbID) {
    const movieIndex = mediaData.watched.findIndex(m => m.imdbID === imdbID);
    if (movieIndex === -1) return;
    
    const movie = { ...mediaData.watched[movieIndex] };
    
    // Remove user rating
    delete movie.userRating;
    
    // Remove from watched list
    mediaData.watched.splice(movieIndex, 1);
    
    // Add to to-watch list at the beginning
    mediaData.toWatch.unshift(movie);
    
    saveToLocalStorage();
    triggerUIUpdate('both');
    
    // If this was the selected movie, update the detail view
    if (mediaData.selectedMovie && mediaData.selectedMovie.imdbID === imdbID) {
        mediaData.selectedMovie = movie;
        showMovieDetails(movie, 'toWatch');
    }
}

/**
 * Update the rating for a watched movie
 * @param {string} imdbID - Movie IMDB ID
 * @param {number} rating - New user rating (1-10)
 */
export function updateMovieRating(imdbID, rating) {
    const movie = mediaData.watched.find(m => m.imdbID === imdbID);
    if (!movie) return;
    
    movie.userRating = rating;
    saveToLocalStorage();
    triggerUIUpdate('watched');
    
    // If this was the selected movie, update the detail view
    if (mediaData.selectedMovie && mediaData.selectedMovie.imdbID === imdbID) {
        mediaData.selectedMovie = movie;
        showMovieDetails(movie, 'watched');
    }
}

/**
 * Remove a movie from a list
 * @param {string} imdbID - Movie IMDB ID
 * @param {string} list - List to remove from ('toWatch' or 'watched')
 */
export function removeMovie(imdbID, list) {
    const movieIndex = mediaData[list].findIndex(m => m.imdbID === imdbID);
    if (movieIndex === -1) return;
    
    mediaData[list].splice(movieIndex, 1);
    saveToLocalStorage();
    triggerUIUpdate(list);
    
    // If this was the selected movie, clear the detail view
    if (mediaData.selectedMovie && mediaData.selectedMovie.imdbID === imdbID) {
        mediaData.selectedMovie = null;
        document.getElementById('movie-details').classList.remove('active');
    }
}

/**
 * Get all movie titles from both lists
 * @returns {string[]} Array of movie titles
 */
export function getAllMovieTitles() {
    return [
        ...mediaData.toWatch.map(m => m.Title),
        ...mediaData.watched.map(m => m.Title)
    ];
}

/**
 * Combine all movies from both lists
 * @returns {Object[]} Array of movie objects
 */
export function getAllMovies() {
    return [...mediaData.toWatch, ...mediaData.watched];
}

/**
 * Save suggestions to the data store
 * @param {Object[]} suggestions - Array of movie suggestions
 */
export function saveSuggestions(suggestions) {
    mediaData.suggestions = suggestions;
    saveToLocalStorage();
}

/**
 * Get current suggestions from the data store
 * @returns {Object[]} Array of movie suggestions
 */
export function getCurrentSuggestions() {
    return mediaData.suggestions || [];
}

/**
 * Export movie data as JSON string
 * @returns {string} - JSON string of the media data
 */
export function exportMovieData() {
    return JSON.stringify(mediaData);
}

/**
 * Import movie data from JSON string
 * @param {string} jsonData - JSON string with media data
 * @returns {boolean} - True if import was successful, false otherwise
 */
export function importMovieData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validate that the data has the expected properties
        if (!data.toWatch || !data.watched) {
            console.error('Invalid data format: missing required properties');
            return false;
        }
        
        // Update the data
        mediaData.toWatch = data.toWatch || [];
        mediaData.watched = data.watched || [];
        mediaData.suggestions = data.suggestions || [];
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Update UI
        triggerUIUpdate('both');
        
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
} 