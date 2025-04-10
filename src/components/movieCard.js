// Movie Card Component
// Creates and manages movie cards for the UI

import { showMovieDetails } from './movieDetails.js';
import { markAsUnwatched, removeMovie } from '../models/mediaData.js';
import { showNotification } from '../utils/uiUtils.js';
import { showRatingModal } from './ratings.js';

/**
 * Create a movie card element
 * @param {Object} movie - Movie data object
 * @param {string} list - List the movie belongs to ('toWatch' or 'watched')
 * @returns {HTMLElement} - The created movie card element
 */
export function createMovieCard(movie, list) {
    const isWatched = list === 'watched';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.imdbId = movie.imdbID;
    
    // Set initial state for animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    // Create card content
    card.innerHTML = `
        <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.Title} poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <div class="movie-meta">${movie.Year} | ${movie.Runtime !== 'N/A' ? movie.Runtime : 'Unknown'}</div>
            <div class="movie-rating">
                ${isWatched && movie.userRating ? 
                    `<span class="user-rating">${renderStarRating(movie.userRating)}&nbsp;&nbsp<i class="fas fa-star"></i></span>` : ''}
                ${movie.imdbRating && movie.imdbRating !== 'N/A' ? 
                    `<span class="imdb-rating">IMDb: ${movie.imdbRating}</span>` : ''}
            </div>
        </div>
        <div class="movie-actions">
            ${isWatched ? 
                `
                <button class="movie-action-btn remove-btn" title="Remove from Watched">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="movie-action-btn unwatched-btn" title="Mark as Unwatched">
                    <i class="fas fa-undo"></i>
                </button>
                ` : 
                `
                <button class="movie-action-btn remove-btn" title="Remove from Watchlist">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="movie-action-btn watched-btn" title="Mark as Watched">
                    <i class="fas fa-check"></i>
                </button>
                `
            }
        </div>
    `;
    
    // Add event listeners
    addMovieCardEventListeners(card, movie, list);
    
    // Animate the card after being added to DOM
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50);
    
    return card;
}

/**
 * Add event listeners to a movie card
 * @param {HTMLElement} card - The movie card element
 * @param {Object} movie - Movie data object
 * @param {string} list - List the movie belongs to ('toWatch' or 'watched')
 */
function addMovieCardEventListeners(card, movie, list) {
    // Click on card opens the detail view
    card.addEventListener('click', (e) => {
        // Don't open details if clicking a button
        if (!e.target.closest('button')) {
            showMovieDetails(movie, list);
        }
    });
    
    // Remove button
    const removeBtn = card.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Animate removal
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                removeMovie(movie.imdbID, list);
                showNotification(`"${movie.Title}" removed from your ${list === 'toWatch' ? 'To-Watch' : 'Watched'} list`);
            }, 300);
        });
    }
    
    // Mark as watched button
    const watchedBtn = card.querySelector('.watched-btn');
    if (watchedBtn) {
        watchedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Show rating modal instead of immediately marking as watched
            showRatingModal(movie);
        });
    }
    
    // Mark as unwatched button
    const unwatchedBtn = card.querySelector('.unwatched-btn');
    if (unwatchedBtn) {
        unwatchedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Animate removal
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                markAsUnwatched(movie.imdbID);
                showNotification(`"${movie.Title}" moved back to your To-Watch list`);
            }, 300);
        });
    }
}

/**
 * Helper function to render star rating for display
 * @param {number} rating - Rating value (1-10)
 * @returns {string} - Formatted rating string
 */
function renderStarRating(rating) {
    // Simply return the numeric value without adding any additional text
    return rating;
}

/**
 * Update a movie card with new data
 * @param {HTMLElement} card - The movie card element to update
 * @param {Object} movie - Updated movie data
 */
export function updateMovieCard(card, movie) {
    if (!card) return;
    
    // Update the poster
    const poster = card.querySelector('.movie-poster');
    if (poster) {
        poster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
        poster.alt = `${movie.Title} poster`;
    }
    
    // Update title and metadata
    const title = card.querySelector('.movie-title');
    if (title) {
        title.textContent = movie.Title;
    }
    
    const meta = card.querySelector('.movie-meta');
    if (meta) {
        meta.textContent = `${movie.Year} | ${movie.Runtime !== 'N/A' ? movie.Runtime : 'Unknown'}`;
    }
    
    // Update ratings
    const rating = card.querySelector('.movie-rating');
    if (rating) {
        let ratingHTML = '';
        
        if (movie.userRating) {
            ratingHTML += `<span class="user-rating">${renderStarRating(movie.userRating)}</span>`;
        }
        
        if (movie.imdbRating && movie.imdbRating !== 'N/A') {
            ratingHTML += `<span class="imdb-rating">IMDb: ${movie.imdbRating}</span>`;
        }
        
        rating.innerHTML = ratingHTML;
    }
} 