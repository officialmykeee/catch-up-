window.showStoryPopup = showStoryPopup;

// --- Global Variables ---
let storyPopup, storyContentDiv, loadingRing;
let progressContainer, progressBar;
let currentStoryIndex = 0;
let stories = [];
let progressTimer, progressDuration = 5000;

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

// --- Show Popup ---
function showStoryPopup(storyList, startIndex = 0) {
    stories = storyList;
    currentStoryIndex = startIndex;
    if (storyPopup) {
        storyPopup.classList.add('active');
        renderContent(stories[currentStoryIndex]);
    }
}

function closeStoryPopup() {
    storyPopup?.classList.remove('active');
    stopProgressBar();
    if (storyContentDiv) storyContentDiv.innerHTML = '';
}

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

function renderContent(storyCard) {
    if (!storyContentDiv) return;
    storyContentDiv.innerHTML = '';

    const storyContentContainer = document.querySelector('.story-content');
    if (!storyContentContainer) return;

    let bgLayer = storyContentContainer.querySelector('.story-background-layer');
    if (bgLayer) bgLayer.remove();

    bgLayer = document.createElement('div');
    bgLayer.className = 'story-background-layer';
    storyContentContainer.prepend(bgLayer);

    if (storyCard.type === 'image') {
        loadingRing?.classList.remove('hidden');
        const img = document.createElement('img');
        img.src = storyCard.src;
        img.alt = 'Story image';
        img.className = 'main'; // matches your CSS
        storyContentDiv.appendChild(img);

        const bgImg = document.createElement('img');
        bgImg.src = storyCard.src;
        bgImg.alt = 'Blurred background';
        bgImg.className = 'story-bg';
        bgLayer.appendChild(bgImg);

        img.onload = () => {
            loadingRing?.classList.add('hidden');

            const imgRatio = img.naturalWidth / img.naturalHeight;
            const viewportRatio = window.innerWidth / window.innerHeight;
            const ratioDiff = Math.abs(imgRatio - viewportRatio);

            if (ratioDiff > 0.2) {
                img.style.objectFit = 'contain';
                bgImg.style.display = 'block';
                bgLayer.style.filter = 'blur(20px) brightness(0.7)';
            } else {
                img.style.objectFit = 'cover';
                bgImg.style.display = 'none';
                bgLayer.style.filter = 'none';
                bgLayer.style.backgroundColor = '#000';
            }

            setTimeout(() => {
                bgImg.style.opacity = 1;
            }, 50);

            startProgressBar();
        };

        img.onerror = () => {
            loadingRing?.classList.add('hidden');
            storyContentDiv.innerHTML = `<p class="story-text">Error loading image</p>`;
            bgLayer.style.backgroundColor = '#444';
            startProgressBar();
        };
    }

    else if (storyCard.type === 'video') {
        loadingRing?.classList.remove('hidden');
        const video = document.createElement('video');
        video.src = storyCard.src;
        video.autoplay = true;
        video.controls = true;
        video.playsInline = true;
        video.className = 'main';
        storyContentDiv.appendChild(video);

        const bgVideo = document.createElement('video');
        bgVideo.src = storyCard.src;
        bgVideo.autoplay = true;
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.playsInline = true;
        bgVideo.className = 'story-bg';
        bgLayer.appendChild(bgVideo);

        video.onloadeddata = () => {
            loadingRing?.classList.add('hidden');
            video.play().catch(() => {});
            startProgressBar(video.duration * 1000 || progressDuration);
        };

        video.onerror = () => {
            loadingRing?.classList.add('hidden');
            storyContentDiv.innerHTML = `<p class="story-text">Error loading video</p>`;
            bgLayer.style.backgroundColor = '#222';
            startProgressBar();
        };
    }

    else if (storyCard.type === 'text') {
        storyContentDiv.innerHTML = `<p class="story-text">${storyCard.text}</p>`;
        bgLayer.style.backgroundColor = storyCard.bg || '#333';
        startProgressBar();
    }
}

// --- Progress Bar ---
function startProgressBar(duration = progressDuration) {
    stopProgressBar();
    if (!progressBar) return;

    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '100%';

    progressTimer = setTimeout(showNextStory, duration);
}

function stopProgressBar() {
    clearTimeout(progressTimer);
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    }
}
