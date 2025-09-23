// 🔥 Create story popup dynamically
const storyPopup = document.createElement("div");
storyPopup.id = "storyPopup";
storyPopup.className = "story-popup hidden";

// Create the content container
const storyContentDiv = document.createElement("div");
storyContentDiv.className = "story-popup-content";

// Add static curved placeholder
const placeholderDiv = document.createElement("div");
placeholderDiv.className = "story-popup-placeholder";
storyContentDiv.appendChild(placeholderDiv);

// Append content container into popup
storyPopup.appendChild(storyContentDiv);

// Append popup into body
document.body.appendChild(storyPopup);

// ------------------------------
// Function to fetch story content
// ------------------------------
async function fetchStoryContent(storyId) {
    const story = stories.find(s => s.id === storyId);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(story.content);
        }, 500); // Simulate network delay
    });
}

// ------------------------------
// Function to show story popup
// ------------------------------
async function showStoryPopup(story) {
    // Reset with curved placeholder
    storyContentDiv.innerHTML = '<div class="story-popup-placeholder"></div>';

    // Show popup
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    // Fetch story content
    const content = await fetchStoryContent(story.id);

    // Replace placeholder with content
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

// ------------------------------
// Function to hide story popup
// ------------------------------
function hideStoryPopup() {
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = ''; // Reset transform
    }, 300);
}

// ------------------------------
// Swipe down to dismiss logic
// ------------------------------
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

