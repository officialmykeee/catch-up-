// --- CRITICAL FIX: Expose the main function at the top for use by HTML-side listeners ---
window.showStoryPopup = showStoryPopup;

/**
 * Utility function to approximate a dominant color from a small area of an image.
 * Note: Requires the image to be served with CORS headers if from a different domain.
 * @param {HTMLImageElement} imgElement - The loaded image element.
 * @returns {string|null} The dominant color as a CSS rgb() string or null if failed.
 */
function getDominantColor(imgElement) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 50;
        const height = canvas.height = 50;
        ctx.drawImage(imgElement, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
            count++;
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        return `rgb(${r}, ${g}, ${b})`;
    } catch (e) {
        return null;
    }
}

// --- Global Variables ---
let storyPopup, storyContentDiv, loadingRing;
let progressContainer, progressBar;
let currentStoryIndex = 0;
let stories = [];
let progressTimer, progressDuration = 5000;

// --- Initialize Story Popup ---
document.addEventListener('DOMContentLoaded', () => {
    storyPopup = document.getElementById('storyPopup');
    storyContentDiv = document.getElementById('storyContent');
    loadingRing = document.getElementById('loadingRing');
    progressContainer = document.getElementById('progressContainer');
    progressBar = document.getElementById('progressBar');

    document.getElementById('storyClose')?.addEventListener('click', closeStoryPopup);
    document.getElementById('storyPrev')?.addEventListener('click', showPrevStory);
    document.getElementById('storyNext')?.addEventListener('click', showNextStory);
});

// --- Show Popup with Stories ---
function showStoryPopup(storyList, startIndex = 0) {
    stories = storyList;
    currentStoryIndex = startIndex;
    if (storyPopup) {
        storyPopup.classList.add('active');
        renderContent(stories[currentStoryIndex]);
    }
}

// --- Close Popup ---
function closeStoryPopup() {
    storyPopup.classList.remove('active');
    stopProgressBar();
    storyContentDiv.innerHTML = '';
}

// --- Navigation ---
function showPrevStory() {
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        renderContent(stories[currentStoryIndex]);
    }
}

function showNextStory() {
    if (currentStoryIndex < stories.length - 1) {
        currentStoryIndex++;
        renderContent(stories[currentStoryIndex]);
    } else {
        closeStoryPopup();
    }
}

// --- Render Story Content ---
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

            // --- Aspect ratio detection ---
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const viewportRatio = window.innerWidth / window.innerHeight;
            const ratioDiff = Math.abs(imgRatio - viewportRatio);

            if (ratioDiff > 0.2) {
                // Image does not fit → blurred background with contain
                img.style.objectFit = 'contain';
                bgImg.style.display = 'block';
                bgLayer.style.filter = 'blur(20px) brightness(0.7)';
            } else {
                // Image fits viewport → cover, no blur
                img.style.objectFit = 'cover';
                bgImg.style.display = 'none';
                bgLayer.style.filter = 'none';
                bgLayer.style.backgroundColor = '#000';
            }

            // Optional: fallback dominant color
            const dominantColor = getDominantColor(img);
            if (dominantColor) bgLayer.style.backgroundColor = dominantColor;

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
        video.autoplay = true;
        video.controls = true;
        video.playsInline = true;
        video.className = 'story main';

        const bgVideo = document.createElement('video');
        bgVideo.src = storyCard.src;
        bgVideo.autoplay = true;
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.playsInline = true;
        bgVideo.className = 'story-bg';

        bgLayer.appendChild(bgVideo);
        storyContentDiv.appendChild(video);

        video.onloadeddata = () => {
            loadingRing.classList.add('hidden');
            video.play().catch(() => {});
            startProgressBar(video.duration * 1000 || progressDuration);
        };

        video.onerror = () => {
            loadingRing.classList.add('hidden');
            storyContentDiv.innerHTML = `<p class="story-text">Error loading video</p>`;
            bgLayer.style.backgroundColor = '#222';
            startProgressBar();
        };

    } else if (storyCard.type === 'text') {
        storyContentDiv.innerHTML = `<p class="story-text">${storyCard.text}</p>`;
        bgLayer.style.backgroundColor = storyCard.bg || '#333';
        startProgressBar();
    }
}

// --- Progress Bar Control ---
function startProgressBar(duration = progressDuration) {
    stopProgressBar();
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '100%';

    progressTimer = setTimeout(showNextStory, duration);
}

function stopProgressBar() {
    clearTimeout(progressTimer);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
}
