/**
 * network.js
 * Handles network status checking, data fetching simulation, and UI updates.
 */

import { renderStoriesSkeleton, renderChatSkeleton } from './skele.js';

// --- Mock Data ---

// Stories data (exposed globally for story.js)
window.stories = [
    { id: "your-story", username: "Your story", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: false, isYourStory: true },
    { id: "1", username: "Emily", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "2", username: "Michael", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "3", username: "Sarah", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "4", username: "David", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "5", username: "Jessica", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true }
];

// Mock story content data (exposed globally for story.js)
window.storyDataMocks = {
    "your-story": [
        { id: "your-story-status-1", content: "https://picsum.photos/id/1005/360/640", time: "Just Now", reply: "", isLiked: false },
        { id: "your-story-status-2", content: "https://picsum.photos/id/1006/360/640", time: "5 min ago", reply: "", isLiked: false }
    ],
    "1": [
        { id: "emily1", content: "https://picsum.photos/id/237/360/640", time: "Just Now", reply: "", isLiked: false },
        { id: "emily2", content: "https://picsum.photos/id/238/360/640", time: "10 min ago", reply: "", isLiked: false },
        { id: "emily3", content: "https://picsum.photos/id/239/360/640", time: "15 min ago", reply: "", isLiked: false }
    ],
    "2": [
        { id: "michael1", content: "https://picsum.photos/id/1018/360/640", time: "1 hour ago", reply: "", isLiked: false },
        { id: "michael2", content: "https://picsum.photos/id/1019/360/640", time: "2 hours ago", reply: "", isLiked: false }
    ],
    "3": [
        { id: "sarah1", content: "https://picsum.photos/id/1015/360/640", time: "2 hours ago", reply: "", isLiked: false }
    ],
    "4": [
        { id: "david1", content: "https://picsum.photos/id/1016/360/640", time: "3 hours ago", reply: "", isLiked: false },
        { id: "david2", content: "https://picsum.photos/id/1017/360/640", time: "4 hours ago", reply: "", isLiked: false }
    ],
    "5": [
        { id: "jessica1", content: "https://picsum.photos/id/1019/360/640", time: "4 hours ago", reply: "", isLiked: false },
        { id: "jessica2", content: "https://picsum.photos/id/1020/360/640", time: "5 hours ago", reply: "", isLiked: false }
    ]
};

// Chat data (unchanged)
const chats = [
    {
        id: "1",
        name: "Emma Wilson",
        lastMessage: "Hey! Are we still on for dinner tonight?",
        timestamp: "2:34 PM",
        avatar: "EW",
        unreadCount: 2,
        isOnline: true,
        messages: [{ id: "m1", text: "Hey! Are we still on for dinner tonight?", time: "2:34 PM", isSent: false }]
    },
    {
        id: "2",
        name: "Family",
        lastMessage: "Mom: Don't forget about Sunday brunch!",
        timestamp: "1:15 PM",
        avatar: "F",
        unreadCount: 5,
        messages: [{ id: "m2", text: "Mom: Don't forget about Sunday brunch!", time: "1:15 PM", isSent: false }]
    },
    {
        id: "3",
        name: "Tech Team Chat",
        lastMessage: "Deploy successful. Monitoring logs now.",
        timestamp: "10:00 AM",
        avatar: "TT",
        unreadCount: 0,
        isSent: true,
        isOnline: false,
        messages: []
    },
    {
        id: "4",
        name: "Alice Johnson",
        lastMessage: "Sounds good, I'll send you the details.",
        timestamp: "Yesterday",
        avatar: "AJ",
        unreadCount: 0,
        isOnline: true,
        messages: []
    },
];

// --- Rendering Functions ---

// Function to render stories
function renderStories() {
    const storiesList = document.getElementById('storiesList');
    if (!storiesList) return;
    storiesList.innerHTML = '';

    window.stories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story-item';

        // Determine the ring class based on story count and user type
        let avatarRingClass = 'your-story';
        if (!story.isYourStory) {
            const storyCount = window.storyDataMocks[story.id]?.length || 0;
            avatarRingClass = storyCount === 1 ? 'single-story' : (storyCount > 1 ? 'has-story' : 'your-story');
        }

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

        storyElement.addEventListener('click', () => {
            console.log('Story clicked:', story.id);
            const storyData = window.storyDataMocks[story.id];
            if (storyData && storyData.length > 0) {
                window.openStoryViewer(story.id, storyData, 0);
            } else {
                console.error('No content found for story ID:', story.id);
                alert('Failed to find story data.');
            }
        });

        storiesList.appendChild(storyElement);
    });
}

// Function to render chat items (unchanged)
function renderChats() {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    chatList.innerHTML = '';

    chats.forEach(chat => {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';

        const onlineIndicator = chat.isOnline ? '<div class="online-indicator"></div>' : '';
        const unreadBadge = chat.unreadCount ? `<div class="unread-badge">${chat.unreadCount}</div>` : '';
        const sentIndicator = chat.isSent && !chat.unreadCount ? `
            <div class="sent-indicator">
                <svg viewBox="0 0 16 16" style="width: 16px; height: 16px; color: #3b82f6; fill: currentColor;">
                    <path d="M15.854 5.354L6.5 14.707a.5.5 0 0 1-.708 0L2.146 11.06a.5.5 0 0 1 .708-.708L6.5 13.998l8.646-8.646a.5.5 0 0 1 .708.708z"/>
                </svg>
            </div>
        ` : '';

        const messageClass = chat.unreadCount ? 'unread' : '';

        chatElement.innerHTML = `
            <div class="chat-content">
                <div class="chat-avatar-container">
                    <div class="chat-avatar">${chat.avatar}</div>
                    ${onlineIndicator}
                </div>
                <div class="chat-details">
                    <div class="chat-header">
                        <h3 class="chat-name">${chat.name}</h3>
                        <div class="chat-meta">
                            <span class="chat-timestamp">${chat.timestamp}</span>
                            ${unreadBadge}
                            ${sentIndicator}
                        </div>
                    </div>
                    <p class="chat-message ${messageClass}">${chat.lastMessage}</p>
                </div>
            </div>
        `;

        chatElement.addEventListener('click', () => {
            console.log('Chat clicked:', chat.id);
            window.openChatPanel(chat);
        });

        chatElement.addEventListener('mousedown', () => {
            chatElement.classList.add('pressed');
        });

        chatElement.addEventListener('mouseup', () => {
            chatElement.classList.remove('pressed');
        });

        chatElement.addEventListener('mouseleave', () => {
            chatElement.classList.remove('pressed');
        });

        chatList.appendChild(chatElement);
    });
}

// --- Network Status Logic (unchanged) ---

let isCurrentlyLoading = false;

function showConnectingState() {
    isCurrentlyLoading = true;
    const messagesIcon = document.querySelector('.messages-icon');
    const telegramRing = document.querySelector('.telegram-ring');
    const headerTitle = document.querySelector('.header-title');
    const storiesContainer = document.getElementById('storiesContainer');
    const chatList = document.getElementById('chatList');
    const storiesLoadingSkeleton = document.getElementById('storiesLoadingSkeleton');
    const loadingSkeleton = document.getElementById('loadingSkeleton');

    messagesIcon.classList.add('hidden');
    telegramRing.classList.remove('hidden');
    headerTitle.innerHTML = 'Connecting';
    storiesContainer.classList.add('hidden');
    chatList.classList.add('hidden');
    storiesLoadingSkeleton.classList.remove('hidden');
    loadingSkeleton.classList.remove('hidden');
}

function showOnlineState() {
    isCurrentlyLoading = false;
    const messagesIcon = document.querySelector('.messages-icon');
    const telegramRing = document.querySelector('.telegram-ring');
    const headerTitle = document.querySelector('.header-title');
    const storiesContainer = document.getElementById('storiesContainer');
    const chatList = document.getElementById('chatList');
    const storiesLoadingSkeleton = document.getElementById('storiesLoadingSkeleton');
    const loadingSkeleton = document.getElementById('loadingSkeleton');

    telegramRing.classList.add('hidden');
    messagesIcon.classList.remove('hidden');
    headerTitle.innerHTML = 'Messages';
    storiesLoadingSkeleton.classList.add('hidden');
    loadingSkeleton.classList.add('hidden');
    storiesContainer.classList.remove('hidden');
    chatList.classList.remove('hidden');

    renderStories();
    renderChats();
}

function showOfflineState() {
    isCurrentlyLoading = false;
    const messagesIcon = document.querySelector('.messages-icon');
    const telegramRing = document.querySelector('.telegram-ring');
    const headerTitle = document.querySelector('.header-title');
    const storiesContainer = document.getElementById('storiesContainer');
    const chatList = document.getElementById('chatList');
    const storiesLoadingSkeleton = document.getElementById('storiesLoadingSkeleton');
    const loadingSkeleton = document.getElementById('loadingSkeleton');
    
    messagesIcon.classList.add('hidden');
    telegramRing.classList.remove('hidden');
    headerTitle.innerHTML = '<span>Waiting</span><span class="fade-text"> for Network</span>';
    storiesContainer.classList.add('hidden');
    chatList.classList.add('hidden');
    storiesLoadingSkeleton.classList.remove('hidden');
    loadingSkeleton.classList.remove('hidden');
}

export function updateNetworkStatus() {
    const isOnline = navigator.onLine;

    if (isOnline) {
        if (!isCurrentlyLoading) {
            showConnectingState();
            setTimeout(showOnlineState, 1000);
        }
    } else {
        showOfflineState();
    }
}

function initSkeleton() {
    renderStoriesSkeleton();
    renderChatSkeleton();
}

export function initNetworkLogic() {
    initSkeleton();
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const fab = document.querySelector('.fab');
    fab.addEventListener('click', () => {
        if (navigator.onLine) {
            console.log('FAB clicked! Add your action here (e.g., open new chat modal).');
        } else {
            console.log('Cannot perform action: Device is offline.');
        }
    });
}
