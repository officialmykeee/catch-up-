// story.js

// --- Global State and Utility Functions ---

// Global state to track the currently viewed story list and index
let currentStoryList = [];
let currentStoryIndex = 0;
let isCurrentStoryYourOwn = false;

// Function to handle the Escape key press
const handleEscape = (e) => {
    if (e.key === 'Escape') {
        closeStoryViewer();
    }
};

/**
 * Loads a specific story content into the viewer based on the global index.
 */
function loadStory(index) {
    if (index < 0 || index >= currentStoryList.length) {
        console.log('Story index out of bounds. Closing viewer.');
        closeStoryViewer();
        return;
    }

    currentStoryIndex = index;
    const contentUrl = currentStoryList[currentStoryIndex];
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');

    console.log(`Loading story ${index + 1}/${currentStoryList.length}:`, contentUrl);

    // Reset view
    storyViewerContent.src = '';
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());

    // Set story image
    storyViewerContent.src = contentUrl;

    // Reset like button (optional, but clean)
    const iconBtn = document.querySelector('.story-reply-icon');
    if (iconBtn) {
        const heartPath = iconBtn.querySelector('path');
        iconBtn.classList.remove('active');
        heartPath.setAttribute('fill', 'none');
        heartPath.setAttribute('stroke', '#9ca3af');
    }

    // Once image loads, decide tall vs medium and apply blur background
    storyViewerContent.onload = () => {
        const isTall = storyViewerContent.naturalHeight > storyViewerContent.naturalWidth * 1.3;

        if (isTall) {
            storyViewerContent.style.objectFit = 'cover';
        } else {
            storyViewerContent.style.objectFit = 'contain';

            const blurBg = document.createElement('div');
            blurBg.className = 'story-blur-bg';
            blurBg.style.backgroundImage = `url(${contentUrl})`;
            storyCon.insertBefore(blurBg, storyViewerContent);
        }
    };
}

/**
 * Navigates to the next story in the list.
 */
function nextStory() {
    if (currentStoryIndex < currentStoryList.length - 1) {
        loadStory(currentStoryIndex + 1);
    } else {
        // End of story list, close viewer
        closeStoryViewer();
    }
}

/**
 * Navigates to the previous story in the list.
 */
function prevStory() {
    // Special rule for the first story in "Your story": tapping back should close, not navigate.
    const isFirstYourStory = isCurrentStoryYourOwn && currentStoryIndex === 0;

    if (isFirstYourStory) {
        console.log("Cannot go back from the first of 'Your story'. Closing.");
        closeStoryViewer();
        return;
    }

    if (currentStoryIndex > 0) {
        loadStory(currentStoryIndex - 1);
    }
    // If index is 0 and it's not "Your story", closing happens here, but we default to closing 
    // when loadStory fails (index < 0), which is fine.
}


/**
 * Closes the story viewer and cleans up the DOM and event listeners.
 */
function closeStoryViewer() {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const replyContainer = document.querySelector('.story-reply-container');

    console.log('Closing story viewer');

    // Hide overlay and reset body scroll
    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';

    // Clean up dynamic elements and content
    storyViewerContent.src = '';
    if (replyContainer) replyContainer.remove();
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());
    storyViewerOverlay.querySelectorAll('.story-nav-zone').forEach(el => el.remove());

    // Reset global state
    currentStoryList = [];
    currentStoryIndex = 0;
    isCurrentStoryYourOwn = false;

    // Remove the Escape key listener
    document.removeEventListener('keydown', handleEscape);
}

window.closeStoryViewer = closeStoryViewer;

// --- Main Open Function ---

/**
 * Opens the story viewer with the specified list of content.
 * @param {string[]} storyList - Array of story URLs.
 * @param {number} startIndex - The index of the story to start viewing (usually 0).
 * @param {boolean} isYourStory - True if the user is viewing their own story.
 */
window.openStoryViewer = function (storyList, startIndex = 0, isYourStory = false) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    
    if (!storyList || storyList.length === 0) return;

    // 1. Set global state
    currentStoryList = storyList;
    isCurrentStoryYourOwn = isYourStory;

    // Initial setup and show overlay
    storyViewerOverlay.classList.remove('show');
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // 2. Load the initial story content
    loadStory(startIndex);

    // 3. Dynamic Reply Container Logic (Creation and Reset)
    let replyContainer = document.querySelector('.story-reply-container');

    if (!replyContainer) {
        replyContainer = document.createElement('div');
        replyContainer.className = 'story-reply-container';

        const replyDiv = document.createElement('div');
        replyDiv.className = 'story-reply';
        replyDiv.textContent = 'Reply privately...';

        const iconBtn = document.createElement('div');
        iconBtn.className = 'story-reply-icon';
        iconBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        iconBtn.addEventListener('click', () => {
            iconBtn.classList.toggle('active');
            const heartPath = iconBtn.querySelector('path');
            const isActive = iconBtn.classList.contains('active');
            heartPath.setAttribute('fill', isActive ? '#e1306c' : 'none');
            heartPath.setAttribute('stroke', isActive ? '#e1306c' : '#9ca3af');
        });

        replyContainer.appendChild(replyDiv);
        replyContainer.appendChild(iconBtn);
        storyViewerOverlay.appendChild(replyContainer);
    }


    // 4. Add Non-Visible Tap Navigation Zones
    // Create navigation zones only if they don't already exist from a previous open
    if (!storyViewerOverlay.querySelector('.story-nav-zone')) {
        const createNavZone = (side) => {
            const zone = document.createElement('div');
            zone.className = `story-nav-zone story-nav-zone--${side}`;
            zone.style.position = 'absolute';
            zone.style.top = '0';
            zone.style.height = '100%';
            zone.style.width = '50%'; // Half the screen
            zone.style.zIndex = '5'; // Above story image, below reply bar
            zone.style.cursor = 'pointer';
            zone.style.opacity = '0'; // Completely non-visible

            if (side === 'left') {
                zone.style.left = '0';
                zone.onclick = prevStory;
            } else {
                zone.style.right = '0';
                zone.onclick = nextStory;
            }
            storyViewerOverlay.appendChild(zone);
        };
        
        createNavZone('left');
        createNavZone('right');
    }
    
    // 5. Drag and Close Logic (Remains the same)
    let startY = 0;
    let isDragging = false;
    const closeThreshold = 20;

    // Touch drag
    storyViewerContent.ontouchstart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    };
    storyViewerContent.ontouchmove = (e) => {
        if (!isDragging) return;
        if (e.touches[0].clientY - startY > closeThreshold) closeStoryViewer();
    };
    storyViewerContent.ontouchend = () => {
        isDragging = false;
    };

    // Mouse drag
    storyViewerContent.onmousedown = (e) => {
        startY = e.clientY;
        isDragging = true;
    };
    storyViewerContent.onmousemove = (e) => {
        if (!isDragging) return;
        if (e.clientY - startY > closeThreshold) closeStoryViewer();
    };
    storyViewerContent.onmouseup = () => {
        isDragging = false;
    };

    // Prevent scroll on the overlay background (for touch devices)
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        if (e.target !== storyViewerContent) e.preventDefault();
    }, { passive: false });

    // Close on background click
    storyViewerOverlay.addEventListener('click', (e) => {
        // Exclude the navigation zones from triggering a full close
        if (e.target === storyViewerOverlay) closeStoryViewer();
    });

    // Close on Escape
    document.addEventListener('keydown', handleEscape);
};



