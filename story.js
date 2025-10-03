// story.js

// --- Global State and Constants ---
let currentStoryIndex = 0;
let currentStoriesData = [];
let progressTimers = [];
let animationFrameId = null;
const STORY_DURATION = 7000; // 7 seconds per slide
const closeThreshold = 50;   // Drag distance (px) to close

// --- DOM Elements (Fetched once) ---
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
        fill.style.transition = 'none'; // Temporarily disable transition for reset
        fill.style.animation = 'none';
        fill.offsetHeight; // Force reflow
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
        const prevFill = progressContainer.children[i].querySelector('.progress-fill');
        prevFill.style.transition = 'none';
        prevFill.style.width = '100%';
    }
    
    // Reset/Pause subsequent bars
    for (let i = currentStoryIndex + 1; i < currentStoriesData.length; i++) {
        const nextFill = progressContainer.children[i].querySelector('.progress-fill');
        nextFill.style.transition = 'none';
        nextFill.style.width = '0%';
    }

    // Set up the current bar
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    
    // Animation loop for smooth progress
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / STORY_DURATION, 1);
        progressFill.style.width = `${progress * 100}%`;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    animationFrameId = requestAnimationFrame(animate);

    // Timer to move to the next slide when duration is complete
    const timeout = setTimeout(showNextStory, STORY_DURATION);
    progressTimers.push(timeout);
}


/**
 * Moves the story carousel to a specific index, respecting navigation rules.
 * @param {number} newIndex - The target index of the story slide.
 */
function navigateToStory(newIndex) {
    if (newIndex < 0 || newIndex >= currentStoriesData.length) {
        return;
    }

    // --- CRITICAL NAVIGATION RULE ---
    const isOwnStory = currentStoriesData[0]?.isOwnStory;
    if (isOwnStory && newIndex < currentStoryIndex && newIndex === 0) {
        // Rule: "Your story" first internal story should not allow back invisible navigation.
        return; 
    }

    // Update the progress bar for the story we are leaving
    const prevFill = progressContainer.children[currentStoryIndex]?.querySelector('.progress-fill');
    if (prevFill) {
        // Quick transition for smooth progress bar update
        prevFill.style.transition = 'width 0.2s ease-out'; 
        // Fill if going forward, reset if going backward
        prevFill.style.width = newIndex > currentStoryIndex ? '100%' : '0%'; 
    }

    currentStoryIndex = newIndex;
    
    // Move the slide wrapper
    const offset = -currentStoryIndex * 100;
    storyPageWrapper.style.transform = `translateX(${offset}%)`;

    // Update timestamp
    headerTimestamp.textContent = currentStoriesData[currentStoryIndex]?.timestamp || '';

    // Wait briefly for slide transition before starting new progress animation
    setTimeout(startStoryProgress, 300); 
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
        // For index 0, you could implement a rule to go to the previous user's story here,
        // but for now, we stop, respecting the "Your Story" rule if applicable.
    }
}

// Function to handle the Escape key press
const handleEscape = (e) => {
    if (e.key === 'Escape') {
        closeStoryViewer();
    }
};

/**
 * Closes the story viewer and cleans up the DOM and event listeners.
 */
function closeStoryViewer() {
    stopStoryProgress();
    console.log('Closing story viewer');

    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';
    
    // Remove the Escape key listener to prevent memory leaks
    document.removeEventListener('keydown', handleEscape);
    
    // Reset state and DOM content
    currentStoryIndex = 0;
    currentStoriesData = [];
    storyPageWrapper.innerHTML = '';
    progressContainer.innerHTML = '';
    storyCon.style.transform = ''; // Clear any drag-related transform
}

// Expose the close function globally
window.closeStoryViewer = closeStoryViewer;


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
        
        // Use a placeholder width for image loading logic
        const PLACEHOLDER_WIDTH = 384; 
        const PLACEHOLDER_HEIGHT = 600;

        // Image object used to determine aspect ratio before insertion
        const tempImg = new Image();
        tempImg.onload = function() {
            // Recalculate aspect ratio on load
            const naturalRatio = this.naturalHeight / this.naturalWidth;
            const isTall = naturalRatio > 1.3;
            const imgEl = page.querySelector('img.story-viewer-content');
            
            // Adjust content fit
            if (imgEl) {
                imgEl.style.objectFit = isTall ? 'cover' : 'contain';
            }

            // Apply blur background logic if not tall
            if (!isTall && !page.querySelector('.story-blur-bg')) {
                 const blurBg = document.createElement('div');
                 blurBg.className = 'story-blur-bg';
                 blurBg.style.backgroundImage = `url(${story.contentUrl})`;
                 page.insertBefore(blurBg, imgEl);
            }
        };
        tempImg.src = story.contentUrl;

        // Story Image/Content (inserted first)
        const img = document.createElement('img');
        img.className = 'story-viewer-content';
        img.src = story.contentUrl;
        page.appendChild(img);
        
        storyPageWrapper.appendChild(page);
    });
}

/**
 * Initializes the story viewer with story data.
 * @param {string} username - The owner of the story.
 * @param {string} avatarUrl - The avatar URL of the owner.
 * @param {boolean} isOwnStory - True if the user is viewing their own story.
 * @param {Array<Object>} stories - Array of story content objects: [{ contentUrl, timestamp }, ...]
 */
window.openStoryViewer = function (username, avatarUrl, isOwnStory, stories) {
    if (!stories || stories.length === 0) return;

    // Enhance stories data with the navigation flag
    currentStoriesData = stories.map(s => ({ ...s, isOwnStory }));

    // Set header info
    headerUsername.textContent = username;
    // Set the avatar using background-image or child element (implementation depends on your HTML)
    // Example: document.getElementById('storyHeaderAvatar').style.backgroundImage = `url(${avatarUrl})`;

    // Build the slides and progress bars
    buildStoryViewer(currentStoriesData);
    
    // Show overlay and start at the first story
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    currentStoryIndex = 0;
    navigateToStory(0); // This will also start the timer

    // Attach navigation and close listeners
    navAreaRight.onclick = showNextStory;
    navAreaLeft.onclick = showPrevStory;
    storyCloseBtn.onclick = closeStoryViewer;
    storyViewerOverlay.onclick = (e) => {
        if (e.target === storyViewerOverlay) closeStoryViewer();
    };
    document.addEventListener('keydown', handleEscape);
};

// --- Drag-to-Close Implementation (Attached to storyCon) ---

let startY = 0;
let isDragging = false;

const startDrag = (e) => {
    // Only allow drag-to-close from the center area (avoiding left/right navigation)
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    const rect = storyCon.getBoundingClientRect();
    const x = clientX - rect.left;
    
    // Check if click/touch is in the central 20% area
    if (x > rect.width * 0.4 && x < rect.width * 0.6) {
        startY = clientY;
        isDragging = true;
        stopStoryProgress();
    }
};

const moveDrag = (e) => {
    if (!isDragging) return;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    const dragDistance = clientY - startY;
    
    if (dragDistance > closeThreshold) {
        closeStoryViewer();
    } else if (dragDistance > 0) {
        // Apply "pull" effect
        const scale = 1 - Math.min(dragDistance / 200, 0.05);
        storyCon.style.transform = `translateY(${dragDistance}px) scale(${scale})`;
    }
};

const endDrag = () => {
    if (isDragging) {
        storyCon.style.transform = ''; // Snap back
        // Only restart progress if it wasn't closed
        if (storyViewerOverlay.classList.contains('show')) {
            startStoryProgress(); 
        }
    }
    isDragging = false;
};

// Attach Drag Listeners to the storyCon element
storyCon.addEventListener('mousedown', startDrag);
storyCon.addEventListener('mousemove', moveDrag);
storyCon.addEventListener('mouseup', endDrag);

storyCon.addEventListener('touchstart', startDrag, { passive: true });
storyCon.addEventListener('touchmove', moveDrag, { passive: true });
storyCon.addEventListener('touchend', endDrag);

// Prevent scroll on the overlay background
storyViewerOverlay.addEventListener('touchmove', (e) => {
    // Only prevent default if we're not actively dragging (to allow vertical drag movement)
    if (!isDragging) e.preventDefault(); 
}, { passive: false });


// --- Initialization and Cleanup on Load (The Black Screen Fix) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Attach Like Button Logic (needs to be attached once to the static element)
    const iconBtn = document.querySelector('.story-reply-icon');
    if (iconBtn) {
        const heartPath = iconBtn.querySelector('path');
        iconBtn.addEventListener('click', () => {
            iconBtn.classList.toggle('active');
            const isActive = iconBtn.classList.contains('active');
            heartPath.setAttribute('fill', isActive ? '#e1306c' : 'none');
            heartPath.setAttribute('stroke', isActive ? '#e1306c' : '#9ca3af');
        });
    }

    // 2. CRITICAL: Force the story viewer closed upon page load
    // This prevents the black screen issue caused by cached state or accidental calls.
    if (storyViewerOverlay.classList.contains('show')) {
        console.warn("Story viewer was left open. Forcing close.");
        if (typeof window.closeStoryViewer === 'function') {
            window.closeStoryViewer();
        } else {
            // Fallback
            storyViewerOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
});

