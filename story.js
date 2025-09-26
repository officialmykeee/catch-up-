const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
const multiProgressBar = document.getElementById('multiProgressBar');
const navPrevInternal = document.getElementById('navPrevInternal');
const navNextInternal = document.getElementById('navNextInternal');

// Ensure these are defined globally or passed if needed, assuming they're in the main HTML script.
// If they are not globally available, you need to ensure they are loaded first.
// For this example, we'll redefine the minimum structure needed:
/*
const stories = [
    // ... (Your updated data structure with internalStories)
];
*/

let progressTimeout = null;
let currentStoryIndex = 0; // Index for the user's story in the 'stories' array
let currentInternalStoryIndex = 0; // Index for the story card within the user's 'internalStories' array

const STORY_DURATION = 5000; // 5 seconds per story card

// --- Utility Functions ---

function clearProgressTimeout() {
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }
}

// --- Progress Bar Management ---

function renderProgressBars(internalStories) {
    multiProgressBar.innerHTML = '';
    internalStories.forEach((_, index) => {
        const segment = document.createElement('div');
        segment.className = 'progress-bar-segment';
        segment.innerHTML = '<div class="progress-bar-inner"></div>';
        segment.id = `story-segment-${index}`;
        multiProgressBar.appendChild(segment);
    });
}

function startProgressBar() {
    clearProgressTimeout();

    const currentSegment = document.getElementById(`story-segment-${currentInternalStoryIndex}`);
    if (!currentSegment) return; 

    const innerBar = currentSegment.querySelector('.progress-bar-inner');

    // Reset all segments for a clean start/transition
    document.querySelectorAll('.progress-bar-segment').forEach((segment, index) => {
        const bar = segment.querySelector('.progress-bar-inner');
        bar.style.transition = 'none';
        if (index < currentInternalStoryIndex) {
            bar.style.width = '100%'; // Completed stories
        } else if (index > currentInternalStoryIndex) {
            bar.style.width = '0'; // Future stories
        } else {
             bar.style.width = '0'; // Current story resets to 0 before starting
        }
    });

    // Start current segment animation
    setTimeout(() => {
        innerBar.style.transition = `width ${STORY_DURATION}ms linear`;
        innerBar.style.width = '100%';
    }, 10);

    // Set timeout for auto-navigation to the next internal story
    progressTimeout = setTimeout(() => {
        nextStory();
    }, STORY_DURATION);
}

// --- Content Fetching & Rendering ---

async function fetchStoryContent(storyCard) {
    // Look up content directly from the passed storyCard object
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(storyCard);
        }, 500); // Simulate content load delay
    });
}

async function renderContent(storyCard) {
    let contentHtml = '';
    if (storyCard) {
        if (storyCard.type === 'image') {
            contentHtml = `<img src="${storyCard.src}" alt="Story image" class="story-image">`;
        } else if (storyCard.type === 'video') {
            contentHtml = `<video src="${storyCard.src}" controls autoplay class="story-video"></video>`;
        } else if (storyCard.type === 'text') {
            contentHtml = `<p class="story-text">${storyCard.text}</p>`;
        }
    } else {
        contentHtml = `<p class="story-text">No content available</p>`;
    }
    storyContentDiv.innerHTML = contentHtml;
}

// --- Main Popup/Navigation Function ---

function showStoryPopup(userStory, userIndex, internalIndex = 0, direction = 'none') {
    clearProgressTimeout();

    // 1. Update indices
    currentStoryIndex = userIndex;
    currentInternalStoryIndex = internalIndex;

    // 2. Apply slide transitions for USER navigation (user to user)
    // Internal transitions (next-internal, prev-internal) use NO transform/transition
    if (direction === 'next-user') {
        storyPopupContent.style.transform = 'translateX(-50%)';
        setTimeout(() => {
            storyPopupContent.style.transition = 'none';
            storyPopupContent.style.transform = 'translateX(50%)';
            setTimeout(() => {
                storyPopupContent.style.transition = 'transform 0.15s linear';
                storyPopupContent.style.transform = 'translateX(0)';
            }, 10);
        }, 150);
    } else if (direction === 'prev-user') {
        storyPopupContent.style.transform = 'translateX(50%)';
        setTimeout(() => {
            storyPopupContent.style.transition = 'none';
            storyPopupContent.style.transform = 'translateX(-50%)';
            setTimeout(() => {
                storyPopupContent.style.transition = 'transform 0.15s linear';
                storyPopupContent.style.transform = 'translateX(0)';
            }, 10);
        }, 150);
    } else {
        // Ensure no transform on internal transition
        storyPopupContent.style.transition = 'none';
        storyPopupContent.style.transform = 'translateX(0)';
    }

    // 3. Initial Popup State (if opening fresh)
    if (direction === 'none') {
        loadingRing.classList.remove('hidden');
        storyContentDiv.innerHTML = '';
        storyPopup.classList.remove('hidden');
        setTimeout(() => {
            storyPopup.classList.add('active');
        }, 10);
    }

    // 4. Render progress bars (only needed on user change or initial open)
    if (direction === 'none' || direction.includes('user')) {
        renderProgressBars(userStory.internalStories);
    }
    
    // 5. Fetch and Render Content
    const currentStoryCard = userStory.internalStories[currentInternalStoryIndex];
    if (!currentStoryCard) return hideStoryPopup(); 
    
    // Show loading ring only if it's the very first story, or a user-to-user navigation
    if (direction === 'none' || direction.includes('user')) {
        loadingRing.classList.remove('hidden');
    }

    fetchStoryContent(currentStoryCard).then(content => {
        loadingRing.classList.add('hidden');
        renderContent(content);
        startProgressBar();
    });
}

// --- Navigation Helpers ---

function nextStory() {
    clearProgressTimeout();
    const currentUserStory = stories[currentStoryIndex];

    if (currentInternalStoryIndex < currentUserStory.internalStories.length - 1) {
        // 1. Move to the next internal story card (NO transition)
        const nextInternalIndex = currentInternalStoryIndex + 1;
        showStoryPopup(currentUserStory, currentStoryIndex, nextInternalIndex, 'next-internal');
    } else if (currentStoryIndex < stories.length - 1) {
        // 2. Move to the next user's first story card (WITH transition)
        const nextUserIndex = currentStoryIndex + 1;
        showStoryPopup(stories[nextUserIndex], nextUserIndex, 0, 'next-user');
    } else {
        // 3. Last story of the last user: Close popup
        hideStoryPopup();
    }
}

function prevStory() {
    clearProgressTimeout();
    const currentUserStory = stories[currentStoryIndex];

    if (currentInternalStoryIndex > 0) {
        // 1. Move to the previous internal story card (NO transition)
        const prevInternalIndex = currentInternalStoryIndex - 1;
        showStoryPopup(currentUserStory, currentStoryIndex, prevInternalIndex, 'prev-internal');
    } else if (currentStoryIndex > 0) {
        // 2. Move to the previous user's LAST story card (WITH transition)
        const prevUserIndex = currentStoryIndex - 1;
        const prevUserStory = stories[prevUserIndex];
        const lastInternalIndex = prevUserStory.internalStories.length - 1;
        showStoryPopup(prevUserStory, prevUserIndex, lastInternalIndex, 'prev-user');
    }
    // If it's the first story of the first user, do nothing (stay put)
}

function hideStoryPopup() {
    clearProgressTimeout();
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
        storyContentDiv.innerHTML = '';
        storyPopupContent.style.transform = 'translateX(0)';
        loadingRing.classList.add('hidden');
        multiProgressBar.innerHTML = ''; // Clear progress bars
    }, 300);
}

// --- Event Listeners ---

// 1. Internal Navigation Buttons (Click/Tap)
if (navNextInternal) navNextInternal.addEventListener('click', nextStory);
if (navPrevInternal) navPrevInternal.addEventListener('click', prevStory);


// 2. Swipe Navigation (User-to-User or Close)
let startX = 0;
let startY = 0;
const swipeThreshold = 60;
const swipeDownThreshold = 60;

if (storyPopup) {
    storyPopup.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        storyPopup.style.transition = 'none';
        clearProgressTimeout(); // Pause auto-navigation during touch
    });

    storyPopup.addEventListener('touchmove', (e) => {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        // Prioritize vertical swipe for closing
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
            storyPopup.style.transform = `translateY(${deltaY}px)`;
            e.preventDefault();
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe only for USER transitions
            storyPopupContent.style.transition = 'none'; // Temporarily disable slide transition
            storyPopupContent.style.transform = `translateX(${deltaX / 2}px)`;
            e.preventDefault();
        }
    });

    storyPopup.addEventListener('touchend', (e) => {
        const currentX = e.changedTouches[0].clientX;
        const currentY = e.changedTouches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        storyPopup.style.transition = 'transform 0.3s ease-in-out';
        storyPopupContent.style.transition = 'transform 0.15s linear';
        
        // A. Vertical swipe down to close
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
            hideStoryPopup();
            return;
        } 

        // B. Horizontal swipe for USER navigation
        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0 && currentStoryIndex > 0) {
                // Swipe right: previous user's last story (User-to-User)
                const prevUserIndex = currentStoryIndex - 1;
                const prevUserStory = stories[prevUserIndex];
                const lastInternalIndex = prevUserStory.internalStories.length - 1;
                showStoryPopup(prevUserStory, prevUserIndex, lastInternalIndex, 'prev-user');
                return;

            } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
                // Swipe left: next user's first story (User-to-User)
                const nextUserIndex = currentStoryIndex + 1;
                showStoryPopup(stories[nextUserIndex], nextUserIndex, 0, 'next-user');
                return;
            }
        } 

        // C. Reset or Resume Auto-Navigation
        storyPopup.style.transform = 'translateY(0)';
        storyPopupContent.style.transform = 'translateX(0)';
        
        // Resume auto-navigation for the current internal story
        startProgressBar();
    });
}

