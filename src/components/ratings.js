// Ratings Component
// Handles movie ratings functionality

import { markAsWatched, updateMovieRating } from '../models/mediaData.js';
import { showNotification } from '../utils/uiUtils.js';

// Current state
let currentMovie = null;
let currentRating = 0;

/**
 * Initialize the ratings component
 */
export function initRatings() {
    console.log('Initializing Ratings Component...');
    
    // Setup the rating modal
    setupRatingModal();
    
    // Initialize star rating
    setupStarRating();
    
    // Initialize rating actions
    // setupRatingActions();
}

/**
 * Setup the rating modal
 */
function setupRatingModal() {
    // Get modal elements
    const ratingModal = document.getElementById('rating-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (!ratingModal) {
        console.error('Rating modal not found in the DOM');
        return;
    }
    
    // Close button
    const closeBtn = ratingModal.querySelector('.close-rating-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideRatingModal();
        });
    }
    
    // Close modal when clicking outside
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            hideRatingModal();
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ratingModal.classList.contains('active')) {
            hideRatingModal();
        }
    });
}

/**
 * Setup the star rating functionality
 */
function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    
    // Set up hover effect
    stars.forEach(star => {
        // Mouseover - highlight stars up to the hovered one
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.dataset.value);
            highlightStars(value, 'hovered');
        });
        
        // Mouseout - remove hover highlights, restore selected
        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });
        
        // Click - set the rating
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            setRating(value);
            highlightStars(value, 'active');
            setTimeout(() => {
                saveRating();
                hideRatingModal();
            }, 10);
        });
    });
}

/**
 * Highlight stars up to a given value
 * @param {number} value - The rating value (1-5)
 * @param {string} className - The CSS class to apply ('active' or 'hovered')
 */
function highlightStars(value, className) {
    const stars = document.querySelectorAll('.star-rating .star');
    
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value);
        if (starValue <= value) {
            star.classList.add(className);
        } else {
            star.classList.remove(className);
        }
    });
}

/**
 * Set the current rating
 * @param {number} value - The rating value (1-5)
 */
function setRating(value) {
    currentRating = value;
}

/**
 * Update stars display based on current rating
 * @param {number} value - The rating value (1-5)
 */
function updateStarsDisplay(value) {
    // Reset all stars
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach(star => star.classList.remove('active'));
    
    // Set active stars
    highlightStars(value, 'active');
    
    // Update rating text
    const ratingValue = document.querySelector('.rating-value');
    if (ratingValue) {
        ratingValue.textContent = `${value} / 5`;
    }
}


/**
 * Show the rating modal for a movie
 * @param {Object} movie - The movie to rate
 * @export
 */
export function showRatingModal(movie) {
    currentMovie = movie;
    currentRating = 0;
    
    // Get modal elements
    const ratingModal = document.getElementById('rating-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (!ratingModal) {
        console.error('Rating modal not found');
        return;
    }
    
    // Update movie info in modal
    const poster = ratingModal.querySelector('.rating-movie-poster');
    const title = ratingModal.querySelector('.rating-movie-title');
    const meta = ratingModal.querySelector('.rating-movie-meta');
    
    if (poster) poster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    if (title) title.textContent = movie.Title;
    if (meta) meta.textContent = `${movie.Year} | ${movie.Runtime !== 'N/A' ? movie.Runtime : 'Unknown'}`;
    
    // Reset rating
    updateStarsDisplay(0);
    
    // Show modal
    ratingModal.classList.add('active');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
    }
}

/**
 * Hide the rating modal
 */
function hideRatingModal() {
    const ratingModal = document.getElementById('rating-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (ratingModal) {
        ratingModal.classList.remove('active');
    }
    
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
    
    // Reset state
    currentMovie = null;
    currentRating = 0;
}

/**
 * Save the rating and mark the movie as watched
 */
function saveRating() {
    if (!currentMovie) return;
    
    if (currentRating > 0) {
        // Scale rating from 1-5 to 1-10 for the data model
        const scaledRating = currentRating * 2;
        
        // Mark as watched with rating
        markAsWatched(currentMovie.imdbID, scaledRating);
        
        // Show success notification
        showNotification(`"${currentMovie.Title}" marked as watched with ${currentRating}-star rating`);
    } else {
        // If no rating, mark as watched with default rating
        markAsWatched(currentMovie.imdbID, 10);
        
        // Show success notification
        showNotification(`"${currentMovie.Title}" marked as watched`);
    }
    
    // Hide modal
    hideRatingModal();
} 