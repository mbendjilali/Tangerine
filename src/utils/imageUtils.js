// Image Utility Functions

/**
 * Calculate the average color of an image
 * @param {string} imgUrl - URL of the image to analyze
 * @returns {Promise<string>} - Hex color string representing the average color
 */
export function getAverageColor(imgUrl) {
    return new Promise((resolve, reject) => {
        // Use a default color if the image is a placeholder or not available
        if (!imgUrl || imgUrl.includes('placeholder')) {
            resolve('#f8f9f5'); // Use background color as fallback
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous'; // To handle CORS issues
        
        img.onload = function() {
            try {
                // Create canvas to analyze image
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const width = img.width;
                const height = img.height;
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw image to canvas
                context.drawImage(img, 0, 0, width, height);
                
                // Get pixel data
                const imageData = context.getImageData(0, 0, width, height).data;
                
                let totalR = 0, totalG = 0, totalB = 0;
                const pixelCount = width * height;
                
                // Sum up all RGB values
                for (let i = 0; i < imageData.length; i += 4) {
                    totalR += imageData[i];
                    totalG += imageData[i + 1];
                    totalB += imageData[i + 2];
                }
                
                // Calculate average
                const avgR = Math.floor(totalR / pixelCount);
                const avgG = Math.floor(totalG / pixelCount);
                const avgB = Math.floor(totalB / pixelCount);
                
                // Return as hex color
                const avgColorHex = `#${(avgR).toString(16).padStart(2, '0')}${(avgG).toString(16).padStart(2, '0')}${(avgB).toString(16).padStart(2, '0')}`;
                resolve(avgColorHex);
            } catch (e) {
                console.error("Error calculating average color:", e);
                resolve('#f8f9f5'); // Fallback color
            }
        };
        
        img.onerror = function() {
            console.error("Error loading image for color analysis");
            resolve('#f8f9f5'); // Fallback color
        };
        
        // Handle CORS issues with a proxy if needed
        if (imgUrl.startsWith('http:')) {
            imgUrl = imgUrl.replace('http:', 'https:');
        }
        
        img.src = imgUrl;
    });
}

/**
 * Preload an image to ensure it's in the browser cache
 * @param {string} imgUrl - URL of the image to preload
 * @returns {Promise<boolean>} - Whether the preloading was successful
 */
export function preloadImage(imgUrl) {
    return new Promise((resolve) => {
        if (!imgUrl || imgUrl === 'N/A' || imgUrl.includes('placeholder')) {
            resolve(false);
            return;
        }
        
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        
        // Handle CORS issues with a proxy if needed
        if (imgUrl.startsWith('http:')) {
            imgUrl = imgUrl.replace('http:', 'https:');
        }
        
        img.src = imgUrl;
    });
} 