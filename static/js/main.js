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

// User profile dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById("userDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

window.onclick = function(event) {
    const userDropdown = document.getElementById("userDropdown");
    if (!event.target.matches('.user-circle')) {
        if (userDropdown.style.display === "block") {
            userDropdown.style.display = "none";
        }
    }
};

$(document).ready(function() {
    // // Retrieve user info from sessionStorage
    // const username = sessionStorage.getItem('username');
    // const userInitial = sessionStorage.getItem('userInitial');
    // const email = sessionStorage.getItem('userEmail');

    // console.log(username, userInitial, email);

    // // Check if username exists, then update the UI
    // if (username) {
    //     document.querySelector('.username').textContent = `Welcome, ${username}`;
    //     document.querySelector('.user-circle').textContent = userInitial;
    // }

    // if (email) {
    //     document.querySelector('.user-email').textContent = email;
    // }

    // Call the function on page load to ensure layout is correct
    handleResize();

    loadTasks();
});



// Task Functions

// LOAD TASKS (GET Request)
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();

        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Clear existing tasks

        if (tasks.length === 0) {
            document.getElementById('no-tasks-message').style.display = 'block';
        } else {
            document.getElementById('no-tasks-message').style.display = 'none';
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Helper function to create a task element HTML
function createTaskElement(task) {
    const newTask = document.createElement('li');
    newTask.dataset.taskId = task.id;  // Store task ID in a data attribute

    // Mark as completed if it is
    if (task.completed) {
        newTask.classList.add('completed');
    }

    newTask.innerHTML = `
        <div class="circle" onclick="taskCompleted(event)"></div>
        <div class="task-input task-text ${task.completed ? 'completed' : ''}" contenteditable="true" onblur="updateTask(event)">${task.title}</div>
        <img src="../static/img/delete.png" class="delete-button" onclick="deleteTask(event)" alt="Delete"/>
    `;

    return newTask;
}


// CREATE TASK (POST Request)
async function addTask(event) {
    event.preventDefault();

    const input = document.getElementById('newTaskInput');
    if (input.value.trim() === '') {
        alert('Task cannot be empty');
        return; // Ignore empty input
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: input.value, completed: false })
        });

        if (response.ok) {
            const newTask = await response.json();
            document.getElementById('no-tasks-message').style.display = 'none'; // Hide the no tasks message
            const taskElement = createTaskElement(newTask);
            document.getElementById('taskList').appendChild(taskElement);
        }

    } catch (error) {
        console.error('Error adding task:', error);
    }

    input.value = ''; // Clear the input field
}


// UPDATE TASK Text (PUT Request)
async function updateTask(event) {
    const taskElement = event.currentTarget.closest('li');
    const taskId = taskElement.dataset.taskId;  // Get task ID
    const updatedTitle = event.currentTarget.textContent.trim();

    if (updatedTitle === '') {
        alert('Task cannot be empty');
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: updatedTitle })
        });

        if (!response.ok) {
            throw new Error('Failed to update the task');
        }

        console.log('Task updated successfully');
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


// UPDATE TASK Completion (PUT Request)
async function taskCompleted(event) {
    const taskElement = event.currentTarget.closest('li');
    const taskTextElement = taskElement.querySelector('.task-text');
    taskElement.classList.toggle('completed'); // Toggle the completed class
    taskTextElement.classList.toggle('completed');

    const taskId = taskElement.dataset.taskId;  // Get task ID from the data attribute
    const isCompleted = taskElement.classList.contains('completed');

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: isCompleted })
        });

        if (response.ok) {
            console.log(`Task ${taskId} updated successfully.`);
        } else {
            console.error('Error updating task:', await response.text());
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


// DELETE TASK (DELETE Request)
async function deleteTask(event) {
    const taskElement = event.currentTarget.closest('li');
    const taskId = taskElement.dataset.taskId;  // Get task ID

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'        
        });

        if (response.ok) {
            taskElement.style.transition = 'opacity 0.5s ease'; // Smooth removal
            taskElement.style.opacity = '0'; // Fade out
            // Remove the task from the DOM after the fade-out transition
            setTimeout(() => {
                taskElement.remove();
                
                // Show no tasks message if there are no tasks left
                const taskList = document.getElementById('taskList');
                if (taskList.children.length === 0) {
                    document.getElementById('no-tasks-message').style.display = 'block';
                }
            }, 500);

            console.log(`Task ${taskId} deleted successfully.`);
        } else {
            console.error('Error deleting task:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting task:', error);
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




