// Content
/*
1. NAVIGATION JS
2. GET AND RENDER MOVIE CONFIGURATION
3. SEARCH BAR CONFIGURATION
4. MOVIE DETAILS CONFIGURATION
5. WATCHLIST EDITOR
*/

// NAVIGATION JS
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




// MOVIE CONFIGURATION

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
    closeDetailsBtn.addEventListener('click', () => closeMovieDetails());
    if (window.location.pathname.includes('watchlist.html')) {
        console.log("On watchlist page");
        renderWatchList();
        return
    } else if(window.location.pathname.includes('intro.html')){
        console.log("On intro page");
        return;
    }
    

    

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
function renderMovieCard(movie, container, isWatchlistPage = false) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // We'll still add the click event to show details
    card.addEventListener('click', () => showMovieDetails(movie));
   
    const rating = Math.round(movie.vote_average * 10) / 10;
   
    if (!isWatchlistPage) {
        // Standard movie card
        card.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://placehold.co/150x225/808080/FFFFFF.png?text=No+Image'}" 
            alt="${movie.title}">
            <div class="rating">${rating}</div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
            </div>
        `;
    } else {
        // Watchlist card with remove button
        card.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://placehold.co/150x225/808080/FFFFFF.png?text=No+Image'}" 
            alt="${movie.title}">
            <div class="rating">${rating}</div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                <button class="remove-btn">Remove</button>
            </div>
        `;
        
        // Add event listener to the remove button, to make sure the DOM is rendered first
        setTimeout(() => {
            const removeBtn = card.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent movie details from showing
                    
                    // Remove from watchlist
                    removeFromWatchlist(movie.id);
                    
                    // Remove card with animation
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.remove();
                        
                        // Check if watchlist is now empty
                        if (getWatchlist().length === 0) {
                            const watchlistContainer = document.getElementById("watchlistContainer");
                            if (watchlistContainer) {
                                watchlistContainer.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px; grid-column: span 2;">Your watchlist is empty.</p>';
                            }
                        }
                    }, 300);
                });
            }
        }, 0);
    }
   
    container.appendChild(card);
}

// Set banner movie
function setBannerMovie(movie) {
    banner.style.backgroundImage = `url(${IMAGE_BASE_URL + movie.backdrop_path})`;
    bannerTitle.textContent = movie.title;
    bannerDescription.textContent = movie.overview;
}

// SEARCH BAR CONFIGURATION
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

// MOVIE DETAILS CONFIGURATION
// Show movie details page
function showMovieDetails(movie) {
    if (!movie){
        console.error("No movie data are provided to showMovieDetails");
        return;  
    } 

    // Check if movie is in watchlist
    const watchlist = getWatchlist();
    const isInWatchlist = watchlist.some(item => item.id === movie.id);

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
                            <button class="watchlist-btn-info" id="toggleWatchlistBtn">
                                ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            </button>
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
                    // Play movie functionality would go here. not usable as of currently
                });
            }

            // Style the watchlist button based on current status
            const toggleWatchlistBtn = document.getElementById('toggleWatchlistBtn');
            if (toggleWatchlistBtn) {
                // Set initial button style based on watchlist status
                if (isInWatchlist) {
                    toggleWatchlistBtn.style.backgroundColor = '#333';
                    toggleWatchlistBtn.style.color = '#fff';
                    toggleWatchlistBtn.style.fontSize = '12px';
                }

                toggleWatchlistBtn.addEventListener('click', () => {
                    toggleMovieInWatchlist(movie, toggleWatchlistBtn);
                });
            }
            
            // Show movie details
            movieDetails.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            // Show basic details if fetch fails with similar watchlist functionality
            const isInWatchlist = watchlist.some(item => item.id === movie.id);
            
            infoContainer.innerHTML = `
                <h1>${movie.title}</h1>
                <div class="movie-card">
                    <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://placehold.co/150x225/808080/FFFFFF.png?text=No+Image'}" alt="${movie.title}">
                    <div class="ratings">
                        <p>IMDb: ${movie.vote_average}/10 (${movie.vote_count} votes)</p>
                        
                        <div class="action-buttons">
                            <button class="play-btn-info" id="detailsPlayBtn">Play</button>
                            <button class="watchlist-btn-info" id="toggleWatchlistBtn">
                                ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            </button>
                        </div>
                    </div>
                </div>
                <section class="synopsis">
                    <h2>Synopsis</h2>
                    <p>${movie.overview || 'No synopsis available.'}</p>
                </section>
            `;
            
            // Add event listeners (same as above)
            const detailsPlayBtn = document.getElementById('detailsPlayBtn');
            if (detailsPlayBtn) {
                detailsPlayBtn.addEventListener('click', () => {
                    // Play functionality
                });
            }
            
            const toggleWatchlistBtn = document.getElementById('toggleWatchlistBtn');
            if (toggleWatchlistBtn) {
                if (isInWatchlist) {
                    toggleWatchlistBtn.style.backgroundColor = '#333';
                    toggleWatchlistBtn.style.color = '#fff';
                    toggleWatchlistBtn.style.fontSize = '12px';
                }
                
                toggleWatchlistBtn.addEventListener('click', () => {
                    toggleMovieInWatchlist(movie, toggleWatchlistBtn);
                });
            }
            
            movieDetails.style.display = 'block';
        });
}
// Close movie details
function closeMovieDetails() {
    console.log("Close info");
    movieDetails.style.display = 'none';
}
// Toggle Watchlist button
function toggleMovieInWatchlist(movie, button) {
    if (!movie || !movie.id) {
        console.error("Invalid movie object for watchlist toggle");
        return;
    }
    
    let watchlist = getWatchlist();
    const movieIndex = watchlist.findIndex(item => item.id === movie.id);
    
    if (movieIndex === -1) {
        // Movie not in watchlist - add it
        addToWatchlist(movie);
        
        // Update button
        button.textContent = 'Remove from Watchlist';
        button.style.backgroundColor = '#333';
        button.style.fontSize = '12px';
        
        console.log(`${movie.title} added to watchlist`);
    } else {
        removeFromWatchlist(movie.id);

        // Rerender watchlist
        renderWatchList();
        // Update button
        button.textContent = 'Add to Watchlist';
        button.style.backgroundColor = 'var(--primary-color)';
        button.style.fontSize = '16px';
        
        console.log(`${movie.title} removed from watchlist`);
    }
}



// WATCHLIST EDITOR
// Add movie to local storage, get watchlist, add movie, set watchlist back to normal.
function addToWatchlist(movie){
    if (movie && movie.title && movie.poster_path) {  // Add validation to check if movie is valid
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        
        // Check if the movie is already in the watchlist (optional, to prevent duplicates)
        if (!watchlist.some(existingMovie => existingMovie.title === movie.title)) {
            watchlist.push(movie);
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            console.log(`${movie.title} added to the watchlist!`);
        } else {
            console.log(`${movie.title} is already in the watchlist.`);
        }
    } else {
        console.error("Invalid movie object:", movie);  // Log an error if movie is not valid
    }
}
// Function to remove a movie from watchlist by ID
function removeFromWatchlist(movieId) {
    let watchlist = getWatchlist();
    const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    console.log(`Movie ID ${movieId} removed from watchlist`);
}

function getWatchlist(){
    return JSON.parse(localStorage.getItem('watchlist')) || [];
}

function renderWatchList() {
    console.log("WATCHLIST OPENED");
    const watchlistContainer = document.getElementById("watchlistContainer");
    
    // Clear the container first
    if (watchlistContainer) {
        watchlistContainer.innerHTML = '';
        
        const watchlist = getWatchlist();
        console.log("Watchlist items:", watchlist.length);
        
        if (watchlist.length === 0) {
            watchlistContainer.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px; grid-column: span 2;">Your watchlist is empty.</p>';
        } else {
            // Add CSS for smooth removal animation
            const style = document.createElement('style');
            style.textContent = `
                .movie-card {
                    transition: opacity 0.3s ease;
                }
            `;
            document.head.appendChild(style);
            
            // Add the movies to the grid
            watchlist.forEach((movie) => {
                renderMovieCard(movie, watchlistContainer, true); // Pass true to indicate watchlist page
            });
        }
    } else {
        console.error("Watchlist container not found!");
    }
}
// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// javascript function for the AboutUs page
function showAboutUs() {
    // Create the about us overlay if it doesn't exist
    if (!document.getElementById('aboutUsOverlay')) {
        // Create the main container
        const aboutUsOverlay = document.createElement('div');
        aboutUsOverlay.id = 'aboutUsOverlay';
        
        // Create the close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeAboutUs;
        
        // Create the content container
        const aboutUsContent = document.createElement('div');
        aboutUsContent.className = 'info-container';
        
        // Create the about us content
        aboutUsContent.innerHTML = `
            <h1>About MovieFlix</h1>
            
            <section>
                <h2>Our Mission</h2>
                <p>At MovieFlix, we believe everyone deserves access to exceptional entertainment. Our mission is to provide a seamless streaming experience with a vast library of movies across all genres, from blockbuster hits to indie gems.</p>
                <p>We're committed to leveraging cutting-edge technology to deliver the highest quality streaming service, ensuring you never miss a moment of your favorite films.</p>
            </section>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <span>📚</span>
                    </div>
                    <div class="feature-content">
                        <h3>Vast Library</h3>
                        <p>Access thousands of movies across every genre imaginable, from action-packed blockbusters to thought-provoking documentaries.</p>
                    </div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <span>✨</span>
                    </div>
                    <div class="feature-content">
                        <h3>Premium Quality</h3>
                        <p>Enjoy crystal-clear HD and 4K streaming with adaptive quality that adjusts to your internet connection.</p>
                    </div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <span>📱</span>
                    </div>
                    <div class="feature-content">
                        <h3>Watch Anywhere</h3>
                        <p>Stream on your TV, computer, tablet, or smartphone—your membership travels with you.</p>
                    </div>
                </div>
            </div>
            
            <section style="text-align: center;">
                <h2>Meet Our Team</h2>
                <div class="team-grid">
                    <div class="team-member">
                        <div class="team-photo"></div>
                        <h3 class="team-name">KEVIN JOHN DOWD</h3>
                        <p class="team-role">Founder & CEO</p>
                    </div>
                    <div class="team-member">
                        <div class="team-photo"></div>
                        <h3 class="team-name">SANTOSH ADHIKARI</h3>
                        <p class="team-role">Chief Technology Officer</p>
                    </div>
                    <div class="team-member">
                        <div class="team-photo"></div>
                        <h3 class="team-name">JOHN ALLYSEN</h3>
                        <p class="team-role">Content Director</p>
                    </div>
                    <div class="team-member">
                        <div class="team-photo"></div>
                        <h3 class="team-name">VISHESH GROVER</h3>
                        <p class="team-role">UX Designer</p>
                    </div>
                </div>
            </section>
            
            <section style="text-align: center;">
                <h2>Join MovieFlix Today</h2>
                <p>Start streaming today and discover why millions of movie enthusiasts choose MovieFlix for their entertainment needs.</p>
                <button class="cta-button">Start Your Free Trial</button>
            </section>
        `;
        
        // Append elements to the DOM
        aboutUsOverlay.appendChild(closeBtn);
        aboutUsOverlay.appendChild(aboutUsContent);
        document.body.appendChild(aboutUsOverlay);
    } else {
        // Show the existing overlay if it's already created
        document.getElementById('aboutUsOverlay').style.display = 'block';
    }
    
    // Disable body scrolling when overlay is shown
    document.body.style.overflow = 'hidden';
}

// Function to close About Us overlay
function closeAboutUs() {
    const aboutUsOverlay = document.getElementById('aboutUsOverlay');
    if (aboutUsOverlay) {
        aboutUsOverlay.style.display = 'none';
    }
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
}

// Initialize About Us functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the About Us link
    const aboutLink = document.querySelector('.about-link');
    if (aboutLink) {
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAboutUs();
        });
    };
});

function transitionTo(url){
    const overlay = document.querySelector(".transition-overlay");
    overlay.style.animation = 'slideIn 0.1s ease-in-out';
    setTimeout(()=>{
        window.location.href = url;
    }, 500);
}