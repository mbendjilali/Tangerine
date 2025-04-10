// Suggestions Component
// Handles rendering of movie suggestions

import { showMovieDetails } from './movieDetails.js';
import { addToWatchList, markAsWatched } from '../models/mediaData.js';
import { showNotification } from '../utils/uiUtils.js';
import { getMovieSuggestions, replaceSuggestion } from '../services/suggestionService.js';

/**
 * Initialize suggestion section event listeners
 */
export function initSuggestions() {
    console.log('Initializing suggestion section');
    
    // Set up event listener for suggestion refresh button
    const refreshButton = document.getElementById('refresh-suggestions');
    if (refreshButton) {
        console.log('Found refresh button, adding event listener');
        refreshButton.addEventListener('click', loadSuggestions);
    } else {
        console.warn('Refresh button not found');
    }
    
    // Set up event listener for Fruit Market heading
    const fruitMarketButton = document.getElementById('fruit-market-button');
    if (fruitMarketButton) {
        console.log('Found fruit market button, adding event listener');
        fruitMarketButton.addEventListener('click', toggleSuggestionsContainer);
    } else {
        console.warn('Fruit market button not found');
    }
    
    // Make sure suggestions container is properly initialized
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (suggestionsContainer) {
        console.log('Found suggestions container, initializing');
        
        // Make sure the display property is initialized from HTML inline style
        if (suggestionsContainer.style.display !== 'none') {
            console.warn('Suggestions container should start with display:none, fixing');
            suggestionsContainer.style.display = 'none';
        }
        
        // Reset opacity to 0 to be controlled by JavaScript
        suggestionsContainer.style.opacity = '0';
        suggestionsContainer.classList.remove('active');
        
        // Ensure content is initially hidden and loading is visible for next time
        const suggestionsLoading = document.getElementById('suggestions-loading');
        const suggestionsContent = document.getElementById('suggestions-content');
        
        if (suggestionsLoading && suggestionsContent) {
            console.log('Setting initial state of loading and content elements');
            suggestionsLoading.style.display = 'flex';
            suggestionsContent.style.display = 'none';
        } else {
            console.warn('Could not find suggestions loading or content elements');
        }
    } else {
        console.warn('Suggestions container not found');
    }
}

/**
 * Toggle visibility of suggestions container
 */
function toggleSuggestionsContainer() {
    const suggestionsContainer = document.getElementById('suggestions-container');
    const refreshButton = document.getElementById('refresh-suggestions');
    
    if (!suggestionsContainer) {
        console.error('Suggestions container not found');
        return;
    }
    
    console.log('Toggling suggestions container visibility');
    
    // Check current visibility
    const isCurrentlyVisible = suggestionsContainer.style.display !== 'none';
    
    if (!isCurrentlyVisible) {
        // Show container immediately with all needed properties
        console.log('Showing suggestions container');
        
        // Force display block and opacity 1 directly
        suggestionsContainer.style.display = 'block';
        suggestionsContainer.style.opacity = '1';
        
        // Add active class for any other styling
        suggestionsContainer.classList.add('active');
        
        // Show refresh button
        if (refreshButton) refreshButton.style.display = 'flex';
        
        // Load suggestions if needed
        if (!document.querySelector('.suggestion-card')) {
            console.log('Loading suggestions because none exist');
            loadSuggestions();
        } else {
            console.log('Suggestions already loaded, not reloading');
        }
    } else {
        // Hide container immediately
        console.log('Hiding suggestions container');
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.style.opacity = '0';
        suggestionsContainer.classList.remove('active');
        
        if (refreshButton) refreshButton.style.display = 'none';
    }
}

/**
 * Load movie suggestions and update the UI
 */
export function loadSuggestions() {
    console.log('Loading suggestions started');
    
    const suggestionsLoading = document.getElementById('suggestions-loading');
    const suggestionsContent = document.getElementById('suggestions-content');
    
    if (!suggestionsLoading || !suggestionsContent) {
        console.error('Suggestions elements not found');
        return;
    }
    
    // Show loading state
    suggestionsLoading.style.display = 'flex';
    suggestionsContent.style.display = 'none';
    
    console.log('Fetching suggestions from API');
    
    // Get movie suggestions
    getMovieSuggestions(
        // onLoadStart callback
        () => {
            console.log('Load start callback triggered');
        },
        // onLoadComplete callback
        (suggestions) => {
            console.log('Suggestions loaded successfully:', suggestions.length);
            
            // Hide loading state
            suggestionsLoading.style.display = 'none';
            suggestionsContent.style.display = 'grid';
            
            // Force visibility
            const container = document.getElementById('suggestions-container');
            if (container) {
                container.style.opacity = '1';
                container.classList.add('active');
            }
            
            // Update UI with suggestions
            renderSuggestions(suggestions);
        },
        // onError callback
        (error) => {
            console.error('Error loading suggestions:', error);
            
            suggestionsLoading.style.display = 'none';
            suggestionsContent.style.display = 'block';
            
            // Show error message
            suggestionsContent.innerHTML = `
                <div class="suggestions-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Sorry, we couldn't get suggestions. Please try again later.</p>
                </div>
            `;
        }
    );
}

/**
 * Render movie suggestions in the UI
 * @param {Array} suggestions - Array of suggestion objects
 */
function renderSuggestions(suggestions) {
    console.log('Rendering suggestions:', suggestions ? suggestions.length : 0);
    
    const suggestionsContent = document.getElementById('suggestions-content');
    if (!suggestionsContent) {
        console.error('Suggestions content element not found');
        return;
    }
    
    // Clear previous content
    suggestionsContent.innerHTML = '';
    
    // Show message if no suggestions
    if (!suggestions || suggestions.length === 0) {
        console.log('No suggestions to display');
        suggestionsContent.innerHTML = `
            <div class="suggestions-empty">
                <i class="fas fa-film"></i>
                <p>Add some movies to your lists to get suggestions.</p>
            </div>
        `;
        return;
    }
    
    // Create and append all cards immediately
    suggestions.forEach((suggestion, index) => {
        console.log(`Creating card ${index+1}/${suggestions.length} for ${suggestion.Title}`);
        const card = createSuggestionCard(suggestion);
        suggestionsContent.appendChild(card);
    });
    
    // Force visibility of the container again
    const container = document.getElementById('suggestions-container');
    if (container) {
        container.style.opacity = '1';
        container.classList.add('active');
    }
}

/**
 * Create a suggestion card element
 * @param {Object} suggestion - Suggestion object with movie data
 * @returns {HTMLElement} - The suggestion card element
 */
function createSuggestionCard(suggestion) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.dataset.imdbId = suggestion.imdbID;
    
    // Create card content
    const posterUrl = suggestion.Poster && suggestion.Poster !== 'N/A' 
        ? suggestion.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';

    // Match the movie card structure as closely as possible
    card.innerHTML = `
        <div class="suggestion-card-loading" style="display: none;">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <img class="suggestion-poster" src="${posterUrl}" alt="${suggestion.Title} poster">
        <div class="suggestion-info">
            <h3 class="suggestion-title">${suggestion.Title}</h3>
            <div class="suggestion-meta">${suggestion.Year} | ${suggestion.Genre || 'Various Genres'}</div>
            <div class="suggestion-reason">${suggestion.reason || 'Recommended based on your taste'}</div>
        </div>
        <div class="suggestion-actions">
            <button class="suggestion-add-btn" title="Add to Watchlist">
                <i class="fas fa-plus"></i>
            </button>
            <button class="suggestion-watched-btn" title="Add to Watched">
                <i class="fas fa-check"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    addSuggestionCardEventListeners(card, suggestion);
    
    return card;
}

/**
 * Add event listeners to a suggestion card
 * @param {HTMLElement} card - The suggestion card element
 * @param {Object} suggestion - Suggestion object with movie data
 */
function addSuggestionCardEventListeners(card, suggestion) {
    // Click on card opens the detail view
    card.addEventListener('click', (e) => {
        // Don't open details if clicking a button
        if (!e.target.closest('button')) {
            showMovieDetails(suggestion, 'suggestion');
        }
    });
    
    // Add to watchlist button
    const addButton = card.querySelector('.suggestion-add-btn');
    if (addButton) {
        addButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const added = await addToWatchList(suggestion);
            if (added) {
                showNotification(`"${suggestion.Title}" added to your basket`);
                
                // Set card to loading state
                card.querySelector('.suggestion-card-content').style.display = 'none';
                card.querySelector('.suggestion-card-loading').style.display = 'flex';
                
                // Replace this suggestion with a new one
                replaceSuggestion(
                    suggestion.imdbID,
                    // onReplaceStart callback
                    () => {
                        // Already handled above
                    },
                    // onReplaceComplete callback
                    (imdbID, newSuggestion) => {
                        // Check if the card is still in the DOM (may have been removed during async operation)
                        const existingCard = document.querySelector(`.suggestion-card[data-imdbid="${imdbID}"]`);
                        if (existingCard) {
                            // Update the card in place
                            updateSuggestionCard(existingCard, newSuggestion);
                        }
                    },
                    // onError callback
                    (error) => {
                        showNotification('Could not get a new suggestion. Try refreshing.');
                        console.error('Error replacing suggestion:', error);
                        
                        // Remove the card with animation
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.remove();
                        }, 300);
                    }
                );
            }
        });
    }
    
    // Add to watched button
    const watchedButton = card.querySelector('.suggestion-watched-btn');
    if (watchedButton) {
        watchedButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // First add to watchlist
            const added = await addToWatchList(suggestion);
            if (added) {
                // Then mark as watched
                await markAsWatched(suggestion.imdbID);
                
                showNotification(`"${suggestion.Title}" added to your watched list`);
                
                // Set card to loading state
                card.querySelector('.suggestion-card-content').style.display = 'none';
                card.querySelector('.suggestion-card-loading').style.display = 'flex';
                
                // Replace this suggestion with a new one
                replaceSuggestion(
                    suggestion.imdbID,
                    null,
                    (imdbID, newSuggestion) => {
                        // Check if the card is still in the DOM
                        const existingCard = document.querySelector(`.suggestion-card[data-imdbid="${imdbID}"]`);
                        if (existingCard) {
                            // Update the card in place
                            updateSuggestionCard(existingCard, newSuggestion);
                        }
                    },
                    (error) => {
                        showNotification('Could not get a new suggestion. Try refreshing.');
                        console.error('Error replacing suggestion:', error);
                        
                        // Remove the card with animation
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.remove();
                        }, 300);
                    }
                );
            }
        });
    }
}

/**
 * Update an existing suggestion card with new data
 * @param {HTMLElement} card - The card element to update
 * @param {Object} suggestion - New suggestion data
 */
function updateSuggestionCard(card, suggestion) {
    // Update card data attribute
    card.dataset.imdbId = suggestion.imdbID;
    
    // Get elements to update
    const contentContainer = card.querySelector('.suggestion-card-content');
    const loadingContainer = card.querySelector('.suggestion-card-loading');
    const poster = card.querySelector('.suggestion-poster');
    const title = card.querySelector('.suggestion-title');
    const meta = card.querySelector('.suggestion-meta');
    const reason = card.querySelector('.suggestion-reason');
    
    // Update poster
    if (poster) {
        poster.src = suggestion.Poster && suggestion.Poster !== 'N/A' 
            ? suggestion.Poster 
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        poster.alt = `${suggestion.Title} poster`;
    }
    
    // Update text content
    if (title) title.textContent = suggestion.Title;
    if (meta) meta.textContent = `${suggestion.Year} | ${suggestion.Genre || 'Various Genres'}`;
    if (reason) reason.textContent = suggestion.reason || 'Recommended based on your taste';
    
    // Show content, hide loading
    if (contentContainer) contentContainer.style.display = 'block';
    if (loadingContainer) loadingContainer.style.display = 'none';
    
    // Apply a highlight animation
    card.classList.add('highlight');
    setTimeout(() => {
        card.classList.remove('highlight');
    }, 1500);
} 