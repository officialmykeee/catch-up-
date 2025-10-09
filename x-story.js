// story.js

// --- Inject CSS for Card-based Layout ---
(function injectStoryCardsCSS() {
    const styleId = 'story-cards-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Story Cards Container - 3D Perspective Effect */
        .story-cards-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            perspective: 1200px;
            perspective-origin: center center;
            pointer-events: none;
            z-index: 1;
        }

        /* Individual Story Cards */
        .story-card {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 90%;
            max-width: 500px;
            height: 85vh;
            border-radius: 20px;
            overflow: hidden;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        opacity 0.4s ease,
                        box-shadow 0.4s ease;
            pointer-events: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .story-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Current Card - Center, full opacity */
        .story-card-current {
            transform: translate(-50%, -50%) scale(1) rotateY(0deg);
            opacity: 1;
            z-index: 3;
        }

        /* Previous Card - Left side, smaller, slightly rotated */
        .story-card-prev {
            transform: translate(-150%, -50%) scale(0.8) rotateY(25deg);
            opacity: 0.5;
            z-index: 2;
            transform-origin: right center;
        }

        /* Next Card - Right side, smaller, slightly rotated */
        .story-card-next {
            transform: translate(50%, -50%) scale(0.8) rotateY(-25deg);
            opacity: 0.5;
            z-index: 2;
            transform-origin: left center;
        }

        /* Overlay for non-current cards */
        .story-card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            pointer-events: none;
        }

        /* Adjust main story container to work with cards */
        .storycon {
            position: relative;
            z-index: 4;
            pointer-events: none;
        }

        .storycon #storyViewerContent {
            pointer-events: none;
        }

        /* Make interactive elements work */
        .story-progress-bars,
        .story-reply-container,
        .story-nav-area {
            pointer-events: auto;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
            .story-card {
                width: 95%;
                height: 80vh;
            }
            
            .story-card-prev {
                transform: translate(-140%, -50%) scale(0.75) rotateY(30deg);
            }
            
            .story-card-next {
                transform: translate(40%, -50%) scale(0.75) rotateY(-30deg);
            }
        }

        /* Animation for card transitions */
        @keyframes slideLeft {
            from {
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                transform: translate(-150%, -50%) scale(0.8) rotateY(25deg);
                opacity: 0;
            }
        }

        @keyframes slideRight {
            from {
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                transform: translate(50%, -50%) scale(0.8) rotateY(-25deg);
                opacity: 0;
            }
        }

        /* Smooth transition when swiping */
        .story-card.transitioning {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                        opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
})();

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
            animateCardTransition('right');
            setTimeout(() => {
                updateStoryViewer();
                updateCardPositions();
            }, 300);
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
            animateCardTransition('left');
            setTimeout(() => {
                updateStoryViewer();
                updateCardPositions();
            }, 300);
            return true;
        }
    }
    return false; // Return false if no navigation occurred
}

// *** Card-based Layout Functions ***
function createStoryCards() {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    let cardsContainer = document.querySelector('.story-cards-container');
    
    if (!cardsContainer) {
        cardsContainer = document.createElement('div');
        cardsContainer.className = 'story-cards-container';
        const storyCon = document.querySelector('.storycon');
        storyViewerOverlay.insertBefore(cardsContainer, storyCon);
    }
    
    updateCardPositions();
}

function updateCardPositions() {
    const cardsContainer = document.querySelector('.story-cards-container');
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    const currentUserIndex = window.stories.findIndex(story => story.id === currentUserId);
    
    // Create cards for current, previous, and next users
    const positions = ['prev', 'current', 'next'];
    positions.forEach((position, idx) => {
        const userIndex = currentUserIndex + (idx - 1);
        if (userIndex >= 0 && userIndex < window.stories.length) {
            const user = window.stories[userIndex];
            const card = createStoryCard(user, position);
            cardsContainer.appendChild(card);
        }
    });
}

function createStoryCard(user, position) {
    const card = document.createElement('div');
    card.className = `story-card story-card-${position}`;
    card.dataset.userId = user.id;
    
    const stories = storyDataMocks[user.id];
    if (stories && stories.length > 0) {
        const img = document.createElement('img');
        img.src = stories[0].content;
        img.alt = user.username;
        card.appendChild(img);
        
        // Add overlay for non-current cards
        if (position !== 'current') {
            const overlay = document.createElement('div');
            overlay.className = 'story-card-overlay';
            card.appendChild(overlay);
        }
    }
    
    return card;
}

function animateCardTransition(direction) {
    const cardsContainer = document.querySelector('.story-cards-container');
    if (!cardsContainer) return;
    
    const cards = cardsContainer.querySelectorAll('.story-card');
    cards.forEach(card => {
        card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
        if (direction === 'left') {
            card.style.transform = 'translateX(-100%)';
        } else {
            card.style.transform = 'translateX(100%)';
        }
        card.style.opacity = '0';
    });
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
    const cardsContainer = document.querySelector('.story-cards-container');

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
    if (cardsContainer) cardsContainer.remove();
    storyCon.querySelectorAll('.story-blur-bg, .story-gradient-overlay').forEach(el => el.remove());

    // Reset state
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
 * Opens the story viewer for a user's stories.
 * @param {string} userId - The ID of the user.
 * @param {Array} storyData - Array of story objects for the user.
 * @param {number} startIndex - Starting story index.
 */
window.openStoryViewer = function (userId, storyData, startIndex = 0) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const closeThreshold = 100; // Vertical drag close threshold increased for better UX
    const swipeThreshold = 50; // Horizontal swipe threshold
    const tapMaxDistance = 10; // Max distance for a movement to be considered a tap

    console.log('Opening story for user:', userId, 'with stories:', storyData);

    // Set global state
    currentUserId = userId;
    currentStoryData = storyData;
    currentStoryIndex = startIndex; // Always start at 0 (default)

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

    // Create reply container (unchanged setup)
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
            e.stopPropagation(); 
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

    // Create navigation areas (unchanged setup for tap/click)
    let prevArea = document.querySelector('.story-nav-prev');
    let nextArea = document.querySelector('.story-nav-next');
    if (!prevArea) {
        prevArea = document.createElement('div');
        prevArea.className = 'story-nav-area story-nav-prev';
        storyViewerOverlay.appendChild(prevArea);
        prevArea.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Previous navigation clicked (internal story)');
            goToPreviousStory();
        });
    }
    if (!nextArea) {
        nextArea = document.createElement('div');
        nextArea.className = 'story-nav-area story-nav-next';
        storyViewerOverlay.appendChild(nextArea);
        nextArea.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Next navigation clicked (internal story)');
            goToNextStory();
        });
    }

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Create story cards container for swipe effect
    createStoryCards();

    // Update viewer with initial story
    updateStoryViewer();

    // --- Drag and Close/Swipe Logic (REVISED & ATTACHED TO OVERLAY) ---
    let startY = 0;
    let startX = 0;
    let isDragging = false;
    let draggedHorizontal = false;

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
        // Restart the timeout if the animation was resumed
        if (!window.storyProgressTimeout) {
             window.storyProgressTimeout = setTimeout(() => {
                goToNextStory();
            }, STORY_DURATION - (activeBar.offsetWidth / progressBarsContainer.offsetWidth * STORY_DURATION)); // Basic approximation
        }
    };

    dragTarget.ontouchstart = (e) => {
        if (e.touches.length === 1) {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            isDragging = true;
            draggedHorizontal = false;
            pauseStory();
        }
    };
    
    dragTarget.ontouchmove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - startY;
        const deltaX = currentX - startX;

        // Vertical Drag (Close)
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > closeThreshold) {
            console.log('Vertical Drag Down: Closing');
            closeStoryViewer();
            isDragging = false;
        }

        // Horizontal Drag (Visual Feedback for Swipe)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > tapMaxDistance) {
            draggedHorizontal = true;
            
            // Apply real-time card transformation
            const cardsContainer = document.querySelector('.story-cards-container');
            if (cardsContainer) {
                const cards = cardsContainer.querySelectorAll('.story-card');
                const progress = Math.min(Math.abs(deltaX) / 200, 1);
                const direction = deltaX > 0 ? 1 : -1;
                
                cards.forEach(card => {
                    const currentPos = card.classList.contains('story-card-current') ? 0 :
                                     card.classList.contains('story-card-prev') ? -1 : 1;
                    const offset = (currentPos + direction * progress) * 100;
                    const scale = card.classList.contains('story-card-current') ? 
                                1 - progress * 0.1 : 0.8 + progress * 0.2;
                    const opacity = card.classList.contains('story-card-current') ? 
                                  1 - progress * 0.3 : 0.5 + progress * 0.5;
                    
                    card.style.transform = `translateX(${offset}%) scale(${scale})`;
                    card.style.opacity = opacity;
                });
            }
            
            e.preventDefault(); // Prevent page scroll when dragging horizontally
        }
    };

    dragTarget.ontouchend = (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const totalMovement = Math.sqrt(deltaX * deltaX + (endY - startY) * (endY - startY));

        // Reset card transformations
        const cardsContainer = document.querySelector('.story-cards-container');
        if (cardsContainer) {
            const cards = cardsContainer.querySelectorAll('.story-card');
            cards.forEach(card => {
                card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
                card.style.transform = '';
                card.style.opacity = '';
            });
        }

        // 1. Check for **Horizontal Swipe** (User Navigation)
        if (draggedHorizontal && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                // Swipe Left -> Next User
                console.log('Swipe Left: Next User');
                goToNextUser();
            } else {
                // Swipe Right -> Previous User
                console.log('Swipe Right: Previous User');
                goToPreviousUser();
            }
        } else {
            // 2. Resume timer if no navigation happened
            resumeStory();
        }
        
        isDragging = false;
        draggedHorizontal = false;
    };

    // NOTE: Mouse drag logic is less common for this feature, but included for desktop/touchscreen use.
    dragTarget.onmousedown = (e) => {
        // Only trigger on main button click (left mouse button)
        if (e.button !== 0) return;
        startY = e.clientY;
        startX = e.clientX;
        isDragging = true;
        draggedHorizontal = false;
        pauseStory();
    };

    dragTarget.onmousemove = (e) => {
        if (!isDragging) return;
        
        const deltaY = e.clientY - startY;
        const deltaX = e.clientX - startX;
        
        // Vertical Drag (Close)
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > closeThreshold) {
            closeStoryViewer();
            isDragging = false;
        }
        
        // Horizontal Drag (Mark as horizontal for mouse)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > tapMaxDistance) {
            draggedHorizontal = true;
            
            // Apply real-time card transformation for mouse too
            const cardsContainer = document.querySelector('.story-cards-container');
            if (cardsContainer) {
                const cards = cardsContainer.querySelectorAll('.story-card');
                const progress = Math.min(Math.abs(deltaX) / 200, 1);
                const direction = deltaX > 0 ? 1 : -1;
                
                cards.forEach(card => {
                    const currentPos = card.classList.contains('story-card-current') ? 0 :
                                     card.classList.contains('story-card-prev') ? -1 : 1;
                    const offset = (currentPos + direction * progress) * 100;
                    const scale = card.classList.contains('story-card-current') ? 
                                1 - progress * 0.1 : 0.8 + progress * 0.2;
                    const opacity = card.classList.contains('story-card-current') ? 
                                  1 - progress * 0.3 : 0.5 + progress * 0.5;
                    
                    card.style.transform = `translateX(${offset}%) scale(${scale})`;
                    card.style.opacity = opacity;
                });
            }
        }
    };

    dragTarget.onmouseup = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        
        // Reset card transformations
        const cardsContainer = document.querySelector('.story-cards-container');
        if (cardsContainer) {
            const cards = cardsContainer.querySelectorAll('.story-card');
            cards.forEach(card => {
                card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
                card.style.transform = '';
                card.style.opacity = '';
            });
        }
        
        // Check for Horizontal Swipe (User Navigation)
        if (draggedHorizontal && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                // Swipe Left -> Next User
                console.log('Mouse Swipe Left: Next User');
                goToNextUser();
            } else {
                // Swipe Right -> Previous User
                console.log('Mouse Swipe Right: Previous User');
                goToPreviousUser();
            }
        } else {
            // Resume timer if no navigation happened
            resumeStory();
        }

        isDragging = false;
        draggedHorizontal = false;
    };

    dragTarget.onmouseleave = () => {
        if (isDragging) {
            // Reset card transformations
            const cardsContainer = document.querySelector('.story-cards-container');
            if (cardsContainer) {
                const cards = cardsContainer.querySelectorAll('.story-card');
                cards.forEach(card => {
                    card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
                    card.style.transform = '';
                    card.style.opacity = '';
                });
            }
            resumeStory();
        }
        isDragging = false;
        draggedHorizontal = false;
    };


    document.addEventListener('keydown', handleEscape);
};
