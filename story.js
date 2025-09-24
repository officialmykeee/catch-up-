const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const progressBar = document.querySelector('.progress-bar');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
let progressTimeout = null;
let currentStoryIndex = 0;

// Cube switch-specific variables
const cubeSwitch = document.querySelector('.cube-switch'); // Assumed to exist in DOM
let isDraggingCube = false;
let cubeStartX = 0;
let longPressTimer = null;
const longPressDuration = 300; // Milliseconds for long press detection
const cubeDragThreshold = 60; // Same as swipe threshold for consistency

async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story && story.content ? story.content : []);
        }, 500);
    });
}

async function showStoryPopup(story, index, direction = 'none') {
    // Clear any existing timeout to prevent glitches
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }

    // Store current story index
    currentStoryIndex = index;

    // Apply subtle horizontal slide transition
    if (direction === 'next') {
        storyPopupContent.style.transform = 'translateX(-50%)';
        setTimeout(() => {
            storyPopupContent.style.transition = 'none';
            storyPopupContent.style.transform = 'translateX(50%)';
            setTimeout(() => {
                storyPopupContent.style.transition = 'transform 0.15s linear';
                storyPopupContent.style.transform = 'translateX(0)';
            }, 10);
        }, 150);
    } else if (direction === 'prev') {
        storyPopupContent.style.transform = 'translateX(50%)';
        setTimeout(() => {
            storyPopupContent.style.transition = 'none';
            storyPopupContent.style.transform = 'translateX(-50%)';
            setTimeout(() => {
                storyPopupContent.style.transition = 'transform 0.15s linear';
                storyPopupContent.style.transform = 'translateX(0)';
            }, 10);
        }, 150);
    }

    // Reset progress bar and show loading ring
    progressBar.style.transition = 'none';
    progressBar.style.width = '0';
    loadingRing.classList.remove('hidden');
    storyContentDiv.innerHTML = '';
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    // Fetch content and hide loading ring
    const contents = await fetchStoryContent(story.id);
    loadingRing.classList.add('hidden');

    // Render content in story-content-inner
    const storyCount = contents.length || 1;
    const duration = storyCount <= 5 ? 5000 : 8000;
    let contentHtml = '';
    if (contents.length > 0 && contents[0].type === 'image') {
        contentHtml = `<img src="${contents[0].src}" alt="Story image" class="story-image">`;
    } else if (contents.length > 0 && contents[0].type === 'video') {
        contentHtml = `<video src="${contents[0].src}" controls autoplay class="story-video"></video>`;
    } else if (contents.length > 0 && contents[0].type === 'text') {
        contentHtml = `<p class="story-text">${contents[0].text}</p>`;
    } else {
        contentHtml = `<p class="story-text">No content available</p>`;
    }
    // Add cube switch to content (assuming it's part of the story UI)
    contentHtml += `<div class="cube-switch"></div>`;
    storyContentDiv.innerHTML = contentHtml;

    // Start progress bar after loading completes
    progressBar.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 10);

    // Handle navigation after progress bar fills
    progressTimeout = setTimeout(() => {
        if (story.isYourStory || currentStoryIndex === stories.length - 1) {
            hideStoryPopup();
        } else {
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 'next');
        }
    }, duration);
}

function hideStoryPopup() {
    // Clear timeout to prevent multiple closures
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }

    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
        progressBar.style.transition = 'none';
        progressBar.style.width = '0';
        loadingRing.classList.add('hidden');
        storyContentDiv.innerHTML = '';
        storyPopupContent.style.transform = 'translateX(0)';
    }, 300);
}

// Twitter Fleets-style navigation (unchanged)
storyPopup.addEventListener('click', (e) => {
    if (e.target === storyPopup || e.target.classList.contains('story-content')) {
        const rect = storyPopup.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const halfWidth = rect.width / 2;

        if (tapX < halfWidth) {
            // Tap left: go to previous story
            if (currentStoryIndex > 0) {
                const prevIndex = currentStoryIndex - 1;
                showStoryPopup(stories[prevIndex], prevIndex, 'prev');
            }
        } else {
            // Tap right: go to next story or close
            if (currentStoryIndex < stories.length - 1) {
                const nextIndex = currentStoryIndex + 1;
                showStoryPopup(stories[nextIndex], nextIndex, 'next');
            } else {
                hideStoryPopup();
            }
        }
    }
});

// Swipe navigation (modified to avoid conflict with cube drag)
let startX = 0;
let startY = 0;
const swipeThreshold = 60;
const swipeDownThreshold = 60;

storyPopup.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    storyPopup.style.transition = 'none';

    // Check if touch is on cube switch for long press
    if (e.target.classList.contains('cube-switch')) {
        longPressTimer = setTimeout(() => {
            isDraggingCube = true;
            cubeStartX = startX;
        }, longPressDuration);
    }
});

storyPopup.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (isDraggingCube) {
        // Cube drag: move cube visually (optional, can adjust based on design)
        cubeSwitch.style.transform = `translateX(${deltaX / 2}px)`; // Scale down drag distance
        e.preventDefault();
    } else {
        // Prioritize vertical swipe for closing
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
            storyPopup.style.transform = `translateY(${deltaY}px)`;
            e.preventDefault();
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe for navigation
            storyPopupContent.style.transform = `translateX(${deltaX / 2}px)`;
            e.preventDefault();
        }
    }
});

storyPopup.addEventListener('touchend', (e) => {
    const currentX = e.changedTouches[0].clientX;
    const currentY = e.changedTouches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Clear long press timer
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    if (isDraggingCube) {
        // Handle cube drag navigation
        cubeSwitch.style.transition = 'transform 0.15s linear';
        cubeSwitch.style.transform = 'translateX(0)';
        if (Math.abs(deltaX) > cubeDragThreshold) {
            if (deltaX > 0 && currentStoryIndex > 0) {
                // Drag right: previous story
                const prevIndex = currentStoryIndex - 1;
                showStoryPopup(stories[prevIndex], prevIndex, 'prev');
            } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
                // Drag left: next story
                const nextIndex = currentStoryIndex + 1;
                showStoryPopup(stories[nextIndex], nextIndex, 'next');
            }
        }
        isDraggingCube = false;
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
        // Vertical swipe down to close
        hideStoryPopup();
    } else if (Math.abs(deltaX) > swipeThreshold) {
        // Regular swipe navigation
        storyPopupContent.style.transition = 'transform 0.15s linear';
        if (deltaX > 0 && currentStoryIndex > 0) {
            // Swipe right: previous story
            const prevIndex = currentStoryIndex - 1;
            showStoryPopup(stories[prevIndex], prevIndex, 'prev');
        } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
            // Swipe left: next story
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 'next');
        } else {
            storyPopupContent.style.transform = 'translateX(0)';
        }
    } else {
        storyPopup.style.transition = 'transform 0.3s ease-in-out';
        storyPopupContent.style.transition = 'transform 0.15s linear';
        storyPopup.style.transform = 'translateY(0)';
        storyPopupContent.style.transform = 'translateX(0)';
    }
});
    
