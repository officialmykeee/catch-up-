 // Expose openStoryViewer globally
window.openStoryViewer = function(contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');

    // Create wrapper if not already present
    let storyImageWrapper = document.querySelector('.story-image-wrapper');
    let storyViewerContent;

    if (!storyImageWrapper) {
        storyImageWrapper = document.createElement('div');
        storyImageWrapper.className = 'story-image-wrapper';

        storyViewerContent = document.createElement('img');
        storyViewerContent.id = 'storyViewerContent';

        storyImageWrapper.appendChild(storyViewerContent);
        storyViewerOverlay.appendChild(storyImageWrapper);
    } else {
        storyViewerContent = document.getElementById('storyViewerContent');
    }

    console.log('Opening story with content:', contentUrl);

    // Reset
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    storyViewerContent.style.transform = 'translateY(0)';

    // Set story image
    storyViewerContent.src = contentUrl;

    // Create or update reply container
    let replyContainer = document.querySelector('.story-reply-container');
    if (!replyContainer) {
        replyContainer = document.createElement('div');
        replyContainer.className = 'story-reply-container';

        // Reply bar
        const replyDiv = document.createElement('div');
        replyDiv.className = 'story-reply';
        replyDiv.textContent = 'Reply privately...';

        // Icon button
        const iconBtn = document.createElement('div');
        iconBtn.className = 'story-reply-icon';
        iconBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                              </svg>`;

        // Toggle like/unlike
        iconBtn.addEventListener('click', () => {
            iconBtn.classList.toggle('active');
        });

        replyContainer.appendChild(replyDiv);
        replyContainer.appendChild(iconBtn);
        storyViewerOverlay.appendChild(replyContainer);
    }

    // Show overlay
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Drag variables
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const sensitivity = 0.5;

    // Touch drag
    storyViewerContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        storyViewerContent.style.transition = 'none';
    });

    storyViewerContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = (currentY - startY) * sensitivity;
        if (deltaY > 0) {
            storyViewerContent.style.transform = `translateY(${deltaY}px)`;
        }
    });

    storyViewerContent.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        storyViewerContent.style.transition = 'transform 0.3s ease-out';
        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            storyViewerContent.style.transform = 'translateY(0)';
        }
    });

    // Mouse drag
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

    // Prevent scroll on overlay background
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        if (e.target !== storyViewerContent) e.preventDefault();
    }, { passive: false });

    // Close on background click
    storyViewerOverlay.addEventListener('click', (e) => {
        if (e.target === storyViewerOverlay) {
            closeStoryViewer();
        }
    });

    // Close on Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeStoryViewer();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    function closeStoryViewer() {
        console.log('Closing story viewer');
        storyViewerOverlay.classList.remove('show');
        storyViewerContent.src = '';
        storyViewerContent.style.transform = 'translateY(0)';
        document.body.style.overflow = '';
        if (replyContainer) replyContainer.remove();
    }
};
