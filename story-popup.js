// Function to show the story pop-up
const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = storyPopup.querySelector('.story-content');
const storyAvatarSm = storyPopup.querySelector('.story-avatar-sm');
const storyUsernameLg = storyPopup.querySelector('.story-username-lg');
const storyTimestampSm = storyPopup.querySelector('.story-timestamp-sm');

// This is a placeholder for fetching content from another page/API
async function fetchStoryContent(storyId) {
    // In a real app, you would fetch data from an API
    // For this example, we'll use the data already in the stories array.
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story.content);
        }, 500); // Simulate network delay
    });
}

async function showStoryPopup(story) {
    // Set header details
    storyAvatarSm.src = story.avatar;
    storyUsernameLg.textContent = story.username;
    storyTimestampSm.textContent = '';
    storyContentDiv.innerHTML = '<div class="story-popup-loader"></div>';

    // Show the pop-up
    storyPopup.classList.remove('hidden');
    // A short delay is needed for the CSS transition to work
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    // Fetch and load content
    const content = await fetchStoryContent(story.id);
    
    // Update the pop-up
    storyTimestampSm.textContent = content.timestamp;
    let contentHtml = '';
    if (content.type === 'image') {
        contentHtml = `<img src="${content.src}" alt="Story image">`;
    } else if (content.type === 'video') {
        contentHtml = `<video src="${content.src}" controls autoplay></video>`;
    } else if (content.type === 'text') {
        contentHtml = `<p>${content.text}</p>`;
    }
    storyContentDiv.innerHTML = contentHtml;
}

// Function to hide the story pop-up
function hideStoryPopup() {
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
    }, 300);
}

// Hand gesture (swipe down) logic
let startY = 0;
const swipeThreshold = 50;

storyPopup.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
});

storyPopup.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > swipeThreshold) {
        hideStoryPopup();
    }
});

