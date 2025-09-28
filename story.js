// --- CRITICAL FIX: Expose the main function at the top for use by HTML-side listeners ---
window.showStoryPopup = showStoryPopup;

/**
 * Utility function to approximate a dominant color from a small area of an image.
 * Note: Requires the image to be served with CORS headers if from a different domain.
 * @param {HTMLImageElement} imgElement - The loaded image element.
 * @returns {string|null} The dominant color as an RGB string, or null on error.
 */
function getDominantColor(imgElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!imgElement.complete || imgElement.naturalWidth === 0) return null;

    try {
        const width = canvas.width = 1;
        const height = canvas.height = 1;

        // Draw the image onto the 1x1 canvas
        context.drawImage(imgElement, 0, 0, width, height);
        
        // Get the pixel data
        const data = context.getImageData(0, 0, width, height).data;

        // Return the color as an RGB string (r, g, b, a)
        return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    } catch (e) {
        console.error("Could not read image data for color extraction. Check CORS policy.", e);
        return null; 
    }
}

// --- Global Element References ---
const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
const multiProgressBar = document.getElementById('multiProgressBar');
const navPrevInternal = document.getElementById('navPrevInternal');
const navNextInternal = document.getElementById('navNextInternal');

// --- Global State ---
let progressTimeout = null;
let currentStoryIndex = 0; 
let currentInternalStoryIndex = 0; 
let isNavigating = false; // Debounce flag for navigation

const STORY_DURATION = 5000; // 5 seconds per story card

// --- Progress Management ---

function clearProgressTimeout() {
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }
}

/**
 * Creates and renders a progress bar segment for every internal story card.
 * @param {Array<Object>} internalStories - The array of story cards for the current user.
 */
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

/**
 * Starts the filling animation for the current internal story segment.
 * Ensures the progress bar is reset and animates only once.
 */
function startProgressBar() {
    clearProgressTimeout();

    const currentSegment = document.getElementById(`story-segment-${currentInternalStoryIndex}`);
    if (!currentSegment) return; 

    const innerBar = currentSegment.querySelector('.progress-bar-inner');

    // 1. Reset all segments to ensure no stale transitions
    document.querySelectorAll('.progress-bar-segment').forEach((segment, index) => {
        const bar = segment.querySelector('.progress-bar-inner');
        
        bar.style.transition = 'none';
        
        if (index < currentInternalStoryIndex) {
            bar.style.width = '100%'; // Past stories are full
        } else {
            bar.style.width = '0%'; // Current and future stories are empty
        }
    });

    // 2. FORCED REFLOW/REDRAW
    innerBar.offsetHeight; 

    // 3. Start current segment animation
    innerBar.style.transition = `width ${STORY_DURATION}ms linear`;
    innerBar.style.width = '100%';

    // 4. Set timeout for auto-navigation
    progressTimeout = setTimeout(() => {
        nextStory();
    }, STORY_DURATION);
}

// --- Content Fetching & Rendering ---

async function fetchStoryContent(storyCard) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(storyCard);
        }, 300);
    });
}

/**
 * Renders the story content (Image, Video, or Text) with blurred background/color fallback.
 * @param {Object} storyCard - The object defining the current internal story.
 */
function renderContent(storyCard) {
    storyContentDiv.innerHTML = '';
    const storyContentContainer = document.querySelector('.story-content');
    let bgLayer = storyContentContainer.querySelector('.story-background-layer');
    if (bgLayer) bgLayer.remove();

    bgLayer = document.createElement('div');
    bgLayer.className = 'story-background-layer';
    storyContentContainer.prepend(bgLayer);

    if (storyCard.type === 'image') {
        loadingRing.classList.remove('hidden');
        
        const img = document.createElement('img');
        img.src = storyCard.src;
        img.alt = 'Story image';
        img.className = 'story main';
        
        const bgImg = document.createElement('img');
        bgImg.src = storyCard.src;
        bgImg.alt = 'Blurred background';
        bgImg.className = 'story-bg';
        
        bgLayer.appendChild(bgImg);
        storyContentDiv.appendChild(img);

        img.onload = () => {
            loadingRing.classList.add('hidden');
            
            const dominantColor = getDominantColor(img);
            bgLayer.style.backgroundColor = dominantColor || '#222';
            
            setTimeout(() => {
                bgImg.style.opacity = 1;
            }, 50); 
            
            startProgressBar();
        };

        img.onerror = () => {
            loadingRing.classList.add('hidden');
            storyContentDiv.innerHTML = `<p class="story-text">Error loading image at ${storyCard.src}</p>`;
            bgLayer.style.backgroundColor = '#444';
            startProgressBar();
        };

    } else if (storyCard.type === 'video') {
        loadingRing.classList.remove('hidden');
        const video = document.createElement('video');
        video.src = storyCard.src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.className = 'story main story-video';
        
        bgLayer.style.backgroundColor = '#111';

        const bgVideo = video.cloneNode(true);
        bgVideo.removeAttribute('controls');
        bgVideo.className = 'story-bg';
        bgVideo.style.opacity = 1;

        bgLayer.appendChild(bgVideo);
        storyContentDiv.appendChild(video);

        video.onloadeddata = () => {
            loadingRing.classList.add('hidden');
            startProgressBar();
        };
        video.onerror = () => {
            loadingRing.classList.add('hidden');
            storyContentDiv.innerHTML = `<p class="story-text">Error loading video.</p>`;
            startProgressBar();
        };
        
    } else if (storyCard.type === 'text') {
        loadingRing.classList.add('hidden');
        const p = document.createElement('p');
        p.className = 'story-text';
        p.textContent = storyCard.text;
        
        bgLayer.style.background = 'linear-gradient(135deg, #749cbf, #a855f7)';
        storyContentDiv.appendChild(p);
        
        startProgressBar();
    }
}

// --- Main Popup/Navigation Function ---

/**
 * Opens the story pop-up and handles the transition and content loading.
 * @param {Object} userStory - The object for the current user's story container.
 * @param {number} userIndex - The index of the user in the global stories array.
 * @param {number} internalIndex - The index of the story card within the user's stories.
 * @param {string} direction - 'none', 'next-user', 'prev-user', 'next-internal', 'prev-internal'.
 */
function showStoryPopup(userStory, userIndex, internalIndex = 0, direction = 'none') {
    clearProgressTimeout();

    currentStoryIndex = userIndex;
    currentInternalStoryIndex = internalIndex;

    // Apply slide transitions for USER navigation
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
        storyPopupContent.style.transition = 'none';
        storyPopupContent.style.transform = 'translateX(0)';
    }

    // Initial Popup State (for slide-up transition)
    if (direction === 'none') {
        loadingRing.classList.remove('hidden');
        storyPopup.classList.remove('hidden');
        setTimeout(() => {
            storyPopup.classList.add('active');
        }, 10);
    }

    // Always re-render progress bars to ensure clean state
    renderProgressBars(userStory.internalStories);
    
    // Fetch and Render Content
    const currentStoryCard = userStory.internalStories[currentInternalStoryIndex];
    if (!currentStoryCard) return hideStoryPopup(); 
    
    if (currentStoryCard.type === 'text') {
        loadingRing.classList.add('hidden');
    }
    
    fetchStoryContent(currentStoryCard).then(content => {
        renderContent(content);
    });
}

// --- Navigation Helpers ---

function nextStory() {
    if (isNavigating) return;
    isNavigating = true;

    clearProgressTimeout();
    const currentUserStory = window.stories[currentStoryIndex]; 

    if (currentInternalStoryIndex < currentUserStory.internalStories.length - 1) {
        const nextInternalIndex = currentInternalStoryIndex + 1;
        showStoryPopup(currentUserStory, currentStoryIndex, nextInternalIndex, 'next-internal');
    } else if (currentStoryIndex < window.stories.length - 1) {
        const nextUserIndex = currentStoryIndex + 1;
        showStoryPopup(window.stories[nextUserIndex], nextUserIndex, 0, 'next-user');
    } else {
        hideStoryPopup();
    }

    setTimeout(() => {
        isNavigating = false;
    }, 200);
}

function prevStory() {
    if (isNavigating) return;
    isNavigating = true;

    clearProgressTimeout();
    const currentUserStory = window.stories[currentStoryIndex]; 

    if (currentInternalStoryIndex > 0) {
        const prevInternalIndex = currentInternalStoryIndex - 1;
        showStoryPopup(currentUserStory, currentStoryIndex, prevInternalIndex, 'prev-internal');
    } else if (currentStoryIndex > 0) {
        const prevUserIndex = currentStoryIndex - 1;
        const prevUserStory = window.stories[prevUserIndex];
        const lastInternalIndex = prevUserStory.internalStories.length - 1;
        showStoryPopup(prevUserStory, prevUserIndex, lastInternalIndex, 'prev-user');
    }

    setTimeout(() => {
        isNavigating = false;
    }, 200);
}

function hideStoryPopup() {
    clearProgressTimeout();
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
        storyContentDiv.innerHTML = '';
        const storyContentContainer = document.querySelector('.story-content');
        let bgLayer = storyContentContainer.querySelector('.story-background-layer');
        if (bgLayer) bgLayer.remove();
        storyPopupContent.style.transform = 'translateX(0)';
        loadingRing.classList.add('hidden');
        multiProgressBar.innerHTML = ''; 
    }, 300);
}

// --- Event Listeners (Internal & Swipe Navigation) ---

if (navNextInternal) navNextInternal.addEventListener('click', nextStory);
if (navPrevInternal) navPrevInternal.addEventListener('click', prevStory);

let startX = 0;
let startY = 0;
const swipeThreshold = 60;
const swipeDownThreshold = 60;

if (storyPopup) {
    storyPopup.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        storyPopup.style.transition = 'none';
        clearProgressTimeout();
    });

    storyPopup.addEventListener('touchmove', (e) => {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
            storyPopup.style.transform = `translateY(${deltaY}px)`;
            e.preventDefault();
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            storyPopupContent.style.transition = 'none';
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
        
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
            hideStoryPopup();
            return;
        } 

        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0 && currentStoryIndex > 0) {
                const prevUserIndex = currentStoryIndex - 1;
                const prevUserStory = window.stories[prevUserIndex];
                const lastInternalIndex = prevUserStory.internalStories.length - 1;
                showStoryPopup(prevUserStory, prevUserIndex, lastInternalIndex, 'prev-user');
                return;
            } else if (deltaX < 0 && currentStoryIndex < window.stories.length - 1) {
                const nextUserIndex = currentStoryIndex + 1;
                showStoryPopup(window.stories[nextUserIndex], nextUserIndex, 0, 'next-user');
                return;
            }
        } 

        storyPopup.style.transform = 'translateY(0)';
        storyPopupContent.style.transform = 'translateX(0)';
        
        startProgressBar();
    });
}
