// Function to open chat panel
function openChatPanel(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    const chatMessages = document.getElementById('chatMessages');
    const fab = document.querySelector('.fab');

    // Check if all required elements exist
    if (!chatPanel || !chatList || !chatMessages || !fab) {
        console.error('Missing DOM elements:', {
            chatPanel: !!chatPanel,
            chatList: !!chatList,
            chatMessages: !!chatMessages,
            fab: !!fab
        });
        return;
    }

    // Set chat panel content
    chatMessages.innerHTML = `<p>${chat.lastMessage}</p>`; // Placeholder for messages
    chatPanel.classList.remove('hidden'); // Ensure panel is visible

    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        document.querySelector('.app-container').appendChild(overlay);
    }

    // Trigger transitions
    setTimeout(() => {
        chatList.classList.add('hidden');
        chatPanel.classList.add('active');
        overlay.classList.add('active');
        fab.classList.add('hidden');
    }, 0); // Ensure DOM updates are applied before transition

    // Handle overlay click to close
    overlay.addEventListener('click', closeChatPanel, { once: true });

    console.log('Chat panel opened for:', chat.name);
}

// Function to close chat panel
function closeChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    const overlay = document.querySelector('.chat-panel-overlay');
    const fab = document.querySelector('.fab');

    // Check if all required elements exist
    if (!chatPanel || !chatList || !overlay || !fab) {
        console.error('Missing DOM elements during close:', {
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

    // Remove overlay after transition
    setTimeout(() => {
        if (overlay && !chatPanel.classList.contains('active')) {
            overlay.remove();
            console.log('Overlay removed');
        }
    }, 300);

    console.log('Chat panel closed');
}

// Expose openChatPanel to the global scope for index.html to use
window.openChatPanel = openChatPanel;
