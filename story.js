const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const progressBar = document.querySelector('.progress-bar');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
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
    } else if (direction === 'internal') {
        // Subtle fade for internal story transitions
        storyPopupContent.style.opacity = '0';
        setTimeout(() => {
            storyPopupContent.style.transition = 'none';
            storyPopupContent.style.opacity = '1';
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
    if (contents.length > 0 && contents[currentInternalStoryIndex]) {
        if (contents[currentInternalStoryIndex].type === 'image') {
            contentHtml = `<img src="${contents[currentInternalStoryIndex].src}" alt="Story image" class="story-image">`;
        } else if (contents[currentInternalStoryIndex].type === 'video') {
            contentHtml = `<video src="${contents[currentInternalStoryIndex].src}" controls autoplay class="story-video"></video>`;
        } else if (contents[currentInternalStoryIndex].type === 'text') {
            contentHtml = `<p class="story-text">${contents[currentInternalStoryIndex].text}</p>`;
        }
    } else {
        contentHtml = `<p class="story-text">No content available</p>`;
    }
    storyContentDiv.innerHTML = contentHtml;

    // Start progress bar after loading completes
    progressBar.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 10);

    // Handle auto-navigation after progress bar fills
    progressTimeout = setTimeout(() => {
        if (currentInternalStoryIndex < contents.length - 1) {
            // Move to next internal story
            showStoryPopup(story, currentStoryIndex, currentInternalStoryIndex + 1, 'internal');
        } else if (story.isYourStory || currentStoryIndex === stories.length - 1) {
            // Close if "Your story" or last user's last story
            hideStoryPopup();
        } else {
            // Move to next user's first story
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
        progressBar.style.transition = 'none';
        progressBar.style.width = '0';
        loadingRing.classList.add('hidden');
        storyContentDiv.innerHTML = '';
        storyPopupContent.style.transform = 'translateX(0)';
        storyPopupContent.style.opacity = '1';
    }, 300);
}

// Tap navigation for internal stories and user transitions
storyPopup.addEventListener('click', (e) => {
    if (e.target === storyPopup || e.target.classList.contains('story-content')) {
        const rect = storyPopup.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const halfWidth = rect.width / 2;

        const currentStory = stories[currentStoryIndex];
        const contents = currentStory.content;

        if (tapX < halfWidth) {
            // Tap left: previous internal story or previous user
            if (currentInternalStoryIndex > 0) {
                // Previous internal story
                showStoryPopup(currentStory, currentStoryIndex, currentInternalStoryIndex - 1, 'internal');
            } else if (currentStoryIndex > 0) {
                // Previous user's first story
                const prevIndex = currentStoryIndex - 1;
                showStoryPopup(stories[prevIndex], prevIndex, 0, 'prev');
            }
        } else {
            // Tap right: next internal story, next user, or close
            if (currentInternalStoryIndex < contents.length - 1) {
                // Next internal story
                showStoryPopup(currentStory, currentStoryIndex, currentInternalStoryIndex + 1, 'internal');
            } else if (currentStoryIndex < stories.length - 1) {
                // Next user's first story
                const nextIndex = currentStoryIndex + 1;
                showStoryPopup(stories[nextIndex], nextIndex, 0, 'next');
            } else {
                // Close if last user's last story
                hideStoryPopup();
            }
        }
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
        }
    } else {
        storyPopup.style.transition = 'transform 0.3s ease-in-out';
        storyPopupContent.style.transition = 'transform 0.15s linear';
        storyPopup.style.transform = 'translateY(0)';
        storyPopupContent.style.transform = 'translateX(0)';
    }
});
    
