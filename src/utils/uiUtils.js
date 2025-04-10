// UI Utility Functions

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 * @param {number} duration - Duration in milliseconds to show the notification
 */
export function showNotification(message, type = 'success', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'white';
    notification.style.color = '#333';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    
    // Add style based on notification type
    if (type === 'success') {
        notification.style.borderLeft = '4px solid #2ecc71';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #e74c3c';
    } else {
        notification.style.borderLeft = '4px solid #3498db';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * Show a modal
 * @param {HTMLElement} modal - The modal element to show
 */
export function showModal(modal) {
    if (!modal) return;
    
    // Get the modal overlay
    const modalOverlay = document.getElementById('modal-overlay');
    
    // Add active class to modal and overlay
    modal.classList.add('active');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
    }
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Hide a modal
 * @param {HTMLElement} modal - The modal element to hide
 */
export function hideModal(modal) {
    if (!modal) return;
    
    // Get the modal overlay
    const modalOverlay = document.getElementById('modal-overlay');
    
    // Remove active class from modal and overlay
    modal.classList.remove('active');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
    
    // Re-enable body scrolling
    document.body.style.overflow = '';
}

/**
 * Apply a fade-in animation to an element
 * @param {HTMLElement} element - Element to animate
 * @param {number} delay - Delay before starting the animation in milliseconds
 */
export function fadeIn(element, delay = 0) {
    if (!element) return;
    
    // Set initial state
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, delay);
}

/**
 * Apply a fade-out animation to an element
 * @param {HTMLElement} element - Element to animate
 * @param {number} delay - Delay before starting the animation in milliseconds
 * @param {Function} callback - Function to call after animation completes
 */
export function fadeOut(element, delay = 0, callback) {
    if (!element) return;
    
    // Set transition
    element.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        element.style.opacity = '0';
        
        // Wait for transition to complete before calling callback
        setTimeout(() => {
            if (typeof callback === 'function') {
                callback();
            }
        }, 300);
    }, delay);
}

/**
 * Animate an element with a slide down effect
 * @param {HTMLElement} element - Element to animate
 * @param {number} duration - Duration of the animation in milliseconds
 */
export function slideDown(element, duration = 300) {
    if (!element) return;
    
    // Reset any inline styles that might interfere
    element.style.display = 'block';
    element.style.overflow = 'hidden';
    element.style.height = 'auto';
    const height = element.offsetHeight;
    
    // Set initial state
    element.style.height = '0px';
    
    // Trigger transition
    setTimeout(() => {
        element.style.transition = `height ${duration}ms ease`;
        element.style.height = `${height}px`;
        
        // After animation completes, remove the explicit height
        setTimeout(() => {
            element.style.height = 'auto';
        }, duration);
    }, 10);
}

/**
 * Animate an element with a slide up effect
 * @param {HTMLElement} element - Element to animate
 * @param {number} duration - Duration of the animation in milliseconds
 * @param {Function} callback - Function to call after animation completes
 */
export function slideUp(element, duration = 300, callback) {
    if (!element) return;
    
    // Set initial state
    element.style.overflow = 'hidden';
    element.style.height = `${element.offsetHeight}px`;
    
    // Trigger transition
    setTimeout(() => {
        element.style.transition = `height ${duration}ms ease`;
        element.style.height = '0px';
        
        // After animation completes
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = 'auto';
            
            if (typeof callback === 'function') {
                callback();
            }
        }, duration);
    }, 10);
}

/**
 * Shuffle array elements randomly
 * @param {Array} array - The array to shuffle
 * @returns {Array} - A new shuffled array
 */
export function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Create a loading spinner element
 * @returns {HTMLElement} The loading spinner element
 */
export function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    return spinner;
}

/**
 * Format a date string to locale date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Unknown';
    }
}

/**
 * Create a star rating element
 * @param {number} rating - Rating value (0-10)
 * @param {boolean} interactive - Whether the rating should be interactive
 * @returns {HTMLElement} The star rating element
 */
export function createStarRating(rating, interactive = false) {
    const container = document.createElement('div');
    container.className = 'star-rating-display';
    
    // Scale rating from 0-10 to 0-5
    const scaledRating = Math.round(rating / 2);
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = i <= scaledRating ? 'star filled' : 'star';
        star.textContent = '★';
        
        if (interactive) {
            star.dataset.value = i;
            star.style.cursor = 'pointer';
        }
        
        container.appendChild(star);
    }
    
    return container;
} 