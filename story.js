// Expose openStoryViewer globally
window.openStoryViewer = function(contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');

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
        iconBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" 
                stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        // Toggle like/unlike when clicking the circle
        iconBtn.addEventListener('click', () => {
            iconBtn.classList.toggle('active');
            const heartPath = iconBtn.querySelector('path');
            if (iconBtn.classList.contains('active')) {
                heartPath.setAttribute('stroke', '#2596be'); // blue
            } else {
                heartPath.setAttribute('stroke', '#9ca3af'); // gray
            }
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

    // Prevent scroll
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
