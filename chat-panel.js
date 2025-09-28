// Initialize chat panel listeners
function initChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    if (!chatPanel || !chatList) {
        console.error('Chat panel initialization failed: Missing elements', {
            chatPanel: !!chatPanel,
            chatList: !!chatList
        });
        return;
    }

    // Use event delegation for chat items
    chatList.addEventListener('click', (event) => {
        const chatItem = event.target.closest('.chat-item');
        if (chatItem) {
            const chatId = chatItem.dataset.chatId;
            const chat = window.chats.find(c => c.id === chatId);
            if (chat) {
                console.log('Opening chat panel for:', chat.name);
                openChatPanel(chat);
            } else {
                console.error('Chat data not found for ID:', chatId);
            }
        }
    });
}

// Function to open chat panel
function openChatPanel(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    const chatMessages = document.getElementById('chatMessages');
    const fab = document.querySelector('.fab');

    if (!chatPanel || !chatList || !chatMessages || !fab) {
        console.error('Cannot open chat panel: Missing DOM elements', {
            chatPanel: !!chatPanel,
            chatList: !!chatList,
            chatMessages: !!chatMessages,
            fab: !!fab
        });
        alert('Error: Unable to open chat. Please check the console for details.');
        return;
    }

    // Set chat panel content
    chatMessages.innerHTML = `<p>${chat.lastMessage}</p>`;
    chatPanel.classList.remove('hidden');

    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        document.querySelector('.app-container').appendChild(overlay);
    }

    // Trigger transitions
    chatList.classList.add('hidden');
    chatPanel.classList.add('active');
    overlay.classList.add('active');
    fab.classList.add('hidden');

    // Handle overlay click to close
    overlay.addEventListener('click', closeChatPanel, { once: true });
}

// Function to close chat panel
function closeChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    const overlay = document.querySelector('.chat-panel-overlay');
    const fab = document.querySelector('.fab');

    if (!chatPanel || !chatList || !overlay || !fab) {
        console.error('Cannot close chat panel: Missing DOM elements', {
            chatPanel: !!chatPanel,
            chatList: !!chatList,
            overlay: !!overlay,
            fab: !!fab
        });
        return;
    }

    // Trigger transitions
    chatPanel.classList.remove('active');
    overlay.classList.remove('active');
    chatList.classList.remove('hidden');
    fab.classList.remove('hidden');

    // Hide panel and remove overlay after transition
    setTimeout(() => {
        if (!chatPanel.classList.contains('active')) {
            chatPanel.classList.add('hidden');
            if (overlay) {
                overlay.remove();
                console.log('Overlay removed');
            }
        }
    }, 300);
}

// Expose openChatPanel and initChatPanel to the global scope
window.openChatPanel = openChatPanel;
window.initChatPanel = initChatPanel;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (window.initChatPanel) {
        window.initChatPanel();
    } else {
        console.error('initChatPanel is not defined. Ensure chat-panel.js is loaded correctly.');
    }
});
