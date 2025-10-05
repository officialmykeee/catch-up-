document.addEventListener("DOMContentLoaded", () => {
  const storyListContainer = document.querySelector(".stories-list");
  if (!storyListContainer || !window.stories) return;

  // Helper to create SVG segmented ring
  const createRing = (storyCount, isNewStory) => {
    const radius = 28; // adjust based on your CSS avatar size
    const circumference = 2 * Math.PI * radius;
    const gap = 6; // space between segments
    const segmentAngle = 360 / storyCount;
    const dashArray = circumference / storyCount - gap;
    const dashGap = circumference - dashArray;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "70");
    svg.setAttribute("height", "70");
    svg.setAttribute("viewBox", "0 0 70 70");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "35");
    circle.setAttribute("cy", "35");
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "none");

    if (isNewStory) {
      circle.setAttribute("stroke", "url(#gradient)");
      circle.setAttribute("stroke-width", "3");
    } else {
      circle.setAttribute("stroke", "#ccc");
      circle.setAttribute("stroke-width", "2");
    }

    if (storyCount > 1) {
      circle.setAttribute("stroke-dasharray", `${dashArray} ${gap}`);
    }

    circle.setAttribute("transform", "rotate(-90 35 35)");
    svg.appendChild(circle);

    // Optional gradient for new stories
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    linearGradient.setAttribute("id", "gradient");
    linearGradient.setAttribute("x1", "0%");
    linearGradient.setAttribute("y1", "0%");
    linearGradient.setAttribute("x2", "100%");
    linearGradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#feda75");
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#d62976");

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    return svg;
  };

  // Loop through stories and render rings
  window.stories.forEach((story) => {
    const storyItem = document.createElement("div");
    storyItem.classList.add("story-item");

    const storyCount = storyDataMocks[story.id]?.length || 1;
    const ring = createRing(storyCount, story.hasNewStory);

    const avatarWrapper = document.createElement("div");
    avatarWrapper.classList.add("story-avatar-wrapper");

    const avatar = document.createElement("img");
    avatar.src = story.avatar;
    avatar.alt = story.username;
    avatar.classList.add("story-avatar");

    avatarWrapper.appendChild(ring);
    avatarWrapper.appendChild(avatar);

    const name = document.createElement("div");
    name.classList.add("story-username");
    name.textContent = story.username;

    storyItem.appendChild(avatarWrapper);
    storyItem.appendChild(name);

    storyListContainer.appendChild(storyItem);
  });
});
