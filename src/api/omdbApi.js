// OMDB API Service
// Handles all interactions with the OMDB API

const API_KEY = '3a90c5bb';
const API_URL = 'https://www.omdbapi.com/';

/**
 * Search movies by title and other optional criteria
 * @param {string} query - Movie title to search for
 * @param {object} options - Optional search parameters
 * @returns {Promise<Array>} - Array of search results
 */
export async function searchMovies(query, options = {}) {
    try {
        // Create URL with parameters
        const url = new URL(API_URL);
        const params = new URLSearchParams();
        params.append('apikey', API_KEY);
        
        // Add title or search parameter
        if (query) {
            params.append('s', query); // Use search endpoint
        }
        
        // Add optional parameters if provided
        if (options.year) {
            params.append('y', options.year);
        }
        
        if (options.type) {
            params.append('type', options.type);
        }
        
        url.search = params.toString();
        
        // Fetch movie data
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            if (data.Search) {
                return data.Search;
            } else if (data.Title) {
                // Single result
                return [data];
            }
        }
        
        return [];
    } catch (error) {
        console.error('OMDB search error:', error);
        throw error;
    }
}

/**
 * Search movie by exact title (and optionally year)
 * @param {string} title - Exact movie title
 * @param {string} year - Optional year of release
 * @returns {Promise<object|null>} - Movie data object or null if not found
 */
export async function searchMovieByTitle(title, year = '') {
    try {
        let searchUrl = `${API_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
        if (year) {
            searchUrl += `&y=${year}`;
        }
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.Response === 'True') {
            return data;
        }
        
        // If exact match fails, try a search and take the first result
        const searchResponse = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(title)}`);
        const searchData = await searchResponse.json();
        
        if (searchData.Response === 'True' && searchData.Search && searchData.Search.length > 0) {
            // Get details for the first movie
            const firstResult = searchData.Search[0];
            const detailsResponse = await fetch(`${API_URL}?apikey=${API_KEY}&i=${firstResult.imdbID}`);
            return await detailsResponse.json();
        }
        
        return null;
    } catch (error) {
        console.error('Error searching for movie by title:', error);
        return null;
    }
}

/**
 * Get detailed movie information by IMDB ID
 * @param {string} imdbID - The IMDB ID of the movie
 * @returns {Promise<object|null>} - Full movie details or null on error
 */
export async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        const data = await response.json();
        
        if (data.Response === 'False') {
            throw new Error(data.Error);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

/**
 * Enhance search results with more detailed information
 * @param {Array} movies - Basic movie search results
 * @returns {Promise<Array>} - Enhanced movie results with more details
 */
export async function enhanceSearchResults(movies) {
    // Only enhance the first 5 results to avoid API rate limiting
    const moviesToEnhance = movies.slice(0, 5);
    
    // For each movie, fetch its detailed information
    const enhancedMovies = await Promise.all(
        moviesToEnhance.map(async (movie) => {
            try {
                const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`);
                const details = await response.json();
                
                if (details.Response === 'True') {
                    return details;
                }
                return movie;
            } catch {
                return movie;
            }
        })
    );
    
    // Add the rest of the movies without enhancement
    return [...enhancedMovies, ...movies.slice(5)];
} 