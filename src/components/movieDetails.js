// Movie Details Component
// Handles displaying detailed movie information in a modal

import { fetchMovieDetails } from '../api/omdbApi.js';
import { markAsWatched, markAsUnwatched, removeMovie, addToWatchList } from '../models/mediaData.js';
import { showModal, hideModal, showNotification, createStarRating } from '../utils/uiUtils.js';
import { replaceSuggestion } from '../services/suggestionService.js';
import { showRatingModal } from './ratings.js';

let detailsModal;

/**
 * Initialize the movie details component
 */
export function initMovieDetails() {
    detailsModal = document.getElementById('detail-modal');
}

/**
 * Show detailed information about a movie in a modal
 * @param {Object} movie - Movie object with data to display
 * @param {string} list - The list the movie belongs to ('toWatch', 'watched', or 'suggestion')
 */
export async function showMovieDetails(movie, list) {
    if (!detailsModal) {
        initMovieDetails();
    }
    
    const modalContent = detailsModal.querySelector('.modal-content');
    
    // Clear previous content
    modalContent.innerHTML = '';
    
    // Get the origin card element for animation effect
    const originCard = document.querySelector(`.movie-card[data-imdbid="${movie.imdbID}"]`) || 
                      document.querySelector(`.suggestion-card[data-imdbid="${movie.imdbID}"]`);
    if (originCard) {
        // Add a brief scale effect to the card before opening the modal
        originCard.style.transform = 'scale(1.05)';
        setTimeout(() => {
            originCard.style.transform = ''; // Reset after brief animation
        }, 200);
    }
    
    // Fetch complete movie data if needed
    if (!movie.Plot || movie.Plot === 'N/A') {
        const fullMovieDetails = await fetchMovieDetails(movie.imdbID);
        if (fullMovieDetails) {
            // Merge the fetched details with our movie object
            movie = { ...movie, ...fullMovieDetails };
        }
    }
    
    // Create movie detail HTML structure
    // Use poster for image source
    const posterUrl = movie.Poster && movie.Poster !== 'N/A' 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    // First render without gradient (we'll add it after calculating color if needed)
    modalContent.innerHTML = generateMovieDetailsHTML(movie, list);
    
    // Show the modal
    showModal(detailsModal);
    
    // Apply gradient using pre-computed color or calculate if needed
    applyGradientBackground(modalContent, movie, posterUrl, list);
    
    // Add event listeners for the buttons
    const closeButton = modalContent.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideModal(detailsModal);
        });
    }
    
    setupDetailActionButtons(movie, list);
}

/**
 * Apply a gradient background based on the movie's poster color
 * @param {HTMLElement} element - The element to apply the gradient to
 * @param {Object} movie - Movie object
 * @param {string} posterUrl - URL of the movie poster
 * @param {string} list - The list the movie belongs to
 */
async function applyGradientBackground(element, movie, posterUrl, list) {
    const detailContentElement = element.querySelector('.movie-detail-content');
    if (!detailContentElement) {
        console.error('Movie detail content element not found after rendering');
        return;
    }
    
    try {
        // Use pre-computed color if available
        if (movie.avgColor) {
            detailContentElement.style.background = `linear-gradient(to top, 
                var(--card-background) 0%, 
                ${movie.avgColor}80 100%)`; // 80 adds 50% transparency
            return;
        }
        
        // If we reach here, we need to compute the color
        // For this example, we'll just use a default gradient
        detailContentElement.style.background = `linear-gradient(to top, 
            var(--card-background) 0%, 
            rgba(221, 117, 0, 0.2) 100%)`;
    } catch (error) {
        console.error('Error setting gradient:', error);
        // Just continue with default background if there's an error
    }
}

/**
 * Generate HTML for movie details
 * @param {Object} movie - Movie data object
 * @param {string} list - List the movie belongs to ('toWatch' or 'watched')
 * @returns {string} - HTML content for movie details
 */
function generateMovieDetailsHTML(movie, list) {
    
    // Create movie detail HTML structure
    // Use poster for image source
    const posterUrl = movie.Poster && movie.Poster !== 'N/A' 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    // First render without gradient (we'll add it after calculating color if needed)
    const movieDetailsHTML = `
        <button class="close-modal">
            <i class="fas fa-times"></i>
        </button>
        <div class="movie-detail">
            <div class="movie-detail-content clearfix">
                <div class="movie-detail-poster-container">
                    <img src="${posterUrl}" 
                        alt="${movie.Title}" class="movie-detail-poster">
                </div>
                <h2 class="movie-detail-title">${movie.Title}</h2>
                
                <div class="movie-detail-meta">
                    ${movie.Year ? `<span>${movie.Year}</span>` : ''}
                    ${movie.Rated ? `<span>${movie.Rated}</span>` : ''}
                    ${movie.Runtime && movie.Runtime !== 'N/A' ? `<span>${movie.Runtime}</span>` : ''}
                </div>
                
                <div class="movie-detail-rating">
                    ${list === 'watched' && movie.userRating ?
                        `<div class="movie-detail-rating-item">
                            <span class="user-rating">${movie.userRating}&nbsp;&nbsp;<i class="fas fa-star"></i></span>
                        </div>` : ''
                    }
                    ${movie.imdbRating && movie.imdbRating !== 'N/A' ?
                        `<div class="movie-detail-rating-item">
                            <span class="imdb-rating">IMDb: ${movie.imdbRating}</span>
                        </div>` : ''
                    }
                </div>
                
                ${movie.Genre && movie.Genre !== 'N/A' ?
                    `<div class="movie-detail-section">
                        <h3>Genre</h3>
                        <p>${movie.Genre}</p>
                    </div>` : ''
                }
                
                ${movie.Director && movie.Director !== 'N/A' ?
                    `<div class="movie-detail-section">
                        <h3>Director</h3>
                        <p>${movie.Director}</p>
                    </div>` : ''
                }
                
                ${movie.Plot && movie.Plot !== 'N/A' ?
                    `<div class="movie-detail-section">
                        <h3>Plot</h3>
                        <p>${movie.Plot}</p>
                    </div>` : ''
                }
                
                ${movie.Actors && movie.Actors !== 'N/A' ?
                    `<div class="movie-detail-section">
                        <h3>Cast</h3>
                        <p>${movie.Actors}</p>
                    </div>` : ''
                }
                
                ${movie.reason && list === 'suggestion' ?
                    `<div class="movie-detail-section">
                        <h3>Why It's Recommended</h3>
                        <p>${movie.reason}</p>
                    </div>` : ''
                }
                
                <div class="movie-detail-actions">
                    ${getMovieActionButtons(movie, list)}
                </div>
            </div>
        </div>
    `;
    
    return movieDetailsHTML;
}

/**
 * Generate action buttons based on movie status
 * @param {Object} movie - Movie object
 * @param {string} list - The list the movie belongs to
 * @returns {string} - HTML string of action buttons
 */
function getMovieActionButtons(movie, list) {
    // For simplicity, we'll just check the list type
    // In a real implementation, you might want to check if the movie exists in different lists
    
    if (list === 'toWatch') {
        return `
            <button id="mark-watched" class="detail-button primary-button" data-imdbid="${movie.imdbID}">
                <i class="fas fa-check"></i> Mark as Watched
            </button>
            <button id="remove-movie" class="detail-button secondary-button" data-imdbid="${movie.imdbID}" data-list="toWatch">
                <i class="fas fa-trash"></i> Remove from List
            </button>
        `;
    } else if (list === 'watched') {
        return `
            <button id="mark-unwatched" class="detail-button primary-button" data-imdbid="${movie.imdbID}">
                <i class="fas fa-undo"></i> Mark as Unwatched
            </button>
            <button id="remove-movie" class="detail-button secondary-button" data-imdbid="${movie.imdbID}" data-list="watched">
                <i class="fas fa-trash"></i> Remove from List
            </button>
        `;
    } else { 
        // For suggestions
        return `
            <button id="add-to-watchlist" class="detail-button primary-button" data-imdbid="${movie.imdbID}">
                <i class="fas fa-plus"></i> Add to Movie Basket
            </button>
            <button id="mark-watched-suggestion" class="detail-button primary-button" data-imdbid="${movie.imdbID}">
                <i class="fas fa-check"></i> Add to Watched
            </button>
        `;
    }
}

/**
 * Set up event listeners for the action buttons in the movie detail view
 * @param {Object} movie - Movie object
 * @param {string} list - The list the movie belongs to
 */
function setupDetailActionButtons(movie, list) {
    const modalContent = detailsModal.querySelector('.modal-content');
    
    // Button for marking as watched
    const markWatchedButton = modalContent.querySelector('#mark-watched');
    if (markWatchedButton) {
        markWatchedButton.addEventListener('click', () => {
            hideModal(detailsModal);
            // Show rating modal instead of directly marking as watched
            showRatingModal(movie);
        });
    }
    
    // Button for marking as unwatched
    const markUnwatchedButton = modalContent.querySelector('#mark-unwatched');
    if (markUnwatchedButton) {
        markUnwatchedButton.addEventListener('click', () => {
            hideModal(detailsModal);
            markAsUnwatched(movie.imdbID);
        });
    }
    
    // Button for removing from list
    const removeButton = modalContent.querySelector('#remove-movie');
    if (removeButton) {
        removeButton.addEventListener('click', () => {
            hideModal(detailsModal);
            const listType = removeButton.dataset.list;
            removeMovie(movie.imdbID, listType);
        });
    }
    
    // Button for adding suggestion to watchlist
    const addToWatchlistButton = modalContent.querySelector('#add-to-watchlist');
    if (addToWatchlistButton) {
        addToWatchlistButton.addEventListener('click', async () => {
            hideModal(detailsModal);
            const added = await addToWatchList(movie);
            
            if (added && list === 'suggestion') {
                // If this was a suggestion, replace it with a new one
                replaceSuggestion(movie.imdbID);
            }
        });
    }
    
    // Button for adding suggestion directly to watched
    const markWatchedSuggestionButton = modalContent.querySelector('#mark-watched-suggestion');
    if (markWatchedSuggestionButton) {
        markWatchedSuggestionButton.addEventListener('click', async () => {
            hideModal(detailsModal);
            // First add to watchlist, then mark as watched
            const added = await addToWatchList(movie);
            if (added) {
                setTimeout(() => markAsWatched(movie.imdbID), 100);
                
                if (list === 'suggestion') {
                    // If this was a suggestion, replace it with a new one
                    setTimeout(() => replaceSuggestion(movie.imdbID), 500);
                }
            }
        });
    }
    
} 