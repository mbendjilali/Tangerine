// Main Application Entry Point

// Import APIs
// (No direct imports needed as they're used by other modules)

// Import Models
import { initMediaData, importMovieData, exportMovieData } from './models/mediaData.js';

// Import Components
import { initMovieDetails } from './components/movieDetails.js';
import { initMovieList } from './components/movieList.js';
import { initSearch } from './components/search.js';
import { initSuggestions } from './components/suggestions.js';
import { initRatings } from './components/ratings.js';

// Import Utilities
import { showNotification, hideModal } from './utils/uiUtils.js';

// Import Services
// (No direct imports needed as they're used by other modules)

// Import CSS
// (CSS is imported in the HTML file)

/**
 * Initialize the application
 */
export function initApp() {
    console.log('Initializing Tangerine...');
    
    // Initialize data model
    initMediaData();
    
    // Initialize components
    initMovieList();
    initMovieDetails();
    initSearch();
    initSuggestions();
    initRatings();
    
    // Set up data import/export functionality
    setupDataControls();
    
    // Set up general event listeners
    setupGeneralEventListeners();
    
    console.log('Tangerine initialized successfully!');
}

/**
 * Set up data import/export controls
 */
function setupDataControls() {
    // Import data button
    const importInput = document.getElementById('import-data');
    if (importInput) {
        importInput.addEventListener('change', handleDataImport);
    }
    
    // Export data button
    const exportButton = document.getElementById('export-data');
    if (exportButton) {
        exportButton.addEventListener('click', handleDataExport);
    }
}

/**
 * Handle data import from JSON file
 * @param {Event} event - Change event from file input
 */
function handleDataImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            
            // Import data to the model
            const success = importMovieData(jsonData);
            
            if (success) {
                // Refresh UI is handled by mediaData.js
                
                // Show success notification
                showNotification('Data imported successfully');
            } else {
                // Show error notification
                showNotification('Error importing data. Invalid format.');
            }
        } catch (error) {
            console.error('Import error:', error);
            
            // Show error notification
            showNotification('Error importing data. Invalid file.');
        }
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

/**
 * Handle data export to JSON file
 */
function handleDataExport() {
    try {
        // Get export data from the model
        const jsonData = exportMovieData();
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Set link attributes
        a.href = url;
        a.download = `tangerine-data-${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        // Show success notification
        showNotification('Data exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        
        // Show error notification
        showNotification('Error exporting data');
    }
}

/**
 * Set up general event listeners that don't belong to specific components
 */
function setupGeneralEventListeners() {
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
    
    // Close buttons within modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        });
    });
    
    // Handle escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                hideModal(activeModal);
            }
        }
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
