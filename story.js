// --- CRITICAL FIX: Expose the main function at the top for use by HTML-side listeners ---
window.showStoryPopup = showStoryPopup;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Story system initialized.");
});

// --- Utility: detect best content fit (Instagram logic) ---
function detectContentFit(element) {
    const contentWidth = element.naturalWidth || element.videoWidth || 0;
    const contentHeight = element.naturalHeight || element.videoHeight || 0;
    if (!contentWidth || !contentHeight) {
        console.warn("Invalid content dimensions:", { width: contentWidth, height: contentHeight });
        return "blur"; // fallback
    }

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const containerAspect = viewportWidth / viewportHeight;
    const contentAspect = contentWidth / contentHeight;

    console.log("Aspect ratios:", { contentAspect, containerAspect });

    // Instagram-like behavior
    if (contentAspect < containerAspect) {
        return "blur";   // portrait → blurred background
    }
    return "stretch";    // landscape → cover screen
}

// --- Main popup function ---
function showStoryPopup(storySrc, type = "image") {
    let popup = document.querySelector(".story-popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.className = "story-popup";
        popup.innerHTML = `
            <div class="story-background"></div>
            <div class="story-content-wrapper">
                <div class="story-content"></div>
            </div>
            <div class="story-progress"></div>
            <button class="story-close">&times;</button>
            <div class="story-nav left"></div>
            <div class="story-nav right"></div>
        `;
        document.body.appendChild(popup);
        console.log("Popup created.");
    } else {
        console.log("Reusing popup.");
    }

    const contentContainer = popup.querySelector(".story-content");
    const background = popup.querySelector(".story-background");
    contentContainer.innerHTML = "";

    let media;
    if (type === "video") {
        media = document.createElement("video");
        media.src = storySrc;
        media.autoplay = true;
        media.loop = true;
        media.playsInline = true;
        media.muted = true; // autoplay requirement
        media.addEventListener("loadedmetadata", () => {
            const fitMode = detectContentFit(media);
            applyContentFit(fitMode, media, background);
        });
    } else {
        media = document.createElement("img");
        media.src = storySrc;
        media.addEventListener("load", () => {
            const fitMode = detectContentFit(media);
            applyContentFit(fitMode, media, background);
        });
    }

    contentContainer.appendChild(media);
    popup.style.visibility = "visible";
    popup.style.opacity = "1";
    popup.style.transform = "translateY(0)";
    popup.classList.add("active");

    setupStoryEvents(popup, media);
    startProgressBar(popup);
}

// --- Apply fit mode to media + background ---
function applyContentFit(mode, media, background) {
    if (mode === "blur") {
        media.style.objectFit = "contain";
        background.style.backgroundImage = `url(${media.src})`;
        background.classList.add("blurred");
    } else {
        media.style.objectFit = "cover";
        background.style.backgroundImage = "none";
        background.classList.remove("blurred");
    }
    console.log("Applied content fit:", mode);
}

// --- Progress bar ---
function startProgressBar(popup) {
    const progressBar = popup.querySelector(".story-progress");
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    setTimeout(() => {
        progressBar.style.transition = "width 5s linear";
        progressBar.style.width = "100%";
    }, 50);

    setTimeout(() => {
        closeStoryPopup();
    }, 5000);
}

// --- Setup events (close, nav, keyboard) ---
function setupStoryEvents(popup, media) {
    const closeBtn = popup.querySelector(".story-close");
    closeBtn.onclick = () => closeStoryPopup();

    const navLeft = popup.querySelector(".story-nav.left");
    const navRight = popup.querySelector(".story-nav.right");

    navLeft.onclick = () => {
        console.log("Prev story (placeholder)");
    };
    navRight.onclick = () => {
        console.log("Next story (placeholder)");
    };

    document.onkeydown = (e) => {
        if (e.key === "Escape") closeStoryPopup();
        if (e.key === "ArrowLeft") console.log("Prev story (keyboard placeholder)");
        if (e.key === "ArrowRight") console.log("Next story (keyboard placeholder)");
    };

    popup.onclick = (e) => {
        if (e.target === popup) {
            closeStoryPopup();
        }
    };
}

// --- Close popup ---
function closeStoryPopup() {
    const popup = document.querySelector(".story-popup");
    if (!popup) return;

    popup.style.opacity = "0";
    popup.style.transform = "translateY(100%)";
    popup.style.visibility = "hidden";

    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
            console.log("Popup closed and removed.");
        }
    }, 300);
}
