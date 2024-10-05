// TODO: Add updateTask() function to save task updates

// Document ready function
$(function () {
    // Make it so you can hit Enter to create a new task in addition to clicking the Add button
    $('#input-container').on( "submit", function(event) {
        event.preventDefault();

        // Make add button become bright for a sec
        const addButton = $('#addButton');
        addButton.css('filter', 'brightness(1.3)');
        // Revert the filter back to normal after
        setTimeout(function() {
            addButton.css('filter', 'brightness(1)');
        }, 200);

        addTask();
    });
});

// Show top navbar when you scroll down
window.onscroll = function() {
    const navbar = document.querySelector('.top-nav');
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        navbar.classList.add('scrolled'); // Add the scrolled class
    } else {
        navbar.classList.remove('scrolled'); // Remove the scrolled class
    }
};

// Function to automatically collapse username on small screens
function handleResize() {
    const username = document.querySelector('.username');

    // Hide username if screen is too small
    if (window.innerWidth <= 600) { 
        username.style.display = 'none';
    } else {
        username.style.display = 'flex';
    }
}

// Add an event listener for window resize
window.addEventListener('resize', handleResize);

function toggleLightDarkMode() {
    const lightDarkIcon = document.getElementById('lightdarkIcon');
    const body = document.body;
    
    // Toggle light/dark mode
    body.classList.toggle('dark-mode');
    
    // Swap icon colors
    if (lightDarkIcon.src.includes('lightdark-icon-white.png')) {
        lightDarkIcon.src = '../static/img/lightdark-icon-black.png';
    } else {
        lightDarkIcon.src = '../static/img/lightdark-icon-white.png';
    }
}


// Task List Functions

function addTask() {
    const input = document.getElementById('newTaskInput');
    const taskList = document.getElementById('taskList');

    if (input.value.trim() === '') return; // Ignore empty input

    const newTask = document.createElement('li');
    newTask.innerHTML = `<div class="circle" onclick="taskCompleted(event)"></div>
                        <div class="task-input task-text" contenteditable="true" onchange="updateTask(event)">${input.value}</div>
                        <img src="../static/img/delete.png" class="delete-button" onclick="deleteTask(event)" alt="Delete"/>`;
    taskList.appendChild(newTask);

    input.value = ''; // Clear the input field
}

function deleteTask(event) {
    const listItem = event.currentTarget.closest('li');
    listItem.style.transition = 'opacity 0.5s ease'; // Add a transition for smooth removal
    listItem.style.opacity = '0'; // Fade out

    // Remove the item after the fade-out transition
    setTimeout(() => {
        listItem.remove();
    }, 500); // Match the duration with the CSS transition
}



function taskCompleted(event) {
    const listItem = event.currentTarget.closest('li');
    listItem.classList.toggle('completed'); // Toggle the completed class

    const taskInput = listItem.querySelector('.task-text');

    if (taskInput) {
        taskInput.classList.toggle('completed'); // Toggle the completed class for the input
    }

    // Trigger confetti effect if task completed
    if (listItem.classList.contains('completed')) {
        createConfetti();
    }
}


function createConfetti() {
    const numConfetti = 900; // Number of confetti pieces
    const colors = [
        '#FF5733', // Red
        '#FFC300', // Yellow
        '#DAF7A6', // Light Green
        '#33FF57', // Green
        '#337FFF', // Blue
        '#FF33A1', // Pink
        '#FF8C33', // Orange
        '#8D33FF'  // Purple
    ];

    for (let i = 0; i < numConfetti; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Randomize size
        const sizeClass = Math.random() > 0.5 ? 'confetti-small' : Math.random() > 0.5 ? 'confetti-large' : '';
        if (sizeClass) {
            confetti.classList.add(sizeClass);
        }

        // Randomize horizontal position
        confetti.style.left = `${Math.random() * 100}vw`; // Full width of viewport
        confetti.style.top = `-20px`; // Start from the top

        // Randomize color
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Add a random delay for each piece
        confetti.style.animationDelay = `${Math.random() * 2}s`;

        document.body.appendChild(confetti);

        // Remove the confetti after the animation ends
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}


// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// User profile dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById("userDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

$(document).ready(function() {
    // Retrieve user info from sessionStorage
    const username = sessionStorage.getItem('username');
    const userInitial = sessionStorage.getItem('userInitial');
    const email = sessionStorage.getItem('userEmail');

    console.log(username, userInitial, email);

    // Check if username exists, then update the UI
    if (username) {
        document.querySelector('.username').textContent = `Welcome, ${username}`;
        document.querySelector('.user-circle').textContent = userInitial;
    }

    if (email) {
        document.querySelector('.user-email').textContent = email;
    }

    // Call the function on page load to ensure layout is correct
    handleResize();
});

window.onclick = function(event) {
    const userDropdown = document.getElementById("userDropdown");
    if (!event.target.matches('.user-circle')) {
        if (userDropdown.style.display === "block") {
            userDropdown.style.display = "none";
        }
    }
};
