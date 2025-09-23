const cube = document.getElementById("cube");
const container = document.getElementById("storyContainer");

let current = 0;
let startX = 0;
let currentRotation = 0;
let dragging = false;

function updateCube() {
  requestAnimationFrame(() => {
    cube.style.transition = "transform 0.6s ease-in-out";
    cube.style.transform = `rotateY(${current * -90}deg)`;
    currentRotation = current * -90;

    // reset progress bars
    const progressBars = container.querySelectorAll(".progress-inner");
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

// Drag control
function startDrag(x) {
  dragging = true;
  startX = x;
  cube.style.transition = "none";
}

function moveDrag(x) {
  if (!dragging) return;
  let deltaX = x - startX;
  let rotation = currentRotation + (deltaX / container.offsetWidth) * 90;
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

// Mouse events
container.addEventListener("mousedown", e => startDrag(e.clientX));
container.addEventListener("mousemove", e => moveDrag(e.clientX));
container.addEventListener("mouseup", e => endDrag(e.clientX));
container.addEventListener("mouseleave", e => { if (dragging) endDrag(e.clientX); });

// Touch events
container.addEventListener("touchstart", e => startDrag(e.touches[0].clientX));
container.addEventListener("touchmove", e => moveDrag(e.touches[0].clientX));
container.addEventListener("touchend", e => endDrag(e.changedTouches[0].clientX));

// Show faces only when page is ready
window.addEventListener("load", () => {
  document.querySelectorAll(".face").forEach(f => f.style.visibility = "visible");
  updateCube();
});

