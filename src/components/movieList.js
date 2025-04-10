// Movie List Component
// Handles rendering of movie lists with sorting and filtering

import { getMovies, sortMovies, filterMovies, setUpdateUICallback } from '../models/mediaData.js';
import { createMovieCard } from './movieCard.js';

/**
 * Render movies in either to-watch or watched list
 * @param {string} list - The list to render ('toWatch' or 'watched')
 * @param {string} sortBy - Sort criterion
 * @param {string} filterBy - Filter criterion
 */
export function renderMovies(list) {
    const container = document.getElementById(`${list === 'toWatch' ? 'to-watch-list' : 'watched-list'}`);
    const emptyElement = document.getElementById(`${list === 'toWatch' ? 'to-watch-empty' : 'watched-empty'}`);
    const sortSelect = document.getElementById(`${list === 'toWatch' ? 'to-watch-sort' : 'watched-sort'}`);
    const filterSelect = document.getElementById(`${list === 'toWatch' ? 'to-watch-filter' : 'watched-filter'}`);
    
    if (!container || !emptyElement || !sortSelect || !filterSelect) {
        console.error('Required elements not found for rendering movies');
        return;
    }
    
    // Get the movies from the data model
    const movies = getMovies(list);
    
    // Get sort and filter criteria
    const sortBy = sortSelect.value;
    const filterBy = filterSelect.value;
    
    // Apply sorting and filtering
    const sortedMovies = sortMovies(movies, sortBy);
    const filteredMovies = filterMovies(sortedMovies, filterBy);
    
    // Clear the container except for the empty state element
    const moviesGrid = container.querySelector('.movies-grid');
    if (!moviesGrid) {
        console.error('Movies grid element not found');
        return;
    }
    
    moviesGrid.innerHTML = '';
    
    // Show empty state if no movies
    if (filteredMovies.length === 0) {
        emptyElement.style.display = 'block';
    } else {
        emptyElement.style.display = 'none';
    }
    
    // Create and append movie cards
    filteredMovies.forEach(movie => {
        const movieCard = createMovieCard(movie, list);
        moviesGrid.appendChild(movieCard);
    });
}

/**
 * Handle UI updates when data changes
 * @param {string} list - The list that was updated ('toWatch', 'watched', or 'both')
 */
function handleDataUpdates(list) {
    if (list === 'both') {
        renderMovies('toWatch');
        renderMovies('watched');
    } else {
        renderMovies(list);
    }
}

/**
 * Setup event listeners for movie list sorting and filtering
 */
export function setupMovieListEventListeners() {
    // Sort and filter controls for To Watch list
    const toWatchSort = document.getElementById('to-watch-sort');
    const toWatchFilter = document.getElementById('to-watch-filter');
    
    if (toWatchSort) {
        toWatchSort.addEventListener('change', () => {
            renderMovies('toWatch');
        });
    }
    
    if (toWatchFilter) {
        toWatchFilter.addEventListener('change', () => {
            renderMovies('toWatch');
        });
    }
    
    // Sort and filter controls for Watched list
    const watchedSort = document.getElementById('watched-sort');
    const watchedFilter = document.getElementById('watched-filter');
    
    if (watchedSort) {
        watchedSort.addEventListener('change', () => {
            renderMovies('watched');
        });
    }
    
    if (watchedFilter) {
        watchedFilter.addEventListener('change', () => {
            renderMovies('watched');
        });
    }
}

/**
 * Switch between to-watch and watched tabs
 * @param {string} tab - The tab to switch to ('toWatch' or 'watched')
 */
export async function switchTab(tab) {
    console.log(`Switching to tab: ${tab}`);
    // Save the current scroll position
    const scrollPosition = window.scrollY;
    
    // Hide all lists first
    document.querySelectorAll('.movie-list').forEach(list => {
        list.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.list-selector').forEach(selector => {
        selector.classList.remove('active');
    });
    
    if (tab === 'toWatch' || tab === 'watched') {
        // Activate the selected tab
        const tabElement = document.getElementById(`${getTabElementId(tab)}`);
        if (tabElement) {
            tabElement.classList.add('active');
        }
        
        // Activate the corresponding list
        const listElement = document.getElementById(`${getListElementId(tab)}`);
        if (listElement) {
            listElement.classList.add('active');
        }
        
        // Update URL hash
        window.location.hash = tab;
    }
    
    // Restore scroll position after a small delay to ensure DOM is updated
    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
    }, 10);
}

/**
 * Helper function to get tab element ID from tab name
 * @param {string} tab - Tab name
 * @returns {string} - Element ID
 */
function getTabElementId(tab) {
    switch (tab) {
        case 'toWatch': return 'to-watch-tab';
        case 'watched': return 'watched-tab';
        default: return '';
    }
}

/**
 * Helper function to get list element ID from tab name
 * @param {string} tab - Tab name
 * @returns {string} - Element ID
 */
function getListElementId(tab) {
    switch (tab) {
        case 'toWatch': return 'to-watch-list';
        case 'watched': return 'watched-list';
        default: return '';
    }
}

/**
 * Initialize the movie list component
 */
export function initMovieList() {
    // Register the update callback with the data model
    setUpdateUICallback(handleDataUpdates);
    
    // Setup tab navigation
    const toWatchTab = document.getElementById('to-watch-tab');
    const watchedTab = document.getElementById('watched-tab');
    
    if (toWatchTab) {
        toWatchTab.addEventListener('click', () => switchTab('toWatch'));
    }
    
    if (watchedTab) {
        watchedTab.addEventListener('click', () => switchTab('watched'));
    }
    
    // Setup sort and filter event listeners
    setupMovieListEventListeners();
    
    // Initial rendering
    renderMovies('toWatch');
    renderMovies('watched');
    
    // Check URL hash for active tab
    const hash = window.location.hash.substring(1);
    if (hash === 'watched') {
        switchTab('watched');
    } else if (hash === 'toWatch' || hash === '') {
        switchTab('toWatch');
    }
} 