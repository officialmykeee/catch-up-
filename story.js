const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = document.querySelector('.story-content-inner');
const progressBar = document.querySelector('.progress-bar');
const loadingRing = document.querySelector('.story-telegram-ring');
const storyPopupContent = document.querySelector('.story-popup-content');
let progressTimeout = null;
let currentStoryIndex = 0;

async function fetchStoryContent(storyId) {
  const story = stories.find(s => s.id === storyId);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(story && story.content ? story.content : []);
    }, 500);
  });
}

async function showStoryPopup(story, index, direction = 'none') {
  // Clear any existing timeout
  if (progressTimeout) {
    clearTimeout(progressTimeout);
    progressTimeout = null;
  }

  // Store current story index
  currentStoryIndex = index;

  // Apply subtle horizontal slide transition
  if (direction === 'next') {
    storyPopupContent.style.transform = 'translateX(-50%)';
    setTimeout(() => {
      storyPopupContent.style.transition = 'none';
      storyPopupContent.style.transform = 'translateX(50%)';
      setTimeout(() => {
        storyPopupContent.style.transition = 'transform 0.15s linear';
        storyPopupContent.style.transform = 'translateX(0)';
      }, 10);
    }, 150);
  } else if (direction === 'prev') {
    storyPopupContent.style.transform = 'translateX(50%)';
    setTimeout(() => {
      storyPopupContent.style.transition = 'none';
      storyPopupContent.style.transform = 'translateX(-50%)';
      setTimeout(() => {
        storyPopupContent.style.transition = 'transform 0.15s linear';
        storyPopupContent.style.transform = 'translateX(0)';
      }, 10);
    }, 150);
  }

  // Reset progress bar and show loading ring
  progressBar.style.transition = 'none';
  progressBar.style.width = '0';
  loadingRing.classList.remove('hidden');
  storyContentDiv.innerHTML = '';
  storyPopup.classList.remove('hidden');
  setTimeout(() => {
    storyPopup.classList.add('active');
  }, 10);

  // Fetch content
  const contents = await fetchStoryContent(story.id);
  loadingRing.classList.add('hidden');

  // Render content
  const storyCount = contents.length || 1;
  const duration = storyCount <= 5 ? 5000 : 8000;
  let contentHtml = '';

  if (contents.length > 0 && contents[0].type === 'image') {
    contentHtml = `Story image`;
  } else if (contents.length > 0 && contents[0].type === 'video') {
    contentHtml = ``;
  } else if (contents.length > 0 && contents[0].type === 'text') {
    contentHtml = `${contents[0].text}`;
  } else {
    contentHtml = `No content available`;
  }

  storyContentDiv.innerHTML = contentHtml;

  // 🔹 Remove old arrows to avoid duplicates
  document.querySelectorAll('.story-arrow').forEach(el => el.remove());

  // 🔹 Add left/right invisible arrow navigation
  storyPopupContent.insertAdjacentHTML('beforeend', `
    <div class="story-arrow story-arrow-left"></div>
    <div class="story-arrow story-arrow-right"></div>
  `);

  // 🔹 Attach click events
  document.querySelector('.story-arrow-left').addEventListener('click', () => {
    if (currentStoryIndex > 0) {
      showStoryPopup(stories[currentStoryIndex - 1], currentStoryIndex - 1, 'prev');
    }
  });
  document.querySelector('.story-arrow-right').addEventListener('click', () => {
    if (currentStoryIndex < stories.length - 1) {
      showStoryPopup(stories[currentStoryIndex + 1], currentStoryIndex + 1, 'next');
    } else {
      hideStoryPopup();
    }
  });

  // Start progress bar
  progressBar.style.transition = `width ${duration}ms linear`;
  setTimeout(() => {
    progressBar.style.width = '100%';
  }, 10);

  // Auto navigation after duration
  progressTimeout = setTimeout(() => {
    if (story.isYourStory || currentStoryIndex === stories.length - 1) {
      hideStoryPopup();
    } else {
      const nextIndex = currentStoryIndex + 1;
      showStoryPopup(stories[nextIndex], nextIndex, 'next');
    }
  }, duration);
}

function hideStoryPopup() {
  if (progressTimeout) {
    clearTimeout(progressTimeout);
    progressTimeout = null;
  }

  storyPopup.classList.remove('active');
  setTimeout(() => {
    storyPopup.classList.add('hidden');
    storyPopup.style.transform = '';
    progressBar.style.transition = 'none';
    progressBar.style.width = '0';
    loadingRing.classList.add('hidden');
    storyContentDiv.innerHTML = '';
    storyPopupContent.style.transform = 'translateX(0)';
    document.querySelectorAll('.story-arrow').forEach(el => el.remove());
  }, 300);
}

// Twitter Fleets-style navigation
storyPopup.addEventListener('click', (e) => {
  if (e.target === storyPopup || e.target.classList.contains('story-content')) {
    const rect = storyPopup.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (tapX < halfWidth) {
      if (currentStoryIndex > 0) {
        const prevIndex = currentStoryIndex - 1;
        showStoryPopup(stories[prevIndex], prevIndex, 'prev');
      }
    } else {
      if (currentStoryIndex < stories.length - 1) {
        const nextIndex = currentStoryIndex + 1;
        showStoryPopup(stories[nextIndex], nextIndex, 'next');
      } else {
        hideStoryPopup();
      }
    }
  }
});

// Swipe navigation
let startX = 0;
let startY = 0;
const swipeThreshold = 60;
const swipeDownThreshold = 60;

storyPopup.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  storyPopup.style.transition = 'none';
});

storyPopup.addEventListener('touchmove', (e) => {
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
    storyPopup.style.transform = `translateY(${deltaY}px)`;
    e.preventDefault();
  } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
    storyPopupContent.style.transform = `translateX(${deltaX / 2}px)`;
    e.preventDefault();
  }
});

storyPopup.addEventListener('touchend', (e) => {
  const currentX = e.changedTouches[0].clientX;
  const currentY = e.changedTouches[0].clientY;
  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeDownThreshold) {
    hideStoryPopup();
  } else if (Math.abs(deltaX) > swipeThreshold) {
    storyPopupContent.style.transition = 'transform 0.15s linear';
    if (deltaX > 0 && currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      showStoryPopup(stories[prevIndex], prevIndex, 'prev');
    } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      showStoryPopup(stories[nextIndex], nextIndex, 'next');
    } else {
      storyPopupContent.style.transform = 'translateX(0)';
    }
  } else {
    storyPopup.style.transition = 'transform 0.3s ease-in-out';
    storyPopupContent.style.transition = 'transform 0.15s linear';
    storyPopup.style.transform = 'translateY(0)';
    storyPopupContent.style.transform = 'translateX(0)';
  }
});
    
