// Expose openStoryViewer globally
window.openStoryViewer = function (contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    const storyViewerContent = document.getElementById('storyViewerContent');

    console.log('Opening story with content:', contentUrl);

    // Reset
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';

    // Remove old blur background if exists
    let oldBlur = storyViewerOverlay.querySelector('.story-blur-bg');
    if (oldBlur) oldBlur.remove();

    // Set story image
    storyViewerContent.src = contentUrl;

    // Once the image loads, adjust layout
    storyViewerContent.onload = () => {
        const img = storyViewerContent;

        // Reset to default
        img.style.objectFit = 'contain';

        // Detect dimensions
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const container = document.querySelector('.storycon');

        if (img.naturalHeight > img.naturalWidth) {
            // Tall image → cover fully
            img.style.objectFit = 'cover';
        } else {
            // Medium/short → center with blurred background
            let blurBg = document.createElement('div');
            blurBg.className = 'story-blur-bg';
            blurBg.style.backgroundImage = `url('${contentUrl}')`;
            container.insertBefore(blurBg, img);
        }
    };

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
                heartPath.setAttribute('fill', '#e1306c'); // Instagram pink
                heartPath.setAttribute('stroke', '#e1306c');
            } else {
                heartPath.setAttribute('fill', 'none');
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
    const closeThreshold = 20; // Extremely sensitive (only 20px swipe needed)

    // --- Touch drag (close only, no image shift) ---
    storyViewerContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    });
    storyViewerContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > closeThreshold) {
            closeStoryViewer();
        }
    });
    storyViewerContent.addEventListener('touchend', () => {
        isDragging = false;
    });

    // --- Mouse drag (close only, no image shift) ---
    storyViewerContent.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
    });
    storyViewerContent.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentY = e.clientY;
        const deltaY = currentY - startY;
        if (deltaY > closeThreshold) {
            closeStoryViewer();
        }
    });
    storyViewerContent.addEventListener('mouseup', () => {
        isDragging = false;
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
        document.body.style.overflow = '';
        if (replyContainer) replyContainer.remove();

        let blurBg = storyViewerOverlay.querySelector('.story-blur-bg');
        if (blurBg) blurBg.remove();
    }
};
