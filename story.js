// Mock story data (duplicated here for story viewer access)
const storyDataMocks = {
    "your-story": [{ id: "your-story-status-1", content: "https://picsum.photos/id/1005/360/640", time: "Just Now", reply: "", isLiked: false }],
    "1": [{ id: 'emily1', content: 'https://picsum.photos/id/237/360/640', time: 'Just Now', reply: '', isLiked: false }],
    "2": [{ id: 'michael1', content: 'https://picsum.photos/id/1018/360/640', time: '1 hour ago', reply: '', isLiked: false }],
    "3": [{ id: 'sarah1', content: 'https://picsum.photos/id/1015/360/640', time: '2 hours ago', reply: '', isLiked: false }],
    "4": [{ id: 'david1', content: 'https://picsum.photos/id/1016/360/640', time: '3 hours ago', reply: '', isLiked: false }],
    "5": [{ id: 'jessica1', content: 'https://picsum.photos/id/1019/360/640', time: '4 hours ago', reply: '', isLiked: false }]
};

const storyViewerOverlay = document.getElementById('storyViewerOverlay');
const storyViewerContent = document.getElementById('storyViewerContent');

// Function to open story viewer
function openStoryViewer(storyId) {
    const data = storyDataMocks[storyId];

    if (!data || !data[0]?.content) {
        console.error("Story data not found for ID:", storyId);
        alert('Failed to find story data.');
        return;
    }

    // Set the story image
    storyViewerContent.src = data[0].content;
    storyViewerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Initialize drag variables
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const sensitivity = 0.5; // Very high sensitivity

    // Touch events
    storyViewerContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        storyViewerContent.style.transition = 'none';
    });

    storyViewerContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = (currentY - startY) * sensitivity;

        // Only allow downward drag
        if (deltaY > 0) {
            storyViewerContent.style.transform = `translateY(${deltaY}px)`;
        }
    });

    storyViewerContent.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        storyViewerContent.style.transition = 'transform 0.3s ease-out';

        // Close if dragged down significantly (100px)
        if (currentY - startY > 100) {
            closeStoryViewer();
        } else {
            // Snap back
            storyViewerContent.style.transform = 'translateY(0)';
        }
    });

    // Mouse events for desktop
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

    // Prevent default scrolling on touchmove
    storyViewerOverlay.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Close on click outside content
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
}

// Function to close story viewer
function closeStoryViewer() {
    storyViewerOverlay.classList.remove('show');
    storyViewerContent.src = '';
    storyViewerContent.style.transform = 'translateY(0)';
    document.body.style.overflow = '';
}
