// Mistral API Service
// Handles all interactions with the Mistral AI API for movie suggestions

const MISTRAL_API_KEY = 'E0OgKnQwjlDMJ1pttvxV7jb27PcEoIZW';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Get movie suggestions from Mistral API based on user's movie preferences
 * @param {Array} movieSample - Sample of user's movies to base suggestions on
 * @param {Array} existingMovieTitles - Titles to exclude from suggestions
 * @param {number} count - Number of suggestions to request
 * @returns {Promise<Array>} - Array of suggestion objects
 */
export async function getSuggestions(movieSample, existingMovieTitles, count = 5) {
    try {
        // Create the prompt for Mistral with improved instructions
        const prompt = `Based on these movies: ${JSON.stringify(movieSample)}, recommend EXACTLY ${count} different movies that are not in this list. Favor niche movies, classics and diverse genre films.

IMPORTANT: DO NOT suggest any of these titles: ${existingMovieTitles.join(', ')}. Find creative and varied suggestions that match the user's taste but introduce them to new films.

Format your response as a JSON array with objects containing title, year, and a brief reason for the recommendation. Each movie should be different from those in the input list and from each other.`;
        
        // Call Mistral API with higher temperature for more variety
        const response = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-tiny",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.9 // Higher temperature for more variety
            })
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the suggestions from Mistral's response
        const content = data.choices[0].message.content;
        
        // Parse the JSON from the response
        return parseResponseJson(content);
    } catch (error) {
        console.error('Error getting suggestions from Mistral API:', error);
        throw error;
    }
}

/**
 * Get a single replacement suggestion
 * @param {Array} movieSample - Sample of user's movies to base suggestions on
 * @param {Array} existingMovieTitles - Titles to exclude from suggestions
 * @returns {Promise<Object>} - A single suggestion object
 */
export async function getReplacementSuggestion(movieSample, existingMovieTitles) {
    try {
        // Create the prompt for Mistral for a single suggestion
        const prompt = `Based on these movies: ${JSON.stringify(movieSample)}, recommend ONE movie that is not in this list. Favor niche movies, classics and diverse genre films.

IMPORTANT: DO NOT suggest any of these titles: ${existingMovieTitles.join(', ')}. Find a creative suggestion that matches the user's taste but introduces them to a new film.

Format your response as a JSON object containing title, year, and a brief reason for the recommendation.`;
        
        // Call Mistral API
        const response = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-tiny",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.95 // Even higher temperature for more variety
            })
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse the JSON from the response (single object)
        const parsedResult = parseResponseJson(content);
        return Array.isArray(parsedResult) ? parsedResult[0] : parsedResult;
        
    } catch (error) {
        console.error('Error getting replacement suggestion:', error);
        throw error;
    }
}

/**
 * Helper function to parse JSON from Mistral response
 * @param {string} content - The response content from Mistral API
 * @returns {Array|Object} - Parsed suggestions as array or object
 */
function parseResponseJson(content) {
    try {
        // Try to find JSON in the response
        const jsonMatch = content.match(/\[.*\]|\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('No JSON found in response');
        }
    } catch (error) {
        console.error('Failed to parse Mistral response as JSON:', error);
        
        // Fallback: Extract information using regex
        // For array of suggestions
        const suggestions = [];
        const movieMatches = content.matchAll(/["']?title["']?\s*:\s*["'](.+?)["'].*?["']?year["']?\s*:\s*["']?(\d{4})["']?.*?["']?reason["']?\s*:\s*["'](.+?)["']/gs);
        
        for (const match of movieMatches) {
            if (match && match.length >= 4) {
                suggestions.push({
                    title: match[1],
                    year: match[2],
                    reason: match[3]
                });
            }
        }
        
        if (suggestions.length > 0) {
            return suggestions;
        }
        
        // For single suggestion
        const titleMatch = content.match(/title["']?\s*:\s*["'](.+?)["']/);
        const yearMatch = content.match(/year["']?\s*:\s*["']?(\d{4})["']?/);
        const reasonMatch = content.match(/reason["']?\s*:\s*["'](.+?)["']/);
        
        if (titleMatch && yearMatch) {
            return {
                title: titleMatch[1],
                year: yearMatch[1],
                reason: reasonMatch ? reasonMatch[1] : 'Recommended based on your taste'
            };
        }
        
        throw new Error('Could not extract movie suggestion(s) from response');
    }
} 