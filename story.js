// story.js

// --- Global Variables and State ---
let currentUserId = null; // Track current user
let currentStoryData = []; // Track user's stories
let currentStoryIndex = 0; // Track current story index
let progressInterval = null; // For progress bar animation
const STORY_DURATION = 5000; // 5 seconds per story

// --- Helper Functions ---

/**
 * Updates the story viewer with the current story's content and resets progress bars.
 */
function updateStoryViewer() {
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const progressBarsContainer = document.querySelector('.story-progress-bars');

    // Reset existing content
    storyViewerContent.src = '';
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());
    clearInterval(progressInterval); // Stop any existing animation

    // Set new story content
    const currentStory = currentStoryData[currentStoryIndex];
    storyViewerContent.src = currentStory.content;

    // Handle image load for blur background
    storyViewerContent.onload = () => {
        const isTall = storyViewerContent.naturalHeight > storyViewerContent.naturalWidth * 1.3;
        storyViewerContent.style.objectFit = isTall ? 'cover' : 'contain';

        if (!isTall) {
            const blurBg = document.createElement('div');
            blurBg.className = 'story-blur-bg';
            blurBg.style.backgroundImage = `url(${currentStory.content})`;
            storyCon.insertBefore(blurBg, storyViewerContent);
        }
    };

    // Update like button state
    const iconBtn = document.querySelector('.story-reply-icon');
    const heartPath = iconBtn.querySelector('path');
    iconBtn.classList.toggle('active', currentStory.isLiked);
    heartPath.setAttribute('fill', currentStory.isLiked ? '#e1306c' : 'none');
    heartPath.setAttribute('stroke', currentStory.isLiked ? '#e1306c' : '#9ca3af');

    // Reset and start progress bars
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
            bar.style.width = '100%'; // Completed stories
        } else if (index === currentStoryIndex) {
            bar.style.width = '0%'; // Current story starts at 0
            bar.classList.add('active');
        }
        barContainer.appendChild(bar);
        progressBarsContainer.appendChild(barContainer);
    });

    // Animate the current progress bar
    const activeBar = progressBarsContainer.querySelector('.progress-bar.active');
    let progress = 0;
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        progress += 100 / (STORY_DURATION / 100); // Increment every 100ms
        activeBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            goToNextStory();
        }
    }, 100);
}

/**
 * Navigates to the previous story or closes if at the start.
 */
function goToPreviousStory() {
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        updateStoryViewer();
    } else {
        closeStoryViewer();
    }
}

/**
 * Navigates to the next story or closes if at the end.
 */
function goToNextStory() {
    if (currentStoryIndex < currentStoryData.length - 1) {
        currentStoryIndex++;
        updateStoryViewer();
    } else {
        closeStoryViewer();
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

    console.log('Closing story viewer');

    // Stop progress animation
    clearInterval(progressInterval);

    // Hide overlay and reset
    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';
    storyViewerContent.src = '';
    if (replyContainer) replyContainer.remove();
    if (progressBarsContainer) progressBarsContainer.remove();
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());

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
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());
    clearInterval(progressInterval);

    // Create progress bars container
    let progressBarsContainer = document.querySelector('.story-progress-bars');
    if (!progressBarsContainer) {
        progressBarsContainer = document.createElement('div');
        progressBarsContainer.className = 'story-progress-bars';
        storyViewerOverlay.insertBefore(progressBarsContainer, storyCon);
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

        iconBtn.addEventListener('click', () => {
            iconBtn.classList.toggle('active');
            const heartPath = iconBtn.querySelector('path');
            const isActive = iconBtn.classList.contains('active');
            heartPath.setAttribute('fill', isActive ? '#e1306c' : 'none');
            heartPath.setAttribute('stroke', isActive ? '#e1306c' : '#9ca3af');
            currentStoryData[currentStoryIndex].isLiked = isActive; // Update mock data
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

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Update viewer with initial story
    updateStoryViewer();

    // --- Navigation Areas ---
    const prevArea = document.createElement('div');
    prevArea.className = 'story-nav-area story-nav-prev';
    const nextArea = document.createElement('div');
    nextArea.className = 'story-nav-area story-nav-next';
    storyViewerOverlay.appendChild(prevArea);
    storyViewerOverlay.appendChild(nextArea);

    prevArea.addEventListener('click', (e) => {
        e.stopPropagation();
        goToPreviousStory();
    });
    nextArea.addEventListener('click', (e) => {
        e.stopPropagation();
        goToNextStory();
    });

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
