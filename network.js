/**
 * network.js
 * Handles network status checking, chat data, and UI updates.
 */

import { renderStories } from './constory.js';
import { renderStoriesSkeleton, renderChatSkeleton } from './skele.js';

// --- Chat data stays here ---
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

// --- Chat Rendering ---
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
            if (window.openChatPanel) window.openChatPanel(chat);
        });

        chatElement.addEventListener('mousedown', () => chatElement.classList.add('pressed'));
        chatElement.addEventListener('mouseup', () => chatElement.classList.remove('pressed'));
        chatElement.addEventListener('mouseleave', () => chatElement.classList.remove('pressed'));

        chatList.appendChild(chatElement);
    });
}

// --- Network Status Logic ---
let isCurrentlyLoading = false;

function showConnectingState() {
    isCurrentlyLoading = true;
    document.querySelector('.messages-icon').classList.add('hidden');
    document.querySelector('.telegram-ring').classList.remove('hidden');
    document.querySelector('.header-title').innerHTML = 'Connecting';
    document.getElementById('storiesContainer').classList.add('hidden');
    document.getElementById('chatList').classList.add('hidden');
    document.getElementById('storiesLoadingSkeleton').classList.remove('hidden');
    document.getElementById('loadingSkeleton').classList.remove('hidden');
}

function showOnlineState() {
    isCurrentlyLoading = false;
    document.querySelector('.telegram-ring').classList.add('hidden');
    document.querySelector('.messages-icon').classList.remove('hidden');
    document.querySelector('.header-title').innerHTML = 'Messages';
    document.getElementById('storiesLoadingSkeleton').classList.add('hidden');
    document.getElementById('loadingSkeleton').classList.add('hidden');
    document.getElementById('storiesContainer').classList.remove('hidden');
    document.getElementById('chatList').classList.remove('hidden');

    renderStories();
    renderChats();
}

function showOfflineState() {
    isCurrentlyLoading = false;
    document.querySelector('.messages-icon').classList.add('hidden');
    document.querySelector('.telegram-ring').classList.remove('hidden');
    document.querySelector('.header-title').innerHTML = '<span>Waiting</span><span class="fade-text"> for Network</span>';
    document.getElementById('storiesContainer').classList.add('hidden');
    document.getElementById('chatList').classList.add('hidden');
    document.getElementById('storiesLoadingSkeleton').classList.remove('hidden');
    document.getElementById('loadingSkeleton').classList.remove('hidden');
}

// --- Exported API ---
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
    if (fab) {
        fab.addEventListener('click', () => {
            if (navigator.onLine) {
                console.log('FAB clicked! Add your action here (e.g., open new chat modal).');
            } else {
                console.log('Cannot perform action: Device is offline.');
            }
        });
    }
}
