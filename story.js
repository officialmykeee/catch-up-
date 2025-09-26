const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const progressBarContainer = document.querySelector('.progress-bar-container');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');
let progressTimeout = null;
let currentStoryIndex = 0;
let currentInternalStoryIndex = 0;

async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story && story.content ? story.content : []);
        }, 500);
    });
}

async function showStoryPopup(story, userIndex, internalIndex, direction = 'none') {
    // Clear any existing timeout to prevent glitches
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }

    // Store current indices
    currentStoryIndex = userIndex;
    currentInternalStoryIndex = internalIndex;

    // Apply transitions for user-to-user navigation
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
    } else if (direction === 'internal') {
        // No transition for internal stories
        storyPopupContent.style.transition = 'none';
    }

    // Reset progress bars and show loading ring
    progressBarContainer.innerHTML = '';
    loadingRing.classList.remove('hidden');
    storyContentDiv.innerHTML = '';
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    // Fetch content and hide loading ring
    const contents = await fetchStoryContent(story.id);
    loadingRing.classList.add('hidden');

    // Create multiple progress bars
    const storyCount = contents.length || 1;
    const duration = storyCount <= 5 ? 5000 : 8000;
    for (let i = 0; i < storyCount; i++) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        if (i < internalIndex) {
            progressBar.classList.add('completed');
        } else if (i === internalIndex) {
            progressBar.classList.add('active');
        }
        progressBar.innerHTML = '<div class="progress-bar-inner"></div>';
        progressBarContainer.appendChild(progressBar);
    }

    // Render content
    let contentHtml = '';
    if (contents.length > 0 && contents[internalIndex]) {
        if (contents[internalIndex].type === 'image') {
            contentHtml = `<img src="${contents[internalIndex].src}" alt="Story image" class="story-image">`;
        } else if (contents[internalIndex].type === 'video') {
            contentHtml = `<video src="${contents[internalIndex].src}" controls autoplay class="story-video"></video>`;
        } else if (contents[internalIndex].type === 'text') {
            contentHtml = `<p class="story-text">${contents[internalIndex].text}</p>`;
        }
    } else {
        contentHtml = `<p class="story-text">No content available</p>`;
    }
    storyContentDiv.innerHTML = contentHtml;

    // Start active progress bar
    const activeProgressBar = progressBarContainer.querySelector('.progress-bar.active .progress-bar-inner');
    if (activeProgressBar) {
        activeProgressBar.style.transition = `width ${duration}ms linear`;
        activeProgressBar.style.opacity = '1';
        setTimeout(() => {
            activeProgressBar.style.width = '100%';
        }, 10);
    }

    // Handle auto-navigation
    progressTimeout = setTimeout(() => {
        if (currentInternalStoryIndex < contents.length - 1) {
            // Next internal story
            showStoryPopup(story, currentStoryIndex, currentInternalStoryIndex + 1, 'internal');
        } else if (story.isYourStory || currentStoryIndex === stories.length - 1) {
            // Auto-close for "Your story" or last user's last story
            hideStoryPopup();
        } else {
            // Next user's first story
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 0, 'next');
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
        progressBarContainer.innerHTML = '';
        loadingRing.classList.add('hidden');
        storyContentDiv.innerHTML = '';
        storyPopupContent.style.transform = 'translateX(0)';
        storyPopupContent.style.transition = 'transform 0.15s linear';
    }, 300);
}

// Arrow navigation for internal stories and user transitions
leftArrow.addEventListener('click', () => {
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }
    const currentStory = stories[currentStoryIndex];
    const contents = currentStory.content;
    if (currentInternalStoryIndex > 0) {
        // Previous internal story
        showStoryPopup(currentStory, currentStoryIndex, currentInternalStoryIndex - 1, 'internal');
    } else if (currentStoryIndex > 0) {
        // Previous user's first story
        const prevIndex = currentStoryIndex - 1;
        showStoryPopup(stories[prevIndex], prevIndex, 0, 'prev');
    }
});

rightArrow.addEventListener('click', () => {
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }
    const currentStory = stories[currentStoryIndex];
    const contents = currentStory.content;
    if (currentInternalStoryIndex < contents.length - 1) {
        // Next internal story
        showStoryPopup(currentStory, currentStoryIndex, currentInternalStoryIndex + 1, 'internal');
    } else if (currentStoryIndex < stories.length - 1) {
        // Next user's first story
        const nextIndex = currentStoryIndex + 1;
        showStoryPopup(stories[nextIndex], nextIndex, 0, 'next');
    } else {
        // Close for last user's last story
        hideStoryPopup();
    }
});

// Swipe navigation for user transitions
let startX = 0;
let startY = 0;
const swipeThreshold = 60;
const swipeDownThreshold = 60;

storyPopup.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    storyPopup.style.transition = 'none';
    // Pause auto-navigation during touch
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }
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
        // Horizontal swipe for user navigation
        storyPopupContent.style.transform = `translateX(${deltaX / 2}px)`;
        e.preventDefault();
    }
});

storyPopup.addEventListener('touchend', (e) => {
    const currentX = e.changedTouches[0].clientX;
    const currentY = e.changedTouches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
        // Vertical swipe down to close
        hideStoryPopup();
    } else if (Math.abs(deltaX) > swipeThreshold) {
        storyPopupContent.style.transition = 'transform 0.15s linear';
        if (deltaX > 0 && currentStoryIndex > 0) {
            // Swipe right: previous user's first story
            const prevIndex = currentStoryIndex - 1;
            showStoryPopup(stories[prevIndex], prevIndex, 0, 'prev');
        } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
            // Swipe left: next user's first story
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 0, 'next');
        } else {
            storyPopupContent.style.transform = 'translateX(0)';
            // Resume auto-navigation
            resumeAutoNavigation();
        }
    } else {
        storyPopup.style.transition = 'transform 0.3s ease-in-out';
        storyPopupContent.style.transition = 'transform 0.15s linear';
        storyPopup.style.transform = 'translateY(0)';
        storyPopupContent.style.transform = 'translateX(0)';
        // Resume auto-navigation
        resumeAutoNavigation();
    }
});

// Function to resume auto-navigation
function resumeAutoNavigation() {
    const currentStory = stories[currentStoryIndex];
    const contents = currentStory.content;
    const storyCount = contents.length || 1;
    const duration = storyCount <= 5 ? 5000 : 8000;
    progressTimeout = setTimeout(() => {
        if (currentInternalStoryIndex < contents.length - 1) {
            showStoryPopup(currentStory, currentStoryIndex, currentInternalStoryIndex + 1, 'internal');
        } else if (currentStory.isYourStory || currentStoryIndex === stories.length - 1) {
            hideStoryPopup();
        } else {
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 0, 'next');
        }
    }, duration);

    // Restart active progress bar
    const activeProgressBar = progressBarContainer.querySelector('.progress-bar.active .progress-bar-inner');
    if (activeProgressBar) {
        activeProgressBar.style.transition = `width ${duration}ms linear`;
        activeProgressBar.style.opacity = '1';
        activeProgressBar.style.width = '0';
        setTimeout(() => {
            activeProgressBar.style.width = '100%';
        }, 10);
    }
}
