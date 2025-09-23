// Function to show the story pop-up
const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = storyPopup.querySelector('.story-content');
const storyAvatarLg = storyPopup.querySelector('.story-avatar-lg');
const storyUsernameLg = storyPopup.querySelector('.story-username-lg');
const storyTimestampSm = storyPopup.querySelector('.story-timestamp-sm');
const progressBar = storyPopup.querySelector('.progress-bar');
const cubeInner = storyPopup.querySelector('.story-cube-inner');

let currentIndex = 0;
let currentAngle = 0;
let progressTimer;
const storyDuration = 5000; // 5s per story

// Placeholder for fetching content
async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story.content);
        }, 300); // Simulate network delay
    });
}

// Start progress bar
function startProgress(duration = storyDuration) {
    clearTimeout(progressTimer);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0';
    void progressBar.offsetWidth; // force reflow
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '100%';

    progressTimer = setTimeout(() => {
        showNextStory();
    }, duration);
}

// Load story into popup
async function showStoryPopup(story, index = 0) {
    currentIndex = index;

    // Set header details
    storyAvatarLg.src = story.avatar;
    storyUsernameLg.textContent = story.username;
    storyTimestampSm.textContent = story.timestamp || '';

    // Show popup
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    // Show loader
    storyContentDiv.innerHTML = '<div class="story-popup-loader"></div>';

    // Fetch and load content
    const content = await fetchStoryContent(story.id);

    let contentHtml = '';
    if (content.type === 'image') {
        contentHtml = `<img src="${content.src}" alt="Story image">`;
    } else if (content.type === 'video') {
        contentHtml = `<video src="${content.src}" autoplay muted playsinline></video>`;
    } else if (content.type === 'text') {
        contentHtml = `<p>${content.text}</p>`;
    }
    storyContentDiv.innerHTML = contentHtml;

    // Start progress
    startProgress();
}

// Hide story popup
function hideStoryPopup() {
    clearTimeout(progressTimer);
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
    }, 300);
}

// Next story (auto or swipe)
function showNextStory() {
    if (currentIndex < stories.length - 1) {
        currentIndex++;
        currentAngle -= 90;
        cubeInner.style.transform = `rotateY(${currentAngle}deg)`;
        showStoryPopup(stories[currentIndex], currentIndex);
    } else {
        hideStoryPopup();
    }
}

// Previous story (swipe)
function showPrevStory() {
    if (currentIndex > 0) {
        currentIndex--;
        currentAngle += 90;
        cubeInner.style.transform = `rotateY(${currentAngle}deg)`;
        showStoryPopup(stories[currentIndex], currentIndex);
    }
}

// --- Swipe handling (left/right for cube, down for close) ---
let startX = 0, startY = 0;
const swipeThreshold = 60;

storyPopup.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    storyPopup.style.transition = 'none';
});

storyPopup.addEventListener('touchmove', e => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Drag-down to close
    if (deltaY > 0) {
        storyPopup.style.transform = `translateY(${deltaY}px)`;
        e.preventDefault();
    }
});

storyPopup.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    storyPopup.style.transition = 'transform 0.3s ease-in-out';

    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < 50) {
        if (deltaX < 0) {
            showNextStory();
        } else {
            showPrevStory();
        }
    } else if (deltaY > swipeThreshold) {
        hideStoryPopup();
    } else {
        storyPopup.style.transform = 'translateY(0)';
    }
});
