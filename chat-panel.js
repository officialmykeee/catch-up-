// Function to open chat panel
function openChatPanel(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    const chatMessages = document.getElementById('chatMessages');
    const fab = document.querySelector('.fab');
    // --- NEW: Select the main content container for the "push" effect
    const appContainer = document.querySelector('.app-container'); 

    if (!chatPanel || !chatList || !chatMessages || !fab || !appContainer) {
        console.error('Cannot open chat panel: Missing DOM elements', {
            chatPanel: !!chatPanel,
            chatList: !!chatList,
            chatMessages: !!chatMessages,
            fab: !!fab,
            appContainer: !!appContainer
        });
        return;
    }

    chatMessages.innerHTML = `<p>${chat.lastMessage}</p>`;
    chatPanel.classList.remove('hidden');

    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        // Append overlay to the app container
        appContainer.appendChild(overlay);
    }

    // chatList.classList.add('hidden'); // REMOVED: list should slide with the body
    chatPanel.classList.add('active');
    overlay.classList.add('active');
    fab.classList.add('hidden');
    
    // --- NEW: Trigger the body "push" transition
    appContainer.classList.add('chat-open'); 

    overlay.addEventListener('click', closeChatPanel, { once: true });
    console.log('Chat panel opened for:', chat.name);
}

// Function to close chat panel
function closeChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList');
    const overlay = document.querySelector('.chat-panel-overlay');
    const fab = document.querySelector('.fab');
    // --- NEW: Select the main content container for the "pull" effect
    const appContainer = document.querySelector('.app-container');

    if (!chatPanel || !chatList || !overlay || !fab || !appContainer) {
        console.error('Cannot close chat panel: Missing DOM elements', {
            chatPanel: !!chatPanel,
            chatList: !!chatList,
            overlay: !!overlay,
            fab: !!fab,
            appContainer: !!appContainer
        });
        return;
    }

    chatPanel.classList.remove('active');
    overlay.classList.remove('active');
    
    // --- NEW: Trigger the body "pull" transition
    appContainer.classList.remove('chat-open'); 

    // chatList.classList.remove('hidden'); // REMOVED: list should slide with the body
    fab.classList.remove('hidden');

    // Use the CSS transition duration (0.3s = 300ms) for the timeout
    setTimeout(() => {
        if (!chatPanel.classList.contains('active')) {
            chatPanel.classList.add('hidden');
            if (overlay) overlay.remove();
            console.log('Overlay removed');
        }
    }, 300);
}

// Expose openChatPanel
window.openChatPanel = openChatPanel;

