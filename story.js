

// Expose the main function at the top
window.showStoryPopup = showStoryPopup;

/**
 * Utility function to approximate a dominant color from a small area of an image.
 * @param {HTMLImageElement} imgElement - The loaded image element.
 * @returns {string|null} The dominant color as an RGB string, or null on error.
 */
function getDominantColor(imgElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!imgElement.complete || imgElement.naturalWidth === 0) return null;

    try {
        canvas.width = 1;
        canvas.height = 1;
        context.drawImage(imgElement, 0, 0, 1, 1);
        const data = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    } catch (e) {
        console.warn('Could not read image data for color extraction. Likely CORS issue.', e);
        return null;
    }
}

// Global Element References
const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
const multiProgressBar = document.getElementById('multiProgressBar');
const navPrevInternal = document.getElementById('navPrevInternal');
const navNextInternal = document.getElementById('navNextInternal');

// Global State
let progressTimeout = null;
let currentStoryIndex = 0;
let currentInternalStoryIndex = 0;
let isNavigating = false;
const STORY_DURATION = 5000;

// Progress Management
function clearProgressTimeout() {
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }
}

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
    document.querySelectorAll('.progress-bar-segment').forEach((segment, index) => {
        const bar = segment.querySelector('.progress-bar-inner');
        bar.style.transition = 'none';
        bar.style.width = index < currentInternalStoryIndex ? '100%' : '0%';
    });

    innerBar.offsetHeight; // Force reflow
    innerBar.style.transition = `width ${STORY_DURATION}ms linear`;
    innerBar.style.width = '100%';

    progressTimeout = setTimeout(() => {
        nextStory();
    }, STORY_DURATION);
}

// Content Fetching & Rendering
async function fetchStoryContent(storyCard) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(storyCard);
        }, 300);
    });
}

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
            storyContentDiv.innerHTML = `<p class="story-text">Error loading image</p>`;
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
            storyContentDiv.innerHTML = `<p class="story-text">Error loading video</p>`;
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

// Main Popup/Navigation Function
function showStoryPopup(userStory, userIndex, internalIndex = 0, direction = 'none') {
    if (!storyPopup) {
        console.error('Story popup element not found');
        return;
    }

    clearProgressTimeout();
    currentStoryIndex = userIndex;
    currentInternalStoryIndex = internalIndex;

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

    if (direction === 'none') {
        loadingRing.classList.remove('hidden');
        storyPopup.classList.remove('hidden');
        setTimeout(() => {
            storyPopup.classList.add('active');
        }, 10);
    }

    renderProgressBars(userStory.internalStories);
    const currentStoryCard = userStory.internalStories[currentInternalStoryIndex];
    if (!currentStoryCard) return hideStoryPopup();

    if (currentStoryCard.type === 'text') {
        loadingRing.classList.add('hidden');
    }

    fetchStoryContent(currentStoryCard).then(content => {
        renderContent(content);
    });
}

// Navigation Helpers
function nextStory() {
    if (isNavigating) return;
    isNavigating = true;

    clearProgressTimeout();
    const currentUserStory = window.stories[currentStoryIndex];

    if (currentInternalStoryIndex < currentUserStory.internalStories.length - 1) {
        showStoryPopup(currentUserStory, currentStoryIndex, currentInternalStoryIndex + 1, 'next-internal');
    } else if (currentStoryIndex < window.stories.length - 1) {
        showStoryPopup(window.stories[currentStoryIndex + 1], currentStoryIndex + 1, 0, 'next-user');
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
        showStoryPopup(currentUserStory, currentStoryIndex, currentInternalStoryIndex - 1, 'prev-internal');
    } else if (currentStoryIndex > 0) {
        const prevUserStory = window.stories[currentStoryIndex - 1];
        const lastInternalIndex = prevUserStory.internalStories.length - 1;
        showStoryPopup(prevUserStory, currentStoryIndex - 1, lastInternalIndex, 'prev-user');
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

// Event Listeners
function initStoryListeners() {
    if (navNextInternal) navNextInternal.addEventListener('click', nextStory);
    if (navPrevInternal) navPrevInternal.addEventListener('click', prevStory);

    if (storyPopup) {
        storyPopup.addEventListener('touchstart', (e) => {
            if (!storyPopup.classList.contains('active')) return; // Only handle when active
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            storyPopup.style.transition = 'none';
            clearProgressTimeout();
        });

        storyPopup.addEventListener('touchmove', (e) => {
            if (!storyPopup.classList.contains('active')) return;
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
            if (!storyPopup.classList.contains('active')) return;
            const currentX = e.changedTouches[0].clientX;
            const currentY = e.changedTouches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            storyPopup.style.transition = 'transform 0.3s ease-in-out';
            storyPopupContent.style.transition = 'transform 0.15s linear';

            if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 60) {
                hideStoryPopup();
                return;
            }

            if (Math.abs(deltaX) > 60) {
                if (deltaX > 0 && currentStoryIndex > 0) {
                    const prevUserStory = window.stories[currentStoryIndex - 1];
                    const lastInternalIndex = prevUserStory.internalStories.length - 1;
                    showStoryPopup(prevUserStory, currentStoryIndex - 1, lastInternalIndex, 'prev-user');
                    return;
                } else if (deltaX < 0 && currentStoryIndex < window.stories.length - 1) {
                    showStoryPopup(window.stories[currentStoryIndex + 1], currentStoryIndex + 1, 0, 'next-user');
                    return;
                }
            }

            storyPopup.style.transform = 'translateY(0)';
            storyPopupContent.style.transform = 'translateX(0)';
            startProgressBar();
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (!storyPopup || !storyContentDiv || !loadingRing || !storyPopupContent || !multiProgressBar) {
        console.error('Missing story elements:', {
            storyPopup: !!storyPopup,
            storyContentDiv: !!storyContentDiv,
            loadingRing: !!loadingRing,
            storyPopupContent: !!storyPopupContent,
            multiProgressBar: !!multiProgressBar
        });
        return;
    }
    initStoryListeners();
});
