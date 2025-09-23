// Function to show the story pop-up
const storyPopup = document.getElementById('storyPopup');
const storyContentDiv = storyPopup.querySelector('.story-popup-content');

function showStoryPopup() {
  // Always just show the centered card
  storyContentDiv.innerHTML = '<div class="story-popup-card"></div>';

  // Show the pop-up
  storyPopup.classList.remove('hidden');
  setTimeout(() => {
    storyPopup.classList.add('active');
  }, 10);
}

// Function to hide the story pop-up
function hideStoryPopup() {
  storyPopup.classList.remove('active');
  setTimeout(() => {
    storyPopup.classList.add('hidden');
    storyPopup.style.transform = ''; // Reset transform
  }, 300);
}

// Smoother drag-down logic
let startY = 0;
const swipeThreshold = 60;

storyPopup.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
  storyPopup.style.transition = 'none';
});

storyPopup.addEventListener('touchmove', (e) => {
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;

  if (deltaY > 0) {
    storyPopup.style.transform = `translateY(${deltaY}px)`;
    e.preventDefault();
  }
});

storyPopup.addEventListener('touchend', (e) => {
  storyPopup.style.transition = 'transform 0.3s ease-in-out';
  const endY = e.changedTouches[0].clientY;
  const deltaY = endY - startY;

  if (deltaY > swipeThreshold) {
    hideStoryPopup();
  } else {
    storyPopup.style.transform = 'translateY(0)';
  }
});
