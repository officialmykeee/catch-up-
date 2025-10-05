// story.js

// --- Global Variables and State ---
let currentUserId = null;
let currentStoryData = [];
let currentStoryIndex = 0;
const STORY_DURATION = 5000; // 5 seconds per story

// Access storyDataMocks globally
const storyDataMocks = window.storyDataMocks || {
    "your-story": [
        { id: "your-story-status-1", content: "https://picsum.photos/id/1005/360/640", time: "Just Now", reply: "", isLiked: false },
        { id: "your-story-status-2", content: "https://picsum.photos/id/1006/360/640", time: "5 min ago", reply: "", isLiked: false }
    ],
    "1": [
        { id: "emily1", content: "https://picsum.photos/id/237/360/640", time: "Just Now", reply: "", isLiked: false },
        { id: "emily2", content: "https://picsum.photos/id/238/360/640", time: "10 min ago", reply: "", isLiked: false },
        { id: "emily3", content: "https://picsum.photos/id/239/360/640", time: "15 min ago", reply: "", isLiked: false }
    ],
    "2": [
        { id: "michael1", content: "https://picsum.photos/id/1018/360/640", time: "1 hour ago", reply: "", isLiked: false },
        { id: "michael2", content: "https://picsum.photos/id/1019/360/640", time: "2 hours ago", reply: "", isLiked: false }
    ],
    "3": [
        { id: "sarah1", content: "https://picsum.photos/id/1015/360/640", time: "2 hours ago", reply: "", isLiked: false }
    ],
    "4": [
        { id: "david1", content: "https://picsum.photos/id/1016/360/640", time: "3 hours ago", reply: "", isLiked: false },
        { id: "david2", content: "https://picsum.photos/id/1017/360/640", time: "4 hours ago", reply: "", isLiked: false }
    ],
    "5": [
        { id: "jessica1", content: "https://picsum.photos/id/1019/360/640", time: "4 hours ago", reply: "", isLiked: false },
        { id: "jessica2", content: "https://picsum.photos/id/1020/360/640", time: "5 hours ago", reply: "", isLiked: false }
    ]
};

// --- Helper Functions ---

/**
 * Updates the story viewer with the current story's content and resets progress bars.
 */
function updateStoryViewer() {
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const progressBarsContainer = document.querySelector('.story-progress-bars');
    const prevArea = document.querySelector('.story-nav-prev');

    // Reset existing content
    storyViewerContent.src = '';
    storyCon.querySelectorAll('.story-blur-bg, .story-gradient-overlay').forEach(el => el.remove());

    // Set new story content
    const currentStory = currentStoryData[currentStoryIndex];
    storyViewerContent.src = currentStory.content;

    // Handle image load for blur background and gradient overlay
    storyViewerContent.onload = () => {
        const isTall = storyViewerContent.naturalHeight > storyViewerContent.naturalWidth * 1.3;
        storyViewerContent.style.objectFit = isTall ? 'cover' : 'contain';

        if (!isTall) {
            const blurBg = document.createElement('div');
            blurBg.className = 'story-blur-bg';
            blurBg.style.backgroundImage = `url(${currentStory.content})`;
            storyCon.insertBefore(blurBg, storyViewerContent);
        }

        // Add gradient overlay for all images
        const gradientOverlay = document.createElement('div');
        gradientOverlay.className = 'story-gradient-overlay';
        storyCon.insertBefore(gradientOverlay, storyViewerContent);
    };

    // Update like button state
    const iconBtn = document.querySelector('.story-reply-icon');
    const heartPath = iconBtn.querySelector('path');
    iconBtn.classList.toggle('active', currentStory.isLiked);
    heartPath.setAttribute('fill', currentStory.isLiked ? '#e1306c' : 'none');
    heartPath.setAttribute('stroke', currentStory.isLiked ? '#e1306c' : '#9ca3af');

    // Update navigation visibility
    if (currentUserId === 'your-story' && currentStoryIndex === 0) {
        if (prevArea) prevArea.style.display = 'none'; // Hide prev navigation for first story of "Your story"
    } else {
        if (prevArea) prevArea.style.display = 'block'; // Show prev navigation for all other cases
    }

    // Update progress bars
    updateProgressBars();
}

/**
 * Updates progress bars for all stories and animates the current one.
 */
function updateProgressBars() {
    const progressBarsContainer = document.querySelector('.story-progress-bars');
    progressBarsContainer.innerHTML = ''; // Clear existing bars

    // Create a progress bar for each story
    currentStoryData.forEach((_, index) => {
        const barContainer = document.createElement('div');
        barContainer.className = 'progress-bar-container';
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        if (index < currentStoryIndex) {
            bar.classList.add('completed'); // Completed stories
        } else if (index === currentStoryIndex) {
            bar.classList.add('active'); // Current story
        }
        barContainer.appendChild(bar);
        progressBarsContainer.appendChild(barContainer);
    });

    // Start animation for the current progress bar
    const activeBar = progressBarsContainer.querySelector('.progress-bar.active');
    if (activeBar) {
        activeBar.style.animation = 'none'; // Reset animation
        void activeBar.offsetWidth; // Force reflow
        activeBar.style.animation = `progress ${STORY_DURATION}ms linear forwards`;

        // Schedule next story after animation completes
        clearTimeout(window.storyProgressTimeout);
        window.storyProgressTimeout = setTimeout(() => {
            goToNextStory();
        }, STORY_DURATION);
    }
}

/**
 * Navigates to the previous story or closes if at the start of "Your story".
 */
function goToPreviousStory() {
    clearTimeout(window.storyProgressTimeout); // Stop current timer
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        updateStoryViewer();
    } else if (currentUserId !== 'your-story') {
        // Navigate to previous user's last story
        const currentUserIndex = window.stories.findIndex(story => story.id === currentUserId);
        if (currentUserIndex > 0) { // Ensure not at the first user
            const prevUser = window.stories[currentUserIndex - 1];
            const prevUserStories = storyDataMocks[prevUser.id];
            if (prevUserStories && prevUserStories.length > 0) {
                currentUserId = prevUser.id;
                currentStoryData = prevUserStories;
                currentStoryIndex = prevUserStories.length - 1; // Start at last story
                updateStoryViewer();
            } else {
                closeStoryViewer();
            }
        } else {
            closeStoryViewer();
        }
    } else {
        closeStoryViewer();
    }
}

/**
 * Navigates to the next story or to the next user's first story.
 */
function goToNextStory() {
    clearTimeout(window.storyProgressTimeout); // Stop current timer
    if (currentStoryIndex < currentStoryData.length - 1) {
        currentStoryIndex++;
        updateStoryViewer();
    } else {
        // Navigate to next user's first story
        const currentUserIndex = window.stories.findIndex(story => story.id === currentUserId);
        if (currentUserIndex < window.stories.length - 1) {
            const nextUser = window.stories[currentUserIndex + 1];
            const nextUserStories = storyDataMocks[nextUser.id];
            if (nextUserStories && nextUserStories.length > 0) {
                currentUserId = nextUser.id;
                currentStoryData = nextUserStories;
                currentStoryIndex = 0;
                updateStoryViewer();
            } else {
                closeStoryViewer();
            }
        } else {
            closeStoryViewer();
        }
    }
}

/**
 * Closes the story viewer and cleans up.
 */
function closeStoryViewer() {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const replyContainer = document.querySelector('.story-reply-container');
    const progressBarsContainer = document.querySelector('.story-progress-bars');
    const prevArea = document.querySelector('.story-nav-prev');
    const nextArea = document.querySelector('.story-nav-next');

    console.log('Closing story viewer');

    // Stop progress animation
    clearTimeout(window.storyProgressTimeout);

    // Hide overlay and reset
    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';
    storyViewerContent.src = '';
    if (replyContainer) replyContainer.remove();
    if (progressBarsContainer) progressBarsContainer.remove();
    if (prevArea) prevArea.remove();
    if (nextArea) nextArea.remove();
    storyCon.querySelectorAll('.story-blur-bg, .story-gradient-overlay').forEach(el => el.remove());

    // Reset state
    currentUserId = null;
    currentStoryData = [];
    currentStoryIndex = 0;

    // Remove event listeners
    document.removeEventListener('keydown', handleEscape);
}

window.closeStoryViewer = closeStoryViewer;

// --- Event Handlers ---

const handleEscape = (e) => {
    if (e.key === 'Escape') {
        closeStoryViewer();
    }
};

/**
 * Opens the story viewer for a user’s stories.
 * @param {string} userId - The ID of the user.
 * @param {Array} storyData - Array of story objects for the user.
 * @param {number} startIndex - Starting story index.
 */
window.openStoryViewer = function (userId, storyData, startIndex = 0) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const closeThreshold = 20;

    console.log('Opening story for user:', userId, 'with stories:', storyData);

    // Set global state
    currentUserId = userId;
    currentStoryData = storyData;
    currentStoryIndex = startIndex;

    // Reset existing content
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    storyCon.querySelectorAll('.story-blur-bg, .story-gradient-overlay').forEach(el => el.remove());
    clearTimeout(window.storyProgressTimeout);

    // Create progress bars container inside storycon
    let progressBarsContainer = document.querySelector('.story-progress-bars');
    if (!progressBarsContainer) {
        progressBarsContainer = document.createElement('div');
        progressBarsContainer.className = 'story-progress-bars';
        storyCon.appendChild(progressBarsContainer);
    }

    // Create reply container
    let replyContainer = document.querySelector('.story-reply-container');
    let iconBtn;
    if (!replyContainer) {
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

        iconBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent navigation areas from capturing click
            console.log('Like button clicked for story:', currentStoryData[currentStoryIndex].id);
            iconBtn.classList.toggle('active');
            const heartPath = iconBtn.querySelector('path');
            const isActive = iconBtn.classList.contains('active');
            heartPath.setAttribute('fill', isActive ? '#e1306c' : 'none');
            heartPath.setAttribute('stroke', isActive ? '#e1306c' : '#9ca3af');
            currentStoryData[currentStoryIndex].isLiked = isActive;
        });

        replyContainer.appendChild(replyDiv);
        replyContainer.appendChild(iconBtn);
        storyViewerOverlay.appendChild(replyContainer);
    } else {
        iconBtn = replyContainer.querySelector('.story-reply-icon');
        const heartPath = iconBtn.querySelector('path');
        iconBtn.classList.toggle('active', currentStoryData[currentStoryIndex].isLiked);
        heartPath.setAttribute('fill', currentStoryData[currentStoryIndex].isLiked ? '#e1306c' : 'none');
        heartPath.setAttribute('stroke', currentStoryData[currentStoryIndex].isLiked ? '#e1306c' : '#9ca3af');
    }

    // Create navigation areas
    let prevArea = document.querySelector('.story-nav-prev');
    let nextArea = document.querySelector('.story-nav-next');
    if (!prevArea) {
        prevArea = document.createElement('div');
        prevArea.className = 'story-nav-area story-nav-prev';
        storyViewerOverlay.appendChild(prevArea);
        prevArea.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Previous navigation clicked');
            goToPreviousStory();
        });
    }
    if (!nextArea) {
        nextArea = document.createElement('div');
        nextArea.className = 'story-nav-area story-nav-next';
        storyViewerOverlay.appendChild(nextArea);
        nextArea.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Next navigation clicked');
            goToNextStory();
        });
    }

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Update viewer with initial story
    updateStoryViewer();

    // --- Drag and Close Logic ---
    let startY = 0;
    let isDragging = false;

    storyViewerContent.ontouchstart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    };
    storyViewerContent.ontouchmove = (e) => {
        if (!isDragging) return;
        if (e.touches[0].clientY - startY > closeThreshold) closeStoryViewer();
    };
    storyViewerContent.ontouchend = () => {
        isDragging = false;
    };

    storyViewerContent.onmousedown = (e) => {
        startY = e.clientY;
        isDragging = true;
    };
    storyViewerContent.onmousemove = (e) => {
        if (!isDragging) return;
        if (e.clientY - startY > closeThreshold) closeStoryViewer();
    };
    storyViewerContent.onmouseup = () => {
        isDragging = false;
    };

    storyViewerOverlay.addEventListener('touchmove', (e) => {
        if (e.target !== storyViewerContent) e.preventDefault();
    }, { passive: false });

    storyViewerOverlay.addEventListener('click', (e) => {
        if (e.target === storyViewerOverlay) closeStoryViewer();
    });

    document.addEventListener('keydown', handleEscape);
};
