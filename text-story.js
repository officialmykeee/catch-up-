// story.js

// --- Global Variables and State ---
let currentUserId = null;
let currentStoryData = [];
let currentStoryIndex = 0;
const STORY_DURATION = 5000; // 5 seconds per story

// Access storyDataMocks globally
const storyDataMocks = window.storyDataMocks || {
    "your-story": [
        { id: "your-story-status-1", content: "https://picsum.photos/id/1005/360/640", time: "Just Now", reply: "", isLiked: false, viewed: false },
        { id: "your-story-status-2", content: "https://picsum.photos/id/1006/360/640", time: "5 min ago", reply: "", isLiked: false, viewed: false }
    ],
    "1": [
        { id: "emily1", content: "https://picsum.photos/id/237/360/640", time: "Just Now", reply: "", isLiked: false, viewed: false },
        { id: "emily2", content: "https://picsum.photos/id/238/360/640", time: "10 min ago", reply: "", isLiked: false, viewed: false },
        { id: "emily3", content: "https://picsum.photos/id/239/360/640", time: "15 min ago", reply: "", isLiked: false, viewed: false }
    ],
    "2": [
        { id: "michael1", content: "https://picsum.photos/id/1018/360/640", time: "1 hour ago", reply: "", isLiked: false, viewed: false },
        { id: "michael2", content: "https://picsum.photos/id/1019/360/640", time: "2 hours ago", reply: "", isLiked: false, viewed: false }
    ],
    "3": [
        { id: "sarah1", content: "https://picsum.photos/id/1015/360/640", time: "2 hours ago", reply: "", isLiked: false, viewed: false }
    ],
    "4": [
        { id: "david1", content: "https://picsum.photos/id/1016/360/640", time: "3 hours ago", reply: "", isLiked: false, viewed: false },
        { id: "david2", content: "https://picsum.photos/id/1017/360/640", time: "4 hours ago", reply: "", isLiked: false, viewed: false }
    ],
    "5": [
        { id: "jessica1", content: "https://picsum.photos/id/1019/360/640", time: "4 hours ago", reply: "", isLiked: false, viewed: false },
        { id: "jessica2", content: "https://picsum.photos/id/1020/360/640", time: "5 hours ago", reply: "", isLiked: false, viewed: false }
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
    // IMPORTANT: Reset transformation and transition after user swipe navigation
    storyCon.style.transition = 'none';
    storyCon.style.transform = 'translateX(0)';
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
    currentStoryData.forEach((story, index) => {
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
        // Mark current story as viewed before navigating back
        window.markStoryAsViewed(currentUserId, currentStoryIndex);
        currentStoryIndex--;
        updateStoryViewer();
    } else {
        // Mark current story as viewed
        window.markStoryAsViewed(currentUserId, currentStoryIndex);
        // Navigate to previous user's last story (This is the logic used by the nav areas, not the swipe)
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
    }
}

/**
 * Navigates to the next story or to the next user's first story.
 */
function goToNextStory() {
    clearTimeout(window.storyProgressTimeout); // Stop current timer
    // Mark current story as viewed
    window.markStoryAsViewed(currentUserId, currentStoryIndex);
    if (currentStoryIndex < currentStoryData.length - 1) {
        currentStoryIndex++;
        updateStoryViewer();
    } else {
        // Navigate to next user's first story (This is the logic used by the nav areas, not the swipe)
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

// *** User Navigation Functions for Swiping ***
function goToPreviousUser() {
    clearTimeout(window.storyProgressTimeout);
    window.markStoryAsViewed(currentUserId, currentStoryIndex);

    const currentUserIndex = window.stories.findIndex(story => story.id === currentUserId);
    if (currentUserIndex > 0) {
        const prevUser = window.stories[currentUserIndex - 1];
        const prevUserStories = storyDataMocks[prevUser.id];
        if (prevUserStories && prevUserStories.length > 0) {
            currentUserId = prevUser.id;
            currentStoryData = prevUserStories;
            currentStoryIndex = 0; // Start at first story of the previous user
            updateStoryViewer();
            return true;
        }
    }
    return false; // Return false if no navigation occurred
}

function goToNextUser() {
    clearTimeout(window.storyProgressTimeout);
    window.markStoryAsViewed(currentUserId, currentStoryIndex);

    const currentUserIndex = window.stories.findIndex(story => story.id === currentUserId);
    if (currentUserIndex < window.stories.length - 1) {
        const nextUser = window.stories[currentUserIndex + 1];
        const nextUserStories = storyDataMocks[nextUser.id];
        if (nextUserStories && nextUserStories.length > 0) {
            currentUserId = nextUser.id;
            currentStoryData = nextUserStories;
            currentStoryIndex = 0; // Start at first story of the next user
            updateStoryViewer();
            return true;
        }
    }
    return false; // Return false if no navigation occurred
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

    // Reset state and styles
    storyCon.style.transition = 'none';
    storyCon.style.transform = 'translateX(0)';
    currentUserId = null;
    currentStoryData = [];
    currentStoryIndex = 0;

    // Remove event listeners
    document.removeEventListener('keydown', handleEscape);

    // Update story rings
    if (typeof window.renderStories === 'function') {
        window.renderStories();
    }
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
    const closeThreshold = 100; // Vertical drag close threshold
    const swipeThreshold = 50; // Horizontal swipe threshold (min distance to trigger navigation)
    const snapBackSpeed = '0.2s'; // CSS transition time for snap back/flip animation
    const containerWidth = storyCon.offsetWidth; // Get the width for calculation

    console.log('Opening story for user:', userId, 'with stories:', storyData);

    // Set global state
    currentUserId = userId;
    currentStoryData = storyData;
    currentStoryIndex = startIndex; // Always start at 0 (default)

    // Reset existing content
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    storyCon.style.transition = 'none'; // Remove transition before setting new story
    storyCon.style.transform = 'translateX(0)';
    storyCon.querySelectorAll('.story-blur-bg, .story-gradient-overlay').forEach(el => el.remove());
    clearTimeout(window.storyProgressTimeout);

    // Create progress bars container inside storycon (unchanged)
    let progressBarsContainer = document.querySelector('.story-progress-bars');
    if (!progressBarsContainer) {
        progressBarsContainer = document.createElement('div');
        progressBarsContainer.className = 'story-progress-bars';
        storyCon.appendChild(progressBarsContainer);
    }

    // Create reply container (unchanged)
    let replyContainer = document.querySelector('.story-reply-container');
    let iconBtn;
    if (!replyContainer) {
        // ... (reply container creation logic remains here)
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
            e.stopPropagation(); 
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

    // Create navigation areas (unchanged setup for tap/click)
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

    // --- Drag and Close/Swipe Logic (Horizontal Flipping) ---
    let startY = 0;
    let startX = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;
    let dragDirection = 0; // -1 for left, 1 for right

    const dragTarget = storyViewerOverlay;

    const pauseStory = () => {
        clearTimeout(window.storyProgressTimeout);
        const activeBar = document.querySelector('.progress-bar.active');
        if (activeBar) {
            activeBar.style.animationPlayState = 'paused';
        }
    };

    const resumeStory = () => {
        const activeBar = document.querySelector('.progress-bar.active');
        if (activeBar) {
            activeBar.style.animationPlayState = 'running';
        }
    };

    dragTarget.ontouchstart = (e) => {
        if (e.touches.length === 1) {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            isDragging = true;
            isHorizontalSwipe = false;
            dragDirection = 0;
            storyCon.style.transition = 'none'; // Stop CSS transition for smooth drag
            pauseStory();
        }
    };
    
    dragTarget.ontouchmove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - startY;
        const deltaX = currentX - startX;

        if (!isHorizontalSwipe && Math.abs(deltaX) > 10) {
            isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (isHorizontalSwipe) {
            dragDirection = deltaX < 0 ? -1 : 1;
            storyCon.style.transform = `translateX(${deltaX}px)`;
            e.preventDefault(); // Prevent page scroll when dragging horizontally

            // Vertical Drag (Close) override
        } else if (Math.abs(deltaY) > 10) {
             if (deltaY > closeThreshold) {
                console.log('Vertical Drag Down: Closing');
                closeStoryViewer();
                isDragging = false;
            }
        }
    };

    dragTarget.ontouchend = (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;
        
        // Reset and prepare for transition
        isDragging = false;
        storyCon.style.transition = `transform ${snapBackSpeed} ease-out`; 

        if (isHorizontalSwipe) {
            // Check for horizontal flip
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX < 0) {
                    // Swipe Left (Next User) -> Flip off screen to the left
                    storyCon.style.transform = `translateX(${-containerWidth}px)`;
                    storyCon.addEventListener('transitionend', function handler() {
                        goToNextUser();
                        storyCon.removeEventListener('transitionend', handler);
                    });
                } else {
                    // Swipe Right (Previous User) -> Flip off screen to the right
                    storyCon.style.transform = `translateX(${containerWidth}px)`;
                    storyCon.addEventListener('transitionend', function handler() {
                        goToPreviousUser();
                        storyCon.removeEventListener('transitionend', handler);
                    });
                }
            } else {
                // Not enough drag, snap back to center
                storyCon.style.transform = 'translateX(0)';
                resumeStory();
            }
        } else {
            // Not a horizontal swipe, just a tap or small vertical drag. Resume timer.
            resumeStory();
        }

        isHorizontalSwipe = false;
        dragDirection = 0;
    };

    // --- Mouse Drag Logic (for desktop) ---
    dragTarget.onmousedown = (e) => {
        if (e.button !== 0) return;
        startY = e.clientY;
        startX = e.clientX;
        isDragging = true;
        isHorizontalSwipe = false;
        dragDirection = 0;
        storyCon.style.transition = 'none';
        pauseStory();
    };

    dragTarget.onmousemove = (e) => {
        if (!isDragging) return;

        const deltaY = e.clientY - startY;
        const deltaX = e.clientX - startX;
        
        if (!isHorizontalSwipe && Math.abs(deltaX) > 10) {
            isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        }

        if (isHorizontalSwipe) {
            dragDirection = deltaX < 0 ? -1 : 1;
            storyCon.style.transform = `translateX(${deltaX}px)`;
        } else if (Math.abs(deltaY) > 10) {
            if (deltaY > closeThreshold) {
                closeStoryViewer();
                isDragging = false;
            }
        }
    };

    dragTarget.onmouseup = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        isDragging = false;
        storyCon.style.transition = `transform ${snapBackSpeed} ease-out`; 

        if (isHorizontalSwipe) {
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX < 0) {
                    storyCon.style.transform = `translateX(${-containerWidth}px)`;
                    storyCon.addEventListener('transitionend', function handler() {
                        goToNextUser();
                        storyCon.removeEventListener('transitionend', handler);
                    });
                } else {
                    storyCon.style.transform = `translateX(${containerWidth}px)`;
                    storyCon.addEventListener('transitionend', function handler() {
                        goToPreviousUser();
                        storyCon.removeEventListener('transitionend', handler);
                    });
                }
            } else {
                storyCon.style.transform = 'translateX(0)';
                resumeStory();
            }
        } else {
            resumeStory();
        }

        isHorizontalSwipe = false;
        dragDirection = 0;
    };

    dragTarget.onmouseleave = () => {
        if (isDragging) {
            // Simulate mouseup snap-back if mouse leaves the area
            storyCon.style.transition = `transform ${snapBackSpeed} ease-out`; 
            storyCon.style.transform = 'translateX(0)';
            resumeStory();
        }
        isDragging = false;
        isHorizontalSwipe = false;
        dragDirection = 0;
    };


    document.addEventListener('keydown', handleEscape);
};


