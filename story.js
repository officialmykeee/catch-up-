// story.js

// --- Global Functions and Event Handlers for Cleanup ---

// Function to handle the Escape key press
const handleEscape = (e) => {
    if (e.key === 'Escape') {
        closeStoryViewer();
    }
};

/**
 * Closes the story viewer and cleans up the DOM and event listeners.
 */
function closeStoryViewer() {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const replyContainer = document.querySelector('.story-reply-container');

    console.log('Closing story viewer');

    // Hide overlay and reset body scroll
    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';

    // Clean up dynamic elements and content
    storyViewerContent.src = '';
    if (replyContainer) replyContainer.remove();
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());

    // Remove the Escape key listener
    document.removeEventListener('keydown', handleEscape);
}

// Expose close for outside use
window.closeStoryViewer = closeStoryViewer;


// --- Main Open Function ---

/**
 * Opens the story viewer for a specific user.
 * @param {string} userId - The user ID whose stories should play.
 */
window.openStoryViewer = function (userId) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const closeThreshold = 20;

    // Get this user's stories from network.js mock
    const stories = storyDataMocks[userId];
    if (!stories || stories.length === 0) {
        console.error("No stories found for user:", userId);
        return;
    }

    let currentIndex = 0;

    // --- Function to show a story ---
    function showStory(index) {
        const story = stories[index];
        console.log(`Showing story ${story.id} (${index + 1}/${stories.length})`);

        // Reset image + blur
        storyViewerContent.src = '';
        storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());

        // Load story image
        storyViewerContent.src = story.content;

        // Apply object-fit + background blur if needed
        storyViewerContent.onload = () => {
            const isTall = storyViewerContent.naturalHeight > storyViewerContent.naturalWidth * 1.3;
            storyViewerContent.style.objectFit = isTall ? "cover" : "contain";

            if (!isTall) {
                const blurBg = document.createElement("div");
                blurBg.className = "story-blur-bg";
                blurBg.style.backgroundImage = `url(${story.content})`;
                storyCon.insertBefore(blurBg, storyViewerContent);
            }
        };

        // --- Reply & Like container ---
        let replyContainer = document.querySelector('.story-reply-container');
        let iconBtn;

        if (!replyContainer) {
            // Create reply container if not present
            replyContainer = document.createElement('div');
            replyContainer.className = 'story-reply-container';

            const replyDiv = document.createElement('div');
            replyDiv.className = 'story-reply';
            replyDiv.textContent = 'Reply privately...';

            iconBtn = document.createElement('div');
            iconBtn.className = 'story-reply-icon';
            iconBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" 
                    stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;

            // Like toggle logic
            iconBtn.addEventListener('click', () => {
                story.isLiked = !story.isLiked;
                iconBtn.classList.toggle('active', story.isLiked);
                const heartPath = iconBtn.querySelector('path');
                heartPath.setAttribute('fill', story.isLiked ? '#e1306c' : 'none');
                heartPath.setAttribute('stroke', story.isLiked ? '#e1306c' : '#9ca3af');
            });

            replyContainer.appendChild(replyDiv);
            replyContainer.appendChild(iconBtn);
            storyViewerOverlay.appendChild(replyContainer);

        } else {
            // Reuse existing
            iconBtn = replyContainer.querySelector('.story-reply-icon');
            const heartPath = iconBtn.querySelector('path');

            iconBtn.classList.toggle('active', story.isLiked);
            heartPath.setAttribute('fill', story.isLiked ? '#e1306c' : 'none');
            heartPath.setAttribute('stroke', story.isLiked ? '#e1306c' : '#9ca3af');
        }
    }

    // --- Navigation ---
    showStory(currentIndex);

    storyViewerContent.onclick = () => {
        if (currentIndex < stories.length - 1) {
            currentIndex++;
            showStory(currentIndex);
        } else {
            closeStoryViewer();
        }
    };

    // --- Drag-to-close ---
    let startY = 0;
    let isDragging = false;

    // Touch drag
    storyViewerContent.ontouchstart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    };
    storyViewerContent.ontouchmove = (e) => {
        if (!isDragging) return;
        if (e.touches[0].clientY - startY > closeThreshold) closeStoryViewer();
    };
    storyViewerContent.ontouchend = () => { isDragging = false; };

    // Mouse drag
    storyViewerContent.onmousedown = (e) => {
        startY = e.clientY;
        isDragging = true;
    };
    storyViewerContent.onmousemove = (e) => {
        if (!isDragging) return;
        if (e.clientY - startY > closeThreshold) closeStoryViewer();
    };
    storyViewerContent.onmouseup = () => { isDragging = false; };

    // Prevent scroll on overlay bg
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        if (e.target !== storyViewerContent) e.preventDefault();
    }, { passive: false });

    // Close on background click
    storyViewerOverlay.addEventListener('click', (e) => {
        if (e.target === storyViewerOverlay) closeStoryViewer();
    });

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Escape key
    document.addEventListener('keydown', handleEscape);
};
