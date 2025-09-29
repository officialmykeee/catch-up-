// Expose openStoryViewer globally
window.openStoryViewer = function(contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');

    console.log('Opening story with content:', contentUrl); // Debug log

    // Set the story image
    storyViewerContent.src = contentUrl;
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Initialize drag variables
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const sensitivity = 0.5; // Very high sensitivity

    // Touch events
    storyViewerContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        storyViewerContent.style.transition = 'none';
    });

    storyViewerContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = (currentY - startY) * sensitivity;

        // Only allow downward drag
        if (deltaY > 0) {
            storyViewerContent.style.transform = `translateY(${deltaY}px)`;
        }
    });

    storyViewerContent.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        storyViewerContent.style.transition = 'transform 0.3s ease-out';

        // Close if dragged down significantly (100px)
        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            // Snap back
            storyViewerContent.style.transform = 'translateY(0)';
        }
    });

    // Mouse events for desktop
    storyViewerContent.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
        storyViewerContent.style.transition = 'none';
    });

    storyViewerContent.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentY = e.clientY;
        const deltaY = (currentY - startY) * sensitivity;

        if (deltaY > 0) {
            storyViewerContent.style.transform = `translateY(${deltaY}px)`;
        }
    });

    storyViewerContent.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        storyViewerContent.style.transition = 'transform 0.3s ease-out';

        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            storyViewerContent.style.transform = 'translateY(0)';
        }
    });

    // Prevent default scrolling on touchmove
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Close on click outside content
    storyViewerOverlay.addEventListener('click', (e) => {
        if (e.target === storyViewerOverlay) {
            closeStoryViewer();
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeStoryViewer();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    function closeStoryViewer() {
        storyViewerOverlay.classList.remove('show');
        storyViewerContent.src = '';
        storyViewerContent.style.transform = 'translateY(0)';
        document.body.style.overflow = '';
    }
};
