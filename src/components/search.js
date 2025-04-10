// Search Component
// Handles searching for movies and displaying results

import { searchMovies, enhanceSearchResults } from '../api/omdbApi.js';
import { addToWatchList } from '../models/mediaData.js';
import { showNotification, fadeOut } from '../utils/uiUtils.js';

// Keep track of the search container state
let isSearchResultsVisible = false;

/**
 * Perform a movie search based on input fields and display results
 */
export async function performSearch() {
    const searchInput = document.getElementById('movie-search');
    const searchIcon = document.getElementById('search-icon');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) {
        console.error('Search elements not found');
        return;
    }
    
    const query = searchInput.value.trim();
    
    // Clear results if search is empty
    if (query === '') {
        if (isSearchResultsVisible) {
            // Hide search results with animation
            fadeOut(searchResults, 0, () => {
                searchResults.style.display = 'none';
                isSearchResultsVisible = false;
            });
        }
        return;
    }
    
    // Get additional search parameters
    const yearInput = document.getElementById('year-input');
    const directorInput = document.getElementById('director-input');
    const typeSelect = document.getElementById('type-select');
    
    const year = yearInput ? yearInput.value.trim() : '';
    const director = directorInput ? directorInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : '';
    
    // Validate that at least one search parameter is provided
    if (!query && !year && !director && !type) {
        showNotification('Please enter at least one search criteria');
        return;
    }
    
    try {
        // Update UI to show searching state
        if (searchIcon) {
            searchIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        // Always make sure search results are visible when searching
        searchResults.style.display = 'block';
        searchResults.style.opacity = '1'; // Reset opacity in case it was faded out
        searchResults.innerHTML = '<div class="loading">Searching movies...</div>';
        isSearchResultsVisible = true;
        
        // Create search options
        const options = {
            year,
            type
        };
        
        // Fetch movie data from API
        const results = await searchMovies(query, options);
        
        // Enhance search results with more details
        let enhancedResults = await enhanceSearchResults(results);
        
        // Filter by director if needed
        if (director) {
            enhancedResults = enhancedResults.filter(movie => 
                movie.Director && movie.Director.toLowerCase().includes(director.toLowerCase())
            );
            
            if (enhancedResults.length === 0) {
                searchResults.innerHTML = '<div class="no-results">No movies match your director search.</div>';
                if (searchIcon) {
                    searchIcon.innerHTML = '<i class="fas fa-search"></i>';
                }
                return;
            }
        }
        
        // Render the search results
        renderSearchResults(enhancedResults);
        
    } catch (error) {
        searchResults.innerHTML = '<div class="error">An error occurred while searching. Please try again.</div>';
        console.error('Search error:', error);
    } finally {
        if (searchIcon) {
            searchIcon.innerHTML = '<i class="fas fa-search"></i>';
        }
    }
}

/**
 * Render search results with animations
 * @param {Array} movies - Array of movie objects to display
 */
function renderSearchResults(movies) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    // Clear the container
    searchResults.innerHTML = '';
    
    // Add header with close button
    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>${movies.length} movie${movies.length !== 1 ? 's' : ''} found</h3>
            <button class="close-search-results" aria-label="Close search results">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    searchResults.appendChild(header);

    // Add event listener to close button
    const closeButton = header.querySelector('.close-search-results');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            fadeOut(searchResults, 0, () => {
                searchResults.style.display = 'none';
                isSearchResultsVisible = false;
            });
        });
    }

    // Handle empty results
    if (movies.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No movies found';
        searchResults.appendChild(noResults);
        return;
    }
    
    // Create and add each movie result with staggered animation
    movies.forEach((movie, index) => {
        const result = document.createElement('div');
        result.className = 'search-result';
        result.style.opacity = '0';
        result.style.transform = 'translateY(20px)';
        
        // Set initial poster URL
        const posterUrl = movie.Poster && movie.Poster !== 'N/A' 
            ? movie.Poster 
            : 'https://via.placeholder.com/300x450?text=No+Poster';
            
        result.innerHTML = `
            <img class="search-result-poster" src="${posterUrl}" alt="${movie.Title} poster">
            <div class="search-result-info">
                <div>
                    <div class="search-result-title">${movie.Title}</div>
                    <div class="search-result-meta">${movie.Year} | ${movie.Type || 'N/A'} | ${movie.Genre || 'Genre N/A'}</div>
                    <div class="search-result-plot">${movie.Plot || 'Plot information not available.'}</div>
                </div>
                <div class="search-result-actions">
                    <button class="add-to-watchlist">Add to basket</button>
                </div>
            </div>
        `;
        
        searchResults.appendChild(result);
        
        // Add event listener for adding to watchlist
        const addButton = result.querySelector('.add-to-watchlist');
        if (addButton) {
            addButton.addEventListener('click', async () => {
                const added = await addToWatchList(movie);
                if (added) {
                    showNotification(`"${movie.Title}" added to your basket`);
                    
                    // Clear the search input
                    const searchInput = document.getElementById('movie-search');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    
                    // Clear the search results
                    searchResults.innerHTML = '';
                    
                    // Close the search results after adding
                    fadeOut(searchResults, 0, () => {
                        searchResults.style.display = 'none';
                        isSearchResultsVisible = false;
                    });
                }
            });
        }
        
        // Animate each result with staggered delay
        setTimeout(() => {
            result.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            result.style.opacity = '1';
            result.style.transform = 'translateY(0)';
        }, 50 + (index * 100)); // Stagger the animations
    });
}

/**
 * Handle document click to close search results when clicking outside
 * @param {Event} event - Click event
 */
function handleDocumentClick(event) {
    const searchResults = document.getElementById('search-results');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchResults || !searchContainer) return;
    
    // If search results are displayed and the click is outside the search container and search results
    if (isSearchResultsVisible && 
        !searchResults.contains(event.target) && 
        !searchContainer.contains(event.target)) {
        fadeOut(searchResults, 0, () => {
            searchResults.style.display = 'none';
            isSearchResultsVisible = false;
        });
    }
}

/**
 * Initialize the search component
 */
export function initSearch() {
    const searchInput = document.getElementById('movie-search');
    const searchIcon = document.getElementById('search-icon');
    
    // Search input handler for Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Clear search results when search field is cleared and loses focus
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                const searchResults = document.getElementById('search-results');
                if (!searchResults) return;
                // Don't hide immediately to prevent flickering during typing
                // Only hide if the field remains empty for a moment
                setTimeout(() => {
                    if (e.target.value.trim() === '') {
                        fadeOut(searchResults, 0, () => {
                            searchResults.style.display = 'none';
                            isSearchResultsVisible = false;
                        });
                    }
                }, 300);
            }
        });
    }

    // Search icon click handler
    if (searchIcon) {
        searchIcon.addEventListener('click', performSearch);
    }
    
    // Setup document click listener for closing search results
    document.addEventListener('click', handleDocumentClick);
} 