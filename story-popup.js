const storyPopup = document.getElementById("storyPopup");
const closeButton = storyPopup.querySelector(".close-button");
const cube = storyPopup.querySelector("#cube");

let current = 0;
let startX = 0;
let currentRotation = 0;
let dragging = false;

// Function to open the story pop-up
function showStoryPopup() {
  storyPopup.classList.add("active");
  // Show faces only when pop-up is visible
  document.querySelectorAll(".face").forEach(f => f.style.visibility = "visible");
  updateCube();
}

// Function to close the story pop-up
function hideStoryPopup() {
  storyPopup.classList.remove("active");
  // After the transition, hide the element completely
  setTimeout(() => {
    document.querySelectorAll(".face").forEach(f => f.style.visibility = "hidden");
  }, 300); // This delay should match your CSS transition time
}

// Function to handle the cube's rotation and progress bars
function updateCube() {
  requestAnimationFrame(() => {
    cube.style.transition = "transform 0.6s ease-in-out";
    cube.style.transform = `rotateY(${current * -90}deg)`;
    currentRotation = current * -90;

    // reset progress bars
    const progressBars = storyPopup.querySelectorAll(".progress-inner");
    progressBars.forEach(p => {
      p.style.transition = "none";
      p.style.width = "0%";
    });

    // run animation on active bar
    const active = progressBars[current % progressBars.length];
    requestAnimationFrame(() => {
      active.style.transition = "width 5s linear";
      active.style.width = "100%";
    });
  });
}

// Horizontal Drag control
function startDrag(x) {
  dragging = true;
  startX = x;
  cube.style.transition = "none";
}

function moveDrag(x) {
  if (!dragging) return;
  let deltaX = x - startX;
  let rotation = currentRotation + (deltaX / cube.offsetWidth) * 90;
  cube.style.transform = `rotateY(${rotation}deg)`;
}

function endDrag(x) {
  if (!dragging) return;
  dragging = false;
  let deltaX = x - startX;

  if (Math.abs(deltaX) > 50) {
    if (deltaX < 0) current = (current + 1) % 4;
    else current = (current - 1 + 4) % 4;
  }
  updateCube();
}

// Mouse events on the pop-up container
storyPopup.addEventListener("mousedown", e => startDrag(e.clientX));
storyPopup.addEventListener("mousemove", e => moveDrag(e.clientX));
storyPopup.addEventListener("mouseup", e => endDrag(e.clientX));
storyPopup.addEventListener("mouseleave", e => { if (dragging) endDrag(e.clientX); });

// Touch events on the pop-up container
storyPopup.addEventListener("touchstart", e => startDrag(e.touches[0].clientX));
storyPopup.addEventListener("touchmove", e => moveDrag(e.touches[0].clientX));
storyPopup.addEventListener("touchend", e => endDrag(e.changedTouches[0].clientX));

// Close button event
closeButton.addEventListener("click", hideStoryPopup);



