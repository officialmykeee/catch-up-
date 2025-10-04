// spin.js

document.addEventListener("DOMContentLoaded", () => {
    const storyItems = document.querySelectorAll(".story-item");

    storyItems.forEach(item => {
        item.addEventListener("click", () => {
            const ring = item.querySelector(".story-avatar-ring.has-story");

            if (ring) {
                // Add spin class
                ring.classList.add("spin");

                // Remove after animation ends
                ring.addEventListener("animationend", () => {
                    ring.classList.remove("spin");

                    // 🔥 This is where you show the story
                    const storyImg = item.querySelector(".story-avatar")?.src;
                    if (storyImg) {
                        const overlay = document.getElementById("storyViewerOverlay");
                        const viewer = document.getElementById("storyViewerContent");
                        viewer.src = storyImg;
                        overlay.style.display = "flex"; // make sure you styled overlay with `display: none;` by default
                    }
                }, { once: true });
            }
        });
    });
});
