// NAVIGATION FADE IN AND FADE OUT
let lastScrollTop = 0;
const header = document.getElementById('header');
const navBottom = document.getElementById("nav-bottom");
let scrollTimer = null;
let isScrollingDown = false;

// Initialize the scroll threshold based on device height
const scrollThreshold = window.innerHeight * 0.05; // 5% of viewport height

window.addEventListener("scroll", function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determine if scrolling direction has changed significantly
    if (Math.abs(currentScroll - lastScrollTop) < scrollThreshold) {
        return; // Ignore small scroll movements
    }
    
    // Clear previous timeout
    if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
    }
    
    if (currentScroll > lastScrollTop) {
        // Scrolling DOWN: hide header and footer
        if (!isScrollingDown) {
            isScrollingDown = true;
            header.style.transform = "translateY(-100%)";
            header.style.opacity = "0";
            navBottom.style.transform = "translateY(100%)";
            navBottom.style.opacity = "0";
        }
    } else {
        // Scrolling UP: show header and footer
        if (isScrollingDown) {
            isScrollingDown = false;
            header.style.transform = "translateY(0)";
            header.style.opacity = "1";
            navBottom.style.transform = "translateY(0)";
            navBottom.style.opacity = "1";
        }
    }
    
    // Set a timeout to detect when scrolling stops
    scrollTimer = setTimeout(function() {
        // When scrolling stops, always show the header and footer
        if (currentScroll <= 50) { // Near the top of the page
            header.style.transform = "translateY(0)";
            header.style.opacity = "1";
        }
        
        // Always show footer near the bottom of the page
        const bottomPosition = document.body.scrollHeight - window.innerHeight - 50;
        if (currentScroll >= bottomPosition) {
            navBottom.style.transform = "translateY(0)";
            navBottom.style.opacity = "1";
        }
    }, 200);
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
});

// Add hover effects for footer icons
const footerIcons = document.querySelectorAll("footer img");
footerIcons.forEach(icon => {
    icon.addEventListener("mouseover", function() {
        this.classList.add("fade-in");
    });
    
    icon.addEventListener("mouseout", function() {
        this.classList.remove("fade-in");
    });
});






// API configuration
const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // This is a public TMDB API key for demo purposes
const BASE_URL = 'https://api.themoviedb.org/3'; // Information about the movie
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Image

// DOM Elements
// const header = document.getElementById('header');is already inside the Z
const banner = document.getElementById('banner');
const bannerTitle = document.getElementById('bannerTitle');
const bannerDescription = document.getElementById('bannerDescription');
const trendingMovies = document.getElementById('trendingMovies');
const popularMovies = document.getElementById('popularMovies');
const topRatedMovies = document.getElementById('topRatedMovies');
const playBannerBtn = document.getElementById('playBannerBtn');
const infoBannerBtn = document.getElementById('infoBannerBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const movieDetails = document.getElementById('movieDetails');
const infoContainer = document.getElementById('infoContainer');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');

// Loaders
const trendingLoader = document.getElementById('trendingLoader');
const popularLoader = document.getElementById('popularLoader');
const topRatedLoader = document.getElementById('topRatedLoader');

// State
let featuredMovie = null;

// Initialize the app
function init() {
    // Show loaders
    trendingLoader.style.display = 'block';
    popularLoader.style.display = 'block';
    topRatedLoader.style.display = 'block';
   
    // Fetch movies for different categories
    fetchMovies('trending/movie/week', trendingMovies, trendingLoader)
        .then(() => fetchMovies('movie/popular', popularMovies, popularLoader))
        .then(() => fetchMovies('movie/top_rated', topRatedMovies, topRatedLoader))
        .then(() => {
            // Set a random trending movie as the banner feature
            if (featuredMovie) {
                setBannerMovie(featuredMovie);
            }
        })
        .catch(error => console.error('Error initializing app:', error));
       
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    closeDetailsBtn.addEventListener('click', () => closeMovieDetails());
    infoBannerBtn.addEventListener('click', () => showMovieDetails(featuredMovie));
}

// Fetch movies from API
async function fetchMovies(endpoint, container, loader) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}`);
        const data = await response.json();
        console.log(data)
       
        // Hide loader
        if (loader) loader.style.display = 'none';
       
        // Clear container
        // container.innerHTML = ''; not sure what this do
       
        // Choose a random movie for the banner from trending
        if (endpoint === 'trending/movie/week' && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
            featuredMovie = data.results[randomIndex];
        }
       
        // Render each movie
        data.results.forEach(movie => {
            renderMovieCard(movie, container);
        });
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        if (loader) loader.style.display = 'none';
    }
}

// Render a movie card
function renderMovieCard(movie, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    card.addEventListener('click', () => showMovieDetails(movie));
   
    const rating = Math.round(movie.vote_average * 10) / 10;
   
    // unfortunately, the image is still static adjusted for mobile only if error.
    card.innerHTML = `
        <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://placehold.co/150x225/808080/FFFFFF.png?text=No+Image'}" 
        alt="${movie.title}">

        <div class="rating">${rating}</div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
        </div>
    `;
   
    container.appendChild(card);
}

// Set banner movie
function setBannerMovie(movie) {
    banner.style.backgroundImage = `url(${IMAGE_BASE_URL + movie.backdrop_path})`;
    bannerTitle.textContent = movie.title;
    bannerDescription.textContent = movie.overview;
}

let searchContainerExist = false;

function handleSearch() {
    console.log("Searching!");
    const query = searchInput.value.trim();
    if (!query) return;
   
    // Create a loader for search results
    const searchLoader = document.createElement('div');
    searchLoader.className = 'loader';
    searchLoader.style.display = 'block';

    const oldSearchSection = document.getElementById('searchResultsSection');
    if (oldSearchSection) {
        oldSearchSection.remove();
    }

    // Create a container for search results
    searchResults = document.createElement('div');
    searchResults.className = 'movie-row';
    searchResults.id = 'searchResults';
    searchResults.appendChild(searchLoader);
   
    // Create a section for search results
    searchSection = document.createElement('section');
    searchSection.className = 'categories';
    searchSection.id = 'searchResultsSection';
    searchSection.innerHTML = `<h2 class="category-title">Search Results for "${query}"</h2>`;
    searchSection.appendChild(searchResults);
   
    // Insert search results after the banner
    const categoriesSection = document.querySelector('.categories');
    categoriesSection.parentNode.insertBefore(searchSection, categoriesSection);
   
    fetchSearchResults(searchSection, searchLoader, query);
}

function fetchSearchResults(searchSection, searchLoader, query){
    fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            searchLoader.style.display = 'none';
           
            if (data.results.length === 0) {
                searchResults.innerHTML = '<p style="color: #aaa; padding: 20px;">No results found.</p>';
                return;
            }
           
            data.results.forEach(movie => {
                renderMovieCard(movie, searchResults);
            });
        })
        .catch(error => {
            console.error('Error searching movies:', error);
            searchLoader.style.display = 'none';
            searchResults.innerHTML = '<p style="color: #aaa; padding: 20px;">Error searching movies. Please try again.</p>';
        });
       
    // Clear search input
    searchInput.value = '';
   
    // Scroll to search results
    searchSection.scrollIntoView({ behavior: 'smooth' });
}

// Show movie details page
function showMovieDetails(movie) {
    if (!movie){
        console.error("No movie data are provided to showMovieDetails");
        return;  
    } 

    // Fetch additional movie details if needed
    fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(movieData => {
            // Create movie details HTML
            infoContainer.innerHTML = `
            
                <h1>${movie.title}</h1>
                <div class="movie-card">
                    <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://placehold.co/150x225/808080/FFFFFF.png?text=No+Image'}" alt="${movie.title}">
                    <div class="ratings">
                        <p>IMDb: ${movie.vote_average}/10 (${movie.vote_count} votes)</p>
                        <p>Release Date: ${movie.release_date || 'N/A'}</p>
                        <p>Genre: ${movieData.genres ? movieData.genres.map(g => g.name).join(', ') : 'N/A'}</p>
                        <p>Runtime: ${movieData.runtime ? `${movieData.runtime} minutes` : 'N/A'}</p>
                        
                        <div class="action-buttons">
                            <button class="play-btn-info" id="detailsPlayBtn">Play</button>
                            <button class="watchlist-btn-info">Add to Watchlist</button>
                        </div>
                    </div>
                </div>
                <section class="synopsis">
                    <h2>Synopsis</h2>
                    <p>${movie.overview || 'No synopsis available.'}</p>
                </section>
            `;
            
            // Add event listener to play button
            const detailsPlayBtn = document.getElementById('detailsPlayBtn');
            if (detailsPlayBtn) {
                detailsPlayBtn.addEventListener('click', () => {
                    closeMovieDetails();
                    playMovie(movie);
                });
            }
            
            // Show movie details
            movieDetails.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            // Show basic details if fetch fails
            infoContainer.innerHTML = `
                <h1>${movie.title}</h1>
                <div class="movie-card">
                    <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://placehold.co/150x225/808080/FFFFFF.png?text=No+Image'}" alt="${movie.title}">
                    <div class="ratings">
                        <p>IMDb: ${movie.vote_average}/10 (${movie.vote_count} votes)</p>
                        
                        <div class="action-buttons">
                            <button class="play-btn" id="detailsPlayBtn">Play</button>
                            <button class="watchlist-btn">Add to Watchlist</button>
                        </div>
                    </div>
                </div>
                <section class="synopsis">
                    <h2>Synopsis</h2>
                    <p>${movie.overview || 'No synopsis available.'}</p>
                </section>
            `;
            
            // Add event listener to play button
            const detailsPlayBtn = document.getElementById('detailsPlayBtn');
            if (detailsPlayBtn) {
                detailsPlayBtn.addEventListener('click', () => {
                    closeMovieDetails();
                    playMovie(movie);
                });
            }
            
            // Show movie details
            movieDetafils.style.display = 'block';
        });
}

// Close movie details
function closeMovieDetails() {
    console.log("Close info");
    movieDetails.style.display = 'none';
}

// Add movie to local storage, get watchlist, add movie, set watchlist back to normal.
function addMovieToWatchlist(movie){
    let watchlist = json.parse(localStorage.getItem('watchlist')) || [];
    watchlist.push(movie);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function getWatchlist(){
    return JSON.parse(localStorage.getItem('watchlist')) || [];
}

function renderWatchList(){
    let watchlistContainer = document.getElementById("watchlistContainer");
    let watchlist = getWatchlist();
    watchlist.forEach((movie) =>{
        renderMovieCard(movie, watchListContainer)
    })
    
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);