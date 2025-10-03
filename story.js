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

    // Remove the Escape key listener to prevent it from firing when the viewer is closed
    document.removeEventListener('keydown', handleEscape);
}

// Expose the close function for background clicks or drag events outside the open flow
window.closeStoryViewer = closeStoryViewer;


// --- Main Open Function ---

/**
 * Opens the story viewer with the specified image content.
 * @param {string} contentUrl - The URL of the story image.
 */
window.openStoryViewer = function (contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');
    const storyCon = storyViewerContent.closest('.storycon');
    const closeThreshold = 20; // Drag distance in pixels to trigger close

    console.log('Opening story with content:', contentUrl);

    // Initial reset
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    storyCon.querySelectorAll('.story-blur-bg').forEach(el => el.remove());

    // Set story image
    storyViewerContent.src = contentUrl;

    // Once image loads, decide tall vs medium and apply blur background if needed
    storyViewerContent.onload = () => {
        const isTall = storyViewerContent.naturalHeight > storyViewerContent.naturalWidth * 1.3;

        if (isTall) {
            storyViewerContent.style.objectFit = 'cover';
        } else {
            storyViewerContent.style.objectFit = 'contain';

            const blurBg = document.createElement('div');
            blurBg.className = 'story-blur-bg';
            blurBg.style.backgroundImage = `url(${contentUrl})`;
            storyCon.insertBefore(blurBg, storyViewerContent);
        }
    };
    
    // --- Dynamic Reply Container Logic ---
    let replyContainer = document.querySelector('.story-reply-container');
    let iconBtn;

    if (!replyContainer) {
        // Create elements only once if they don't exist
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

        // Toggle like/unlike logic
        iconBtn.addEventListener('click', () => {
            iconBtn.classList.toggle('active');
            const heartPath = iconBtn.querySelector('path');
            const isActive = iconBtn.classList.contains('active');
            heartPath.setAttribute('fill', isActive ? '#e1306c' : 'none');
            heartPath.setAttribute('stroke', isActive ? '#e1306c' : '#9ca3af');
        });

        replyContainer.appendChild(replyDiv);
        replyContainer.appendChild(iconBtn);
        storyViewerOverlay.appendChild(replyContainer);

    } else {
        // Elements exist, just get the button and reset its state
        iconBtn = replyContainer.querySelector('.story-reply-icon');
        const heartPath = iconBtn.querySelector('path');
        
        iconBtn.classList.remove('active');
        heartPath.setAttribute('fill', 'none');
        heartPath.setAttribute('stroke', '#9ca3af');
    }

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // --- Drag and Close Logic ---
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
    storyViewerContent.ontouchend = () => {
        isDragging = false;
    };

    // Mouse drag
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

    // Prevent scroll on the overlay background (for touch devices)
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        if (e.target !== storyViewerContent) e.preventDefault();
    }, { passive: false });

    // Close on background click
    storyViewerOverlay.addEventListener('click', (e) => {
        if (e.target === storyViewerOverlay) closeStoryViewer();
    });

    // Close on Escape - *Attach the external handler*
    document.addEventListener('keydown', handleEscape);
};


