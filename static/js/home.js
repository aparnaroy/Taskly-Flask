// Show top navbar when you scroll down
window.onscroll = function() {
    const navbar = document.querySelector('.top-nav');
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        navbar.classList.add('scrolled'); // Add the scrolled class
    } else {
        navbar.classList.remove('scrolled'); // Remove the scrolled class
    }
};

function toggleLightDarkModeHome() {
    const lightDarkIcon = document.getElementById('lightdarkIcon');
    const screenshot = document.getElementById('screenshot');
    const body = document.body;
    
    // Toggle light/dark mode
    body.classList.toggle('dark-mode');
    
    if (lightDarkIcon.src.includes('lightdark-icon-white.png')) {
        lightDarkIcon.src = '../static/img/lightdark-icon-black.png';
        screenshot.src = '../static/img/screenshot.png';
    } else {
        lightDarkIcon.src = '../static/img/lightdark-icon-white.png';
        screenshot.src = '../static/img/screenshot-dark.png';
    }
}