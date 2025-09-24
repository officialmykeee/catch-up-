const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const progressBar = document.querySelector('.progress-bar');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
let progressTimeout = null;
let currentStoryIndex = 0;
let isDragging = false;
let progressStartTime = 0;
let progressDuration = 0;

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
    progressDuration = storyCount <= 5 ? 5000 : 8000;
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
    storyContentDiv.innerHTML = contentHtml;

    // Start progress bar after loading completes
    progressBar.style.transition = `width ${progressDuration}ms linear`;
    progressStartTime = Date.now();
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
    }, progressDuration);
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
        isDragging = false;
    }, 300);
}

// Twitter Fleets-style navigation
storyPopup.addEventListener('click', (e) => {
    if (e.target === storyPopup || e.target.classList.contains('story-content')) {
        const rect = storyPopup.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const halfWidth = rect.width / 2;

        if (!isDragging) {
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
    }
});

// Drag control navigation
let startX = 0;
let startY = 0;
const swipeThreshold = 0.3 * window.innerWidth; // 30% of screen width
const swipeDownThreshold = 60;

storyPopup.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    storyPopup.style.transition = 'none';
    storyPopupContent.style.transition = 'none';
    isDragging = true;

    // Pause progress bar
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min(elapsed / progressDuration, 1);
        progressBar.style.transition = 'none';
        progressBar.style.width = `${progress * 100}%`;
    }
});

storyPopup.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Prioritize vertical swipe for closing
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
        storyPopup.style.transform = `translateY(${deltaY}px)`;
        storyPopupContent.style.transform = 'translateX(0)';
        e.preventDefault();
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal drag: content follows finger
        storyPopupContent.style.transform = `translateX(${deltaX}px)`;
        storyPopup.style.transform = 'translateY(0)';
        e.preventDefault();
    }
});

storyPopup.addEventListener('touchend', (e) => {
    if (!isDragging) return;

    const currentX = e.changedTouches[0].clientX;
    const currentY = e.changedTouches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    isDragging = false;
    storyPopup.style.transition = 'transform 0.3s ease-in-out';
    storyPopupContent.style.transition = 'transform 0.15s linear';

    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
        // Vertical swipe down to close
        hideStoryPopup();
    } else if (Math.abs(deltaX) > swipeThreshold) {
        // Horizontal drag: navigate if threshold met
        if (deltaX > 0 && currentStoryIndex > 0) {
            // Drag right: previous story (right-to-left)
            const prevIndex = currentStoryIndex - 1;
            showStoryPopup(stories[prevIndex], prevIndex, 'prev');
        } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
            // Drag left: next story (left-to-right)
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 'next');
        } else {
            // Snap back
            storyPopupContent.style.transform = 'translateX(0)';
            resumeProgressBar();
        }
    } else {
        // Snap back if drag not far enough
        storyPopupContent.style.transform = 'translateX(0)';
        storyPopup.style.transform = 'translateY(0)';
        resumeProgressBar();
    }
});

// Resume progress bar after drag
function resumeProgressBar() {
    if (progressTimeout) return; // Already running

    const currentWidth = parseFloat(progressBar.style.width) || 0;
    const remainingProgress = 1 - currentWidth / 100;
    const remainingTime = remainingProgress * progressDuration;

    progressBar.style.transition = `width ${remainingTime}ms linear`;
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 10);

    progressTimeout = setTimeout(() => {
        if (stories[currentStoryIndex].isYourStory || currentStoryIndex === stories.length - 1) {
            hideStoryPopup();
        } else {
            const nextIndex = currentStoryIndex + 1;
            showStoryPopup(stories[nextIndex], nextIndex, 'next');
        }
    }, remainingTime);
}
