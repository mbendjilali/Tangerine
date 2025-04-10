# Tangerine - Movie Tracker

Tangerine is a modern, browser-based application designed to help you manage your movie watchlist and track the movies you've watched. With a sleek interface and powerful features, Tangerine makes it easy to organize your movie collection and discover new films to enjoy.

![Tangerine Screenshot](screenshot.png)

## Features

- **Search and Add Movies**: Use the OMDB API to search for movies and add them to your watchlist.
- **To-Watch List**: Keep track of movies you want to watch with sorting and filtering options.
- **Watched List**: Maintain a list of movies you've already watched, complete with ratings.
- **Rating System**: Rate movies you've watched on a scale of 1-10.
- **Detailed Movie Information**: View comprehensive details about each movie, including plot, cast, and more.
- **Import/Export**: Save and share your movie data through JSON import/export.
- **Random Movie Picker**: Use the "Pick a Fruit" feature to randomly select a movie from your basket.

## Technologies Used

- HTML5, CSS3, and JavaScript
- OMDB API for movie data
- LocalStorage for data persistence
- Font Awesome for icons

## How to Use

1. **Search for Movies**: Enter a movie title in the search box and click "Search."
2. **Add to Watchlist**: Click the "Add to Watchlist" button on search results.
3. **View Movie Details**: Click on any movie card to see detailed information.
4. **Mark as Watched**: Click the checkmark icon or button to mark a movie as watched.
5. **Rate Movies**: When marking a movie as watched, you can assign it a rating.
6. **Sort and Filter**: Use the dropdown menus to sort and filter your lists.
7. **Import/Export**: Use the buttons at the bottom to save or load your movie data.

## Getting Started

To run the application locally:

1. Clone this repository or download the files.
2. Open the project folder in a terminal.
3. Start a simple HTTP server:
   - Using Python 3: `python -m http.server 8000`
   - Using Python 2: `python -m SimpleHTTPServer 8000`
4. Open your browser and navigate to `http://localhost:8000`.

## OMDB API

This application uses the OMDB API to retrieve movie information. The API has a limit of 1,000 requests per day.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OMDB API](http://www.omdbapi.com/) for providing the movie data
- [Font Awesome](https://fontawesome.com/) for the icons
- Inspired by Apple's design principles 