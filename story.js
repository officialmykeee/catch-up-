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
    
// Function to hide the story pop-up
function hideStoryPopup() {
    storyPopup.classList.remove('active');
    setTimeout(() => {
        storyPopup.classList.add('hidden');
        storyPopup.style.transform = ''; // Reset transform
    }, 300);
}

// Smoother drag-down logic
let startY = 0;
const swipeThreshold = 60; // Increased threshold for a deliberate swipe

storyPopup.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    // Temporarily disable CSS transition for smooth real-time dragging
    storyPopup.style.transition = 'none';
});

storyPopup.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Only allow swiping down
    if (deltaY > 0) {
        // Visually slide the pop-up down as the finger moves
        storyPopup.style.transform = `translateY(${deltaY}px)`;
        
        // Prevent default browser behavior (e.g., pull-to-refresh)
        e.preventDefault();
    }
});

storyPopup.addEventListener('touchend', (e) => {
    // Re-enable CSS transition for the snap-back effect
    storyPopup.style.transition = 'transform 0.3s ease-in-out';
    
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY;

    if (deltaY > swipeThreshold) {
        // If swipe distance is past threshold, hide the pop-up
        hideStoryPopup();
    } else {
        // Otherwise, snap it back to the top
        storyPopup.style.transform = 'translateY(0)';
    }
});

