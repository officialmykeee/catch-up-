// Open story viewer
window.openStoryViewer = function(contentUrl) {
  const storyViewerOverlay = document.getElementById('storyViewerOverlay');
  const storyViewerContent = document.getElementById('storyViewerContent');
  const storyBackground = document.getElementById('storyBackground');

  console.log('Opening story with content:', contentUrl);

  // Reset
  storyViewerOverlay.classList.remove('show');
  storyViewerContent.src = '';
  storyBackground.style.backgroundImage = '';

  // Set story
  storyViewerContent.src = contentUrl;
  storyBackground.style.backgroundImage = `url(${contentUrl})`;

  // Create reply container if not exists
  let replyContainer = document.querySelector('.story-reply-container');
  if (!replyContainer) {
    replyContainer = document.createElement('div');
    replyContainer.className = 'story-reply-container';

    // Reply text
    const replyDiv = document.createElement('div');
    replyDiv.className = 'story-reply';
    replyDiv.textContent = 'Reply privately...';

    // Heart button
    const iconBtn = document.createElement('div');
    iconBtn.className = 'story-reply-icon';
    iconBtn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

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

  // Close on background click
  storyViewerOverlay.addEventListener('click', (e) => {
    if (e.target === storyViewerOverlay) {
      closeStoryViewer();
    }
  });

  // Close on ESC
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
    storyBackground.style.backgroundImage = '';
    document.body.style.overflow = '';
    if (replyContainer) replyContainer.remove();
  }
};
