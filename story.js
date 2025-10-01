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
      <svg viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 
        2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 
        3.41 0.81 4.5 2.09C13.09 3.81 14.76 
        3 16.5 3 19.58 3 22 5.42 22 
        8.5c0 3.78-3.4 6.86-8.55 
        11.54L12 21.35z"></path>
      </svg>`;

    // Toggle like/unlike
    iconBtn.addEventListener('click', () => {
      iconBtn.classList.toggle('active');
    });

    replyContainer.appendChild(replyDiv);
    replyContainer.appendChild(iconBtn);
    storyViewerOverlay.querySelector('.story-content-wrapper').appendChild(replyContainer);
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

  // Prevent scroll background
  storyViewerOverlay.addEventListener('touchmove', (e) => {
    if (e.target !== storyViewerContent) e.preventDefault();
  }, { passive: false });

  // Close on background click
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

  // Close function
  function closeStoryViewer() {
    console.log('Closing story viewer');
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    storyViewerContent.style.transform = 'translateY(0)';
    document.body.style.overflow = '';
    if (replyContainer) replyContainer.remove();
  }
};
