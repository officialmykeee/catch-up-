// story.js

// --- Import from network.js ---
import { stories, storyDataMocks, getNextStoryUserId, getPrevStoryUserId } from './network.js';

// --- Global Variables and State ---
let currentUserId = null;
let currentStoryData = [];
let currentStoryIndex = 0;
const STORY_DURATION = 5000; // 5 seconds per story

// --- Helper Functions ---

/**
 * Updates the story viewer with the current story's content and resets progress bars.
 */
function updateStoryViewer() {
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const prevArea = document.querySelector('.story-nav-prev');

    // Reset existing content
    storyViewerContent.src = '';
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());

    // Set new story content
    const currentStory = currentStoryData[currentStoryIndex];
    storyViewerContent.src = currentStory.content;

    // Update the username in the header (Find the user data from the global stories array)
    const currentUser = stories.find(s => s.id === currentUserId);
    const storyHeaderUsername = document.querySelector('.story-header-username');
    if (storyHeaderUsername && currentUser) {
        storyHeaderUsername.textContent = currentUser.username;
    }

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

    // Update navigation visibility: Hide prev button only if at the first story of the first user.
    const isFirstStoryInSequence = currentStoryIndex === 0 && getPrevStoryUserId(currentUserId) === null;
    if (prevArea) prevArea.style.display = isFirstStoryInSequence ? 'none' : 'block';

    // Update progress bars
    updateProgressBars();
}

/**
 * Updates progress bars for all stories and animates the current one.
 */
function updateProgressBars() {
    const progressBarsContainer = document.querySelector('.story-progress-bars');
    if (!progressBarsContainer) return;
    progressBarsContainer.innerHTML = ''; // Clear existing bars

    // Create a progress bar for each story
    currentStoryData.forEach((_, index) => {
        const barContainer = document.createElement('div');
        barContainer.className = 'progress-bar-container';
        const bar = document.createElement('div');
        bar.className = 'progress-bar';

        if (index < currentStoryIndex) {
            bar.classList.add('completed');
            bar.style.width = '100%'; 
        } else if (index === currentStoryIndex) {
            bar.classList.add('active');
            bar.style.width = '0%'; 
        } else {
            bar.style.width = '0%'; 
        }

        barContainer.appendChild(bar);
        progressBarsContainer.appendChild(barContainer);
    });

    // Start animation for the current progress bar
    const activeBar = progressBarsContainer.querySelector('.progress-bar.active');
    if (activeBar) {
        activeBar.style.animation = 'none'; 
        void activeBar.offsetWidth; 

        // Start animation and set timer for next story
        setTimeout(() => {
            activeBar.style.animation = `progress ${STORY_DURATION}ms linear forwards`;
        }, 0);

        clearTimeout(window.storyProgressTimeout);
        window.storyProgressTimeout = setTimeout(() => {
            goToNextStory();
        }, STORY_DURATION);
    }
}

/**
 * Navigates to the previous story or to the previous user's last story.
 */
function goToPreviousStory() {
    clearTimeout(window.storyProgressTimeout); // Stop current timer

    if (currentStoryIndex > 0) {
        // Go to previous story segment for the current user
        currentStoryIndex--;
        updateStoryViewer();
    } else {
        // Go to previous user's last story
        const prevUserId = getPrevStoryUserId(currentUserId);
        
        if (prevUserId) {
            const prevUserStories = storyDataMocks[prevUserId];
            
            // Update state to previous user's last story
            currentUserId = prevUserId;
            currentStoryData = prevUserStories;
            currentStoryIndex = prevUserStories.length - 1; // Start at last story
            updateStoryViewer();
        } else {
            // No previous user, close viewer (or stay at the first story)
            // We close the viewer if this is the very first user's story
            closeStoryViewer();
        }
    }
}

/**
 * Navigates to the next story or to the next user's first story.
 */
function goToNextStory() {
    clearTimeout(window.storyProgressTimeout); // Stop current timer
    
    if (currentStoryIndex < currentStoryData.length - 1) {
        // Go to next story segment for the current user
        currentStoryIndex++;
        updateStoryViewer();
    } else {
        // Go to next user's first story
        const nextUserId = getNextStoryUserId(currentUserId);
        
        if (nextUserId) {
            const nextUserStories = storyDataMocks[nextUserId];
            
            // Update state to next user's first story
            currentUserId = nextUserId;
            currentStoryData = nextUserStories;
            currentStoryIndex = 0; // Start at the first story of the next user
            updateStoryViewer();
        } else {
            // No next user, close viewer
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
    // Select all dynamically created elements for cleanup
    const replyContainer = document.querySelector('.story-reply-container');
    const progressBarsContainer = document.querySelector('.story-progress-bars');
    const storyHeader = document.querySelector('.story-header');
    const prevArea = document.querySelector('.story-nav-prev');
    const nextArea = document.querySelector('.story-nav-next');

    console.log('Closing story viewer');

    // Stop progress animation
    clearTimeout(window.storyProgressTimeout);

    // Hide overlay and remove dynamic elements
    storyViewerOverlay.classList.remove('show');
    document.body.style.overflow = '';
    storyViewerContent.src = '';
    
    if (replyContainer) replyContainer.remove();
    if (progressBarsContainer) progressBarsContainer.remove();
    if (storyHeader) storyHeader.remove(); // Remove header too
    if (prevArea) prevArea.remove();
    if (nextArea) nextArea.remove();
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
    clearTimeout(window.storyProgressTimeout);

    // Find current user data for avatar and name
    const currentUser = stories.find(s => s.id === userId);

    // Create Header (with username and close button)
    let storyHeader = document.querySelector('.story-header');
    if (!storyHeader) {
        storyHeader = document.createElement('div');
        storyHeader.className = 'story-header';
        storyHeader.innerHTML = `
            <div class="story-user-info">
                <img src="${currentUser ? currentUser.avatar : ''}" alt="Avatar" class="story-header-avatar">
                <span class="story-header-username">${currentUser ? currentUser.username : ''}</span>
            </div>
            <div class="story-header-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
        `;
        storyViewerOverlay.appendChild(storyHeader);
        storyHeader.querySelector('.story-header-close').addEventListener('click', closeStoryViewer);
    }
    
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

        iconBtn.addEventListener('click', () => {
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
            goToPreviousStory();
        });
    }
    if (!nextArea) {
        nextArea = document.createElement('div');
        nextArea.className = 'story-nav-area story-nav-next';
        storyViewerOverlay.appendChild(nextArea);
        // Add the '>' icon for the next user tap area
        nextArea.innerHTML = '<span class="next-user-indicator">&gt;</span>';
        nextArea.addEventListener('click', (e) => {
            e.stopPropagation();
            goToNextStory();
        });
    }

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Update viewer with initial story
    updateStoryViewer();

    // --- Drag and Close Logic (Remains unchanged) ---
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
        // Only close if clicking the actual overlay background, not the content or controls
        if (e.target === storyViewerOverlay) closeStoryViewer();
    });

    document.addEventListener('keydown', handleEscape);
};

