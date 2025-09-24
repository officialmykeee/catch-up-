const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-popup-content .story-content');
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
    storyContentDiv.innerHTML = '<div class="story-popup-loader"></div>';
    progressBar.style.width = '0'; // Reset progress bar
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    const contents = await fetchStoryContent(story.id);
    const storyCount = contents.length || 1; // Default to 1 if no content
    const duration = storyCount <= 5 ? 5000 : 8000; // 5s for 1-5 stories, 8s for >5

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

    // Start progress bar animation
    progressBar.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 10);

    // Close popup after duration
    setTimeout(() => {
        hideStoryPopup();
    }, duration);
}

function hideStoryPopup() {
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
        progressBar.style.transition = 'none';
        progressBar.style.width = '0';
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
