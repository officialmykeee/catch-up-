const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-popup-content .story-content');
const progressBar = document.querySelector('.progress-bar');
const loadingRing = document.querySelector('.story-popup-content .telegram-ring');
let progressTimeout = null;

async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story && story.content ? story.content : []);
        }, 500);
    });
}

async function showStoryPopup(story) {
    // Clear any existing timeout to prevent glitches
    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
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

    // Render content
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
    storyContentDiv.innerHTML = contentHtml;

    // Start progress bar after loading completes
    progressBar.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 10);

    // Close popup after duration
    progressTimeout = setTimeout(() => {
        hideStoryPopup();
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
    }, 300);
}

let startY = 0;
const swipeThreshold = 60;

storyPopup.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    storyPopup.style.transition = 'none';
});

storyPopup.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
        storyPopup.style.transform = `translateY(${deltaY}px)`;
        e.preventDefault();
    }
});

storyPopup.addEventListener('touchend', (e) => {
    storyPopup.style.transition = 'transform 0.3s ease-in-out';
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY;
    if (deltaY > swipeThreshold) {
        hideStoryPopup();
    } else {
        storyPopup.style.transform = 'translateY(0)';
    }
});

storyPopup.addEventListener('click', (e) => {
    if (e.target === storyPopup) {
        hideStoryPopup();
    }
});
