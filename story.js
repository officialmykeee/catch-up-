// story.js

// --- Global State and Constants ---
let currentStoryIndex = 0;
let currentStoriesData = [];
let progressTimers = [];
let animationFrameId = null;
const STORY_DURATION = 7000; // 7 seconds per slide
const closeThreshold = 50;   // Drag distance to close

// --- DOM Elements ---
const storyViewerOverlay = document.getElementById('storyViewerOverlay');
const storyPageWrapper = document.getElementById('storyPageWrapper');
const progressContainer = document.getElementById('storyProgressContainer');
const navAreaLeft = document.getElementById('navAreaLeft');
const navAreaRight = document.getElementById('navAreaRight');
const storyCon = document.getElementById('storyCon');
const headerUsername = document.getElementById('storyHeaderUsername');
const headerTimestamp = document.getElementById('storyHeaderTimestamp');
const storyCloseBtn = document.querySelector('.story-close-btn');


// --- Utility Functions ---

/**
 * Stops all progress bar animations and clears timers.
 */
function stopStoryProgress() {
    progressTimers.forEach(timer => clearTimeout(timer));
    progressTimers = [];
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    document.querySelectorAll('.progress-fill').forEach(fill => {
        fill.style.animation = 'none';
        fill.offsetHeight; // Reflow trick
    });
}

/**
 * Starts the progress bar animation for the current story slide.
 */
function startStoryProgress() {
    stopStoryProgress();

    const progressFill = progressContainer.children[currentStoryIndex]?.querySelector('.progress-fill');
    if (!progressFill) return;

    const startTime = performance.now();

    // Fill previous bars completely
    for (let i = 0; i < currentStoryIndex; i++) {
        progressContainer.children[i].querySelector('.progress-fill').style.width = '100%';
    }

    // Set up the current bar
    progressFill.style.width = '0%';
    
    // Simple animation loop for smooth progress
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / STORY_DURATION, 1);
        progressFill.style.width = `${progress * 100}%`;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    animationFrameId = requestAnimationFrame(animate);

    // Set a timer to move to the next slide when the duration is complete
    const timeout = setTimeout(showNextStory, STORY_DURATION);
    progressTimers.push(timeout);
}


/**
 * Moves the story carousel to a specific index.
 * @param {number} newIndex - The target index of the story slide.
 */
function navigateToStory(newIndex) {
    if (newIndex < 0 || newIndex >= currentStoriesData.length) {
        return;
    }

    // Check "Your story" specific back navigation rule
    if (currentStoriesData[0].isOwnStory && newIndex < currentStoryIndex && newIndex === 0) {
        // If navigating from story 1 -> 0, and it's your own story, DONT allow invisible back nav.
        return; 
    }

    // Update the progress bar for the story we are leaving
    const prevFill = progressContainer.children[currentStoryIndex]?.querySelector('.progress-fill');
    if (prevFill) {
        prevFill.style.width = newIndex > currentStoryIndex ? '100%' : '0%';
        prevFill.style.transition = 'width 0.1s ease'; // Quick transition
    }

    currentStoryIndex = newIndex;
    
    // Move the slide wrapper
    const offset = -currentStoryIndex * 100;
    storyPageWrapper.style.transform = `translateX(${offset}%)`;

    // Update timestamp
    headerTimestamp.textContent = currentStoriesData[currentStoryIndex].timestamp || '';

    // Reset transition after navigation for the current bar
    setTimeout(() => {
        startStoryProgress();
    }, 300); // Wait for slide transition to finish
}

/**
 * Navigates to the next slide or closes the viewer.
 */
function showNextStory() {
    if (currentStoryIndex < currentStoriesData.length - 1) {
        navigateToStory(currentStoryIndex + 1);
    } else {
        // Last story in the set finishes
        closeStoryViewer();
    }
}

/**
 * Navigates to the previous slide.
 */
function showPrevStory() {
    if (currentStoryIndex > 0) {
        navigateToStory(currentStoryIndex - 1);
    } else {
        // First story in the set finishes/is clicked
        // You might want to close here if you were viewing a multi-user story, 
        // but for now, we follow the "no back" rule for index 0 of "Your Story"
    }
}

/**
 * Closes the story viewer and cleans up.
 */
function closeStoryViewer() {
    stopStoryProgress();
    console.log('Closing story viewer');

    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';
    
    // Remove the Escape key listener
    document.removeEventListener('keydown', handleEscape);
    
    // Reset state
    currentStoryIndex = 0;
    currentStoriesData = [];
    storyPageWrapper.innerHTML = '';
    progressContainer.innerHTML = '';
}

// Function to handle the Escape key press
const handleEscape = (e) => {
    if (e.key === 'Escape') {
        closeStoryViewer();
    }
};

// --- DOM Manipulation and Event Listeners ---

/**
 * Builds the HTML content for the viewer based on the story data.
 * @param {Array<Object>} stories - Array of story content objects.
 */
function buildStoryViewer(stories) {
    storyPageWrapper.innerHTML = '';
    progressContainer.innerHTML = '';
    currentStoriesData = stories;
    
    // 1. Build Progress Bars
    stories.forEach(() => {
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.innerHTML = '<div class="progress-fill"></div>';
        progressContainer.appendChild(bar);
    });

    // 2. Build Story Pages (Slides)
    stories.forEach((story, index) => {
        const page = document.createElement('div');
        page.className = 'story-page';

        // Blur Background Logic
        const isTall = story.naturalHeight > story.naturalWidth * 1.3;
        if (!isTall) {
            const blurBg = document.createElement('div');
            blurBg.className = 'story-blur-bg';
            blurBg.style.backgroundImage = `url(${story.contentUrl})`;
            page.appendChild(blurBg);
        }

        // Story Image/Content
        const img = document.createElement('img');
        img.className = 'story-viewer-content';
        img.src = story.contentUrl;
        img.style.objectFit = isTall ? 'cover' : 'contain';
        img.onload = () => {
            // Re-check object fit in case dimensions changed
            img.style.objectFit = img.naturalHeight > img.naturalWidth * 1.3 ? 'cover' : 'contain';
        }

        page.appendChild(img);
        storyPageWrapper.appendChild(page);
    });
}

/**
 * Initializes the story viewer with story data.
 * @param {string} username - The owner of the story.
 * @param {string} avatarUrl - The avatar URL of the owner.
 * @param {boolean} isOwnStory - True if the user is viewing their own story.
 * @param {Array<Object>} stories - Array of story content objects.
 */
window.openStoryViewer = function (username, avatarUrl, isOwnStory, stories) {
    if (!stories || stories.length === 0) return;

    // Enhance stories data with the navigation flag
    currentStoriesData = stories.map(s => ({ ...s, isOwnStory }));

    // Set header info
    headerUsername.textContent = username;
    // (Avatar URL update left as an exercise for the user, as the HTML structure is simple)

    // Build the slides and progress bars
    buildStoryViewer(currentStoriesData);
    
    // Show overlay and start at the first story
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    currentStoryIndex = 0;
    navigateToStory(0); // This will also start the timer

    // Attach listeners
    navAreaRight.onclick = showNextStory;
    navAreaLeft.onclick = showPrevStory;
    storyCloseBtn.onclick = closeStoryViewer;
    storyViewerOverlay.onclick = (e) => {
        if (e.target === storyViewerOverlay) closeStoryViewer();
    };
    document.addEventListener('keydown', handleEscape);
};

// --- Drag-to-Close Implementation (Kept similar to your original) ---

let startY = 0;
let isDragging = false;

// Attach listeners to the main story content container (`storyCon`)
storyCon.onmousedown = (e) => {
    // Only allow drag-to-close from the center tap area (where nav areas don't overlap)
    const rect = storyCon.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.4 && x < rect.width * 0.6) {
        startY = e.clientY;
        isDragging = true;
        stopStoryProgress();
    }
};

storyCon.onmousemove = (e) => {
    if (!isDragging) return;
    const dragDistance = e.clientY - startY;
    if (dragDistance > closeThreshold) {
        closeStoryViewer();
    } else if (dragDistance > 0) {
        // Slight vertical move to show "pull" effect
        const scale = 1 - Math.min(dragDistance / 200, 0.05);
        storyCon.style.transform = `translateY(${dragDistance}px) scale(${scale})`;
    }
};

storyCon.onmouseup = () => {
    if (isDragging) {
        storyCon.style.transform = '';
        startStoryProgress(); // Restart on release if not closed
    }
    isDragging = false;
};

// Touch drag-to-close logic (simplified and attached to storyCon)
storyCon.ontouchstart = (e) => {
    if (e.touches.length === 1) {
        const rect = storyCon.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        if (x > rect.width * 0.4 && x < rect.width * 0.6) {
            startY = e.touches[0].clientY;
            isDragging = true;
            stopStoryProgress();
        }
    }
};

storyCon.ontouchmove = (e) => {
    if (!isDragging || e.touches.length > 1) return;
    const dragDistance = e.touches[0].clientY - startY;
    if (dragDistance > closeThreshold) {
        closeStoryViewer();
    } else if (dragDistance > 0) {
        const scale = 1 - Math.min(dragDistance / 200, 0.05);
        storyCon.style.transform = `translateY(${dragDistance}px) scale(${scale})`;
    }
};

storyCon.ontouchend = () => {
    if (isDragging) {
        storyCon.style.transform = '';
        startStoryProgress();
    }
    isDragging = false;
};

// Prevent scroll on the overlay background
storyViewerOverlay.addEventListener('touchmove', (e) => {
    // Allows vertical drag if dragging is active on the storyCon
    if (!isDragging) e.preventDefault(); 
}, { passive: false });

// --- Like Button Logic (Restored from your original) ---
document.addEventListener('DOMContentLoaded', () => {
    const iconBtn = document.querySelector('.story-reply-icon');
    const heartPath = iconBtn.querySelector('path');
    
    iconBtn.addEventListener('click', () => {
        iconBtn.classList.toggle('active');
        const isActive = iconBtn.classList.contains('active');
        heartPath.setAttribute('fill', isActive ? '#e1306c' : 'none');
        heartPath.setAttribute('stroke', isActive ? '#e1306c' : '#9ca3af');
    });
});


// --- Example Usage (For Testing) ---

/* // To test, run this in your console or integrate into your chat list logic:

// Example 1: Your Own Story (Index 0 cannot navigate back)
openStoryViewer('Me', 'avatar.jpg', true, [
    { contentUrl: 'story1.jpg', timestamp: '1 hour ago' },
    { contentUrl: 'story2.jpg', timestamp: '30 minutes ago' },
    { contentUrl: 'story3.jpg', timestamp: '5 minutes ago' }
]);

// Example 2: Another User's Story (Full back/forward navigation allowed)
openStoryViewer('Emily', 'emily.jpg', false, [
    { contentUrl: 'emily_story1.jpg', timestamp: '2 hours ago' },
    { contentUrl: 'emily_story2.jpg', timestamp: '45 minutes ago' }
]);

// Note: You will need to replace 'story1.jpg' etc., with actual image URLs for it to work.
*/

