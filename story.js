const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-popup-content');

async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story && story.content ? story.content : null);
        }, 500);
    });
}

async function showStoryPopup(story) {
    storyContentDiv.innerHTML = '<div class="story-popup-loader"></div>';
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    const content = await fetchStoryContent(story.id);
    
    let contentHtml = '';
    if (content && content.type === 'image') {
        contentHtml = `<img src="${content.src}" alt="Story image" class="story-image">`;
    } else if (content && content.type === 'video') {
        contentHtml = `<video src="${content.src}" controls autoplay class="story-video"></video>`;
    } else if (content && content.type === 'text') {
        contentHtml = `<p class="story-text">${content.text}</p>`;
    } else {
        contentHtml = `<p class="story-text">No content available</p>`;
    }
    storyContentDiv.innerHTML = contentHtml;
}

function hideStoryPopup() {
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = '';
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
