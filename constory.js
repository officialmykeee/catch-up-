/**
 * constory.js
 * Handles all story-related mock data and rendering.
 */

// --- Mock Stories Data ---
export const stories = [
    { id: "your-story", username: "Your story", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: false, isYourStory: true },
    { id: "1", username: "Emily", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "2", username: "Michael", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "3", username: "Sarah", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "4", username: "David", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "5", username: "Jessica", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true }
];

// --- Mock Story Content ---
export const storyDataMocks = {
    "your-story": [{ id: "your-story-status-1", content: "https://picsum.photos/id/1005/360/640", time: "Just Now", reply: "", isLiked: false }],
    "1": [{ id: 'emily1', content: 'https://picsum.photos/id/237/360/640', time: 'Just Now', reply: '', isLiked: false }],
    "2": [{ id: 'michael1', content: 'https://picsum.photos/id/1018/360/640', time: '1 hour ago', reply: '', isLiked: false }],
    "3": [{ id: 'sarah1', content: 'https://picsum.photos/id/1015/360/640', time: '2 hours ago', reply: '', isLiked: false }],
    "4": [{ id: 'david1', content: 'https://picsum.photos/id/1016/360/640', time: '3 hours ago', reply: '', isLiked: false }],
    "5": [{ id: 'jessica1', content: 'https://picsum.photos/id/1019/360/640', time: '4 hours ago', reply: '', isLiked: false }]
};

// --- Rendering Function ---
export function renderStories() {
    const storiesList = document.getElementById('storiesList');
    if (!storiesList) return;
    storiesList.innerHTML = '';

    stories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story-item';

        const avatarRingClass = story.isYourStory ? 'your-story' : (story.hasNewStory ? 'has-story' : 'your-story');

        storyElement.innerHTML = `
            <div class="story-avatar-container">
                <div class="story-avatar-ring ${avatarRingClass}">
                    <div class="story-avatar-bg">
                        <img src="${story.avatar}" alt="${story.username}" class="story-avatar">
                    </div>
                </div>
                ${story.isYourStory ? '<div class="story-plus">+</div>' : ''}
            </div>
            <span class="story-username">${story.username}</span>
        `;

        // Story click handler → open viewer
        storyElement.addEventListener('click', () => {
            console.log('Story clicked:', story.id);
            window.openStoryViewer(story.id);  // story.js handles viewer logic
        });

        storiesList.appendChild(storyElement);
    });
}
