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
let isNavigating = false;

const STORY_DURATION = 5000; // 5s

// --- Progress Management ---
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
        if (index < currentInternalStoryIndex) {
            bar.style.width = '100%';
        } else {
            bar.style.width = '0%';
        }
    });

    innerBar.offsetHeight; // force reflow
    innerBar.style.transition = `width ${STORY_DURATION}ms linear`;
    innerBar.style.width = '100%';

    progressTimeout = setTimeout(() => {
        nextStory();
    }, STORY_DURATION);
}

// --- Content Fetching & Rendering ---
async function fetchStoryContent(storyCard) {
    return new Promise(resolve => {
        setTimeout(() => resolve(storyCard), 300);
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

    // Reset like button when switching cards
    const likeButton = document.querySelector('.action-icon-btn.like-btn');
    if (likeButton) likeButton.classList.remove('liked');

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
            setTimeout(() => { bgImg.style.opacity = 1; }, 50);
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

// --- Popup & Navigation ---
function showStoryPopup(userStory, userIndex, internalIndex = 0, direction = 'none') {
    clearProgressTimeout();
    currentStoryIndex = userIndex;
    currentInternalStoryIndex = internalIndex;

    // Slide transitions for user navigation
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
        setTimeout(() => { storyPopup.classList.add('active'); }, 10);
    }

    // Re-render progress bars
    renderProgressBars(userStory.internalStories);

    // Add bottom bar if not present
    let bottomBar = storyPopupContent.querySelector('.bottom-bar');
    if (!bottomBar) {
        bottomBar = document.createElement('div');
        bottomBar.className = 'bottom-bar';
        bottomBar.innerHTML = `
            <div class="reply-input-container">
                <input type="text" class="reply-input" placeholder="Reply..." />
            </div>
            <div class="heart-container">
                <button class="action-icon-btn like-btn">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </g>
                    </svg>
                </button>
            </div>
        `;
        storyPopupContent.appendChild(bottomBar);

        // Heart toggle
        const likeBtn = bottomBar.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
        });
    }

    const currentStoryCard = userStory.internalStories[currentInternalStoryIndex];
    if (!currentStoryCard) return hideStoryPopup();

    if (currentStoryCard.type === 'text') loadingRing.classList.add('hidden');
    fetchStoryContent(currentStoryCard).then(content => renderContent(content));
}

// --- Navigation Helpers ---
function nextStory() {
    const stories = window.stories || [];
    if (isNavigating || stories.length === 0) return;
    isNavigating = true;

    clearProgressTimeout();
    const currentUserStory = stories[currentStoryIndex]; 

    if (currentInternalStoryIndex < currentUserStory.internalStories.length - 1) {
        showStoryPopup(currentUserStory, currentStoryIndex, currentInternalStoryIndex + 1, 'next-internal');
    } else if (currentStoryIndex < stories.length - 1) {
        showStoryPopup(stories[currentStoryIndex + 1], currentStoryIndex + 1, 0, 'next-user');
    } else {
        hideStoryPopup();
    }
    setTimeout(() => { isNavigating = false; }, 200);
}

function prevStory() {
    const stories = window.stories || [];
    if (isNavigating || stories.length === 0) return;
    isNavigating = true;

    clearProgressTimeout();
    const currentUserStory = stories[currentStoryIndex]; 

    if (currentInternalStoryIndex > 0) {
        showStoryPopup(currentUserStory, currentStoryIndex, currentInternalStoryIndex - 1, 'prev-internal');
    } else if (currentStoryIndex > 0) {
        const prevUserStory = stories[currentStoryIndex - 1];
        const lastInternalIndex = prevUserStory.internalStories.length - 1;
        showStoryPopup(prevUserStory, currentStoryIndex - 1, lastInternalIndex, 'prev-user');
    }
    setTimeout(() => { isNavigating = false; }, 200);
}

function hideStoryPopup() {
    clearProgressTimeout();
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
        storyContentDiv.innerHTML = '';
        const bgLayer = document.querySelector('.story-content .story-background-layer');
        if (bgLayer) bgLayer.remove();
        storyPopupContent.style.transform = 'translateX(0)';
        loadingRing.classList.add('hidden');
        multiProgressBar.innerHTML = ''; 
        const likeButton = document.querySelector('.action-icon-btn.like-btn');
        if (likeButton) likeButton.classList.remove('liked');
    }, 300);
}

// --- Event Listeners ---
if (navNextInternal) navNextInternal.addEventListener('click', nextStory);
if (navPrevInternal) navPrevInternal.addEventListener('click', prevStory);

let startX = 0, startY = 0;
const swipeThreshold = 60, swipeDownThreshold = 60;

if (storyPopup) {
    storyPopup.addEventListener('touchstart', (e) => {
        if (e.target.closest('.bottom-bar')) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        storyPopup.style.transition = 'none';
        clearProgressTimeout();
    });

    storyPopup.addEventListener('touchmove', (e) => {
        if (e.target.closest('.bottom-bar')) return;
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
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
        if (e.target.closest('.bottom-bar')) {
            startProgressBar(); 
            return;
        }
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;

        storyPopup.style.transition = 'transform 0.3s ease-in-out';
        storyPopupContent.style.transition = 'transform 0.15s linear';
        
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
            hideStoryPopup(); return;
        }
        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0 && currentStoryIndex > 0) {
                const prevUserStory = window.stories[currentStoryIndex - 1];
                const lastInternalIndex = prevUserStory.internalStories.length - 1;
                showStoryPopup(prevUserStory, currentStoryIndex - 1, lastInternalIndex, 'prev-user');
                return;
            } else if (deltaX < 0 && currentStoryIndex < (window.stories ? window.stories.length - 1 : 0)) {
                showStoryPopup(window.stories[currentStoryIndex + 1], currentStoryIndex + 1, 0, 'next-user');
                return;
            }
        }
        storyPopup.style.transform = 'translateY(0)';
        storyPopupContent.style.transform = 'translateX(0)';
        startProgressBar();
    });
}
