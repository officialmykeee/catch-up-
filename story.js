// Expose openStoryViewer globally
window.openStoryViewer = function(contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');

    console.log('Opening story with content:', contentUrl);

    // Reset
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.innerHTML = '';

    // Slide container (the draggable one)
    const slideContainer = document.createElement('div');
    slideContainer.className = 'story-slide-container';

    // Image wrapper with blur
    const wrapper = document.createElement('div');
    wrapper.className = 'story-image-wrapper';
    wrapper.style.setProperty('background-image', `url(${contentUrl})`);

    // Foreground image
    const img = document.createElement('img');
    img.src = contentUrl;
    img.className = 'story-image';
    wrapper.appendChild(img);

    slideContainer.appendChild(wrapper);
    storyViewerContent.appendChild(slideContainer);

    // Reply container
    let replyContainer = document.querySelector('.story-reply-container');
    if (!replyContainer) {
        replyContainer = document.createElement('div');
        replyContainer.className = 'story-reply-container';

        const replyDiv = document.createElement('div');
        replyDiv.className = 'story-reply';
        replyDiv.textContent = 'Reply privately...';

        const iconBtn = document.createElement('div');
        iconBtn.className = 'story-reply-icon';
        iconBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
              2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
              4.5 2.09C13.09 3.81 14.76 3 
              16.5 3 19.58 3 22 5.42 22 8.5c0 
              3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        `;

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

    // --- Drag-to-close logic (on slideContainer, not just image) ---
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const sensitivity = 0.5;

    const startDrag = (y) => {
        startY = y;
        isDragging = true;
        slideContainer.style.transition = 'none';
    };

    const moveDrag = (y) => {
        if (!isDragging) return;
        currentY = y;
        const deltaY = (currentY - startY) * sensitivity;
        if (deltaY > 0) {
            slideContainer.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        slideContainer.style.transition = 'transform 0.3s ease-out';
        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            slideContainer.style.transform = 'translateY(0)';
        }
    };

    // Touch drag
    slideContainer.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientY));
    slideContainer.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientY));
    slideContainer.addEventListener('touchend', endDrag);

    // Mouse drag
    slideContainer.addEventListener('mousedown', (e) => startDrag(e.clientY));
    slideContainer.addEventListener('mousemove', (e) => moveDrag(e.clientY));
    slideContainer.addEventListener('mouseup', endDrag);

    // Prevent scroll
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        if (e.target !== slideContainer) e.preventDefault();
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
        storyViewerContent.innerHTML = '';
        document.body.style.overflow = '';
        if (replyContainer) replyContainer.remove();
    }
};
