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






