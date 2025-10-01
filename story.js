// Expose openStoryViewer globally
window.openStoryViewer = function(contentUrl) {
    const storyViewerOverlay = document.getElementById('storyViewerOverlay');
    // --- UPDATED: Get the new wrapper and the content element ---
    const storyViewerWrapper = document.getElementById('storyViewerWrapper');
    const storyViewerContent = document.getElementById('storyViewerContent');
    // -----------------------------------------------------------
    
    console.log('Opening story with content:', contentUrl);

    // Reset
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    // --- UPDATED: Reset wrapper transform for initial animation start ---
    storyViewerWrapper.style.transform = 'translateY(100%)'; 
    // --- IMPORTANT: The drag transform is now applied to the content, reset it ---
    storyViewerContent.style.transform = 'translateY(0)'; 
    // --------------------------------------------------------------------------

    // Set story image
    storyViewerContent.src = contentUrl;

    // Create or update reply container (Your existing logic is fine here)
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
        iconBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        
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
    
    // --- NEW: Slide in the wrapper after a slight delay to allow the overlay to appear first ---
    // This is managed by the CSS transition on #storyViewerWrapper and the .show class on #storyViewerOverlay
    // No JS needed here, but you can set a small timeout if you want a sequenced animation
    // storyViewerWrapper.style.transform = 'translateY(0)'; 
    
    // Drag variables
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const sensitivity = 0.5;

    // --- IMPORTANT: Drag listeners remain on storyViewerContent ---

    // Touch drag
    storyViewerContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        storyViewerContent.style.transition = 'none';
        storyViewerWrapper.style.transition = 'none'; // Lock the wrapper too
    });

    storyViewerContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = (currentY - startY) * sensitivity;
        
        // The transform is now applied to the storyViewerContent (the image)
        if (deltaY > 0) {
            storyViewerContent.style.transform = `translateY(${deltaY}px)`;
            storyViewerWrapper.style.transform = `translateY(${deltaY * 0.1}px)`; // Optional: Add a slight parallax/easing to the wrapper
        }
    });

    storyViewerContent.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        storyViewerContent.style.transition = 'transform 0.3s ease-out';
        storyViewerWrapper.style.transition = 'transform 0.3s ease-out';
        
        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            storyViewerContent.style.transform = 'translateY(0)';
            storyViewerWrapper.style.transform = 'translateY(0)'; // Reset wrapper parallax
        }
    });

    // Mouse drag
    storyViewerContent.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
        storyViewerContent.style.transition = 'none';
        storyViewerWrapper.style.transition = 'none'; // Lock the wrapper too
    });

    storyViewerContent.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentY = e.clientY;
        const deltaY = (currentY - startY) * sensitivity;
        
        // The transform is now applied to the storyViewerContent (the image)
        if (deltaY > 0) {
            storyViewerContent.style.transform = `translateY(${deltaY}px)`;
            storyViewerWrapper.style.transform = `translateY(${deltaY * 0.1}px)`; // Optional: Add a slight parallax/easing to the wrapper
        }
    });

    storyViewerContent.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        
        storyViewerContent.style.transition = 'transform 0.3s ease-out';
        storyViewerWrapper.style.transition = 'transform 0.3s ease-out';

        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            storyViewerContent.style.transform = 'translateY(0)';
            storyViewerWrapper.style.transform = 'translateY(0)'; // Reset wrapper parallax
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
        
        // --- UPDATED: Slide the wrapper down first ---
        storyViewerWrapper.style.transition = 'transform 0.3s ease-in'; // Use ease-in for a faster drop-off
        storyViewerWrapper.style.transform = 'translateY(100%)'; 
        
        // Reset the content transform immediately as it's inside the moving wrapper
        storyViewerContent.style.transform = 'translateY(0)'; 
        
        // Remove the overlay class after the wrapper animation completes (0.3s)
        setTimeout(() => {
            storyViewerOverlay.classList.remove('show');
            storyViewerContent.src = '';
            document.body.style.overflow = '';
            if (replyContainer) replyContainer.remove();
        }, 300); // Wait for the wrapper to slide out

    }
};
