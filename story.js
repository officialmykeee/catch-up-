// 🔥 Create story popup dynamically
const storyPopup = document.createElement("div");
storyPopup.id = "storyPopup";
storyPopup.className = "story-popup hidden";

// Create the content container
const storyContentDiv = document.createElement("div");
storyContentDiv.className = "story-popup-content";

// Add static curved placeholder card
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
    // Reset with curved placeholder card
    storyContentDiv.innerHTML = '<div class="story-popup-placeholder"></div>';

    // Show popup
    storyPopup.classList.remove('hidden');
    setTimeout(() => {
        storyPopup.classList.add('active');
    }, 10);

    // Fetch story content
    const content = await fetchStoryContent(story.id);

    // Replace placeholder with real content
    let contentHtml = '';
    if (content.type === 'image') {
        contentHtml = `<img src="${content.src}" alt="Story image" style="border-radius:20px;max-width:100%;max-height:100%;">`;
    } else if (content.type === 'video') {
        contentHtml = `<video src="${content.src}" controls autoplay style="border-radius:20px;max-width:100%;max-height:100%;"></video>`;
    } else if (content.type === 'text') {
        contentHtml = `<div class="story-popup-placeholder"><p>${content.text}</p></div>`;
    }
    storyContentDiv.innerHTML = contentHtml;
}

