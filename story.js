const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-popup-content .story-content');
const storySkeleton = document.querySelector('.story-skeleton');
const progressBar = document.querySelector('.progress-bar');

async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story && story.content ? story.content : []);
        }, 500);
    });
}

async function showStoryPopup(story) {
    // Show skeleton loader
    storySkeleton.classList.remove('hidden');
    storyContentDiv.innerHTML = '';
    progressBar.style.width = '0';
    progressBar.style.transition = 'none';
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    const contents = await fetchStoryContent(story.id);
    const storyCount = contents.length || 1;
    const duration = storyCount <= 5 ? 5000 : 8000;

    // Hide skeleton and show content
    storySkeleton.classList.add('hidden');
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

    // Start progress bar after content is loaded
    let startTime = Date.now();
    let paused = false;
    let progressTimer;

    function startProgress() {
        const elapsed = paused ? (Date.now() - startTime) : 0;
        const remainingTime = duration - elapsed;
        if (remainingTime <= 0) {
            hideStoryPopup();
            return;
        }
        progressBar.style.transition = `width ${remainingTime}ms linear`;
        progressBar.style.width = `${(elapsed / duration) * 100}%`;
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 10);
        progressTimer = setTimeout(hideStoryPopup, remainingTime);
    }

    startProgress();

    // Handle swipe pause/resume
    storyPopup.addEventListener('touchstart', handleTouchStart, { once: true });
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        storyPopup.style.transition = 'none';
        paused = true;
        clearTimeout(progressTimer);
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        progressBar.style.transition = 'none';
        progressBar.style.width = `${currentWidth}%`;
    }

    storyPopup.addEventListener('touchmove', handleTouchMove, { once: true });
    function handleTouchMove(e) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > 0) {
            storyPopup.style.transform = `translateY(${deltaY}px)`;
            e.preventDefault();
        }
    }

    storyPopup.addEventListener('touchend', handleTouchEnd, { once: true });
    function handleTouchEnd(e) {
        storyPopup.style.transition = 'transform 0.3s ease-in-out';
        const endY = e.changedTouches[0].clientY;
        const deltaY = endY - startY;
        if (deltaY > swipeThreshold) {
            hideStoryPopup();
        } else {
            storyPopup.style.transform = 'translateY(0)';
            paused = false;
            startTime = Date.now() - ((parseFloat(progressBar.style.width) || 0) / 100) * duration;
            startProgress();
        }
        // Reattach event listeners
        storyPopup.addEventListener('touchstart', handleTouchStart, { once: true });
        storyPopup.addEventListener('touchmove', handleTouchMove, { once: true });
        storyPopup.addEventListener('touchend', handleTouchEnd, { once: true });
    }
}

function hideStoryPopup() {
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
        progressBar.style.transition = 'none';
        progressBar.style.width = '0';
        storySkeleton.classList.add('hidden');
    }, 300);
}

let startY = 0;
const swipeThreshold = 60;

storyPopup.addEventListener('click', (e) => {
    if (e.target === storyPopup) {
        hideStoryPopup();
    }
});
