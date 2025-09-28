// Function to open chat panel
function openChatPanel(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList'); // The main content area
    const chatMessages = document.getElementById('chatMessages');
    const fab = document.querySelector('.fab');
    // Select the main container to trigger the slide (push)
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

    // Clear the messages container to ensure no placeholder content
    chatMessages.innerHTML = ''; 
    
    // 1. Make the panel visible (so it's included in the flex layout)
    chatPanel.classList.remove('hidden');

    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        // Append overlay to the main content wrapper (#chatList) so it slides with the body
        chatList.prepend(overlay); 
    }

    // 2. Start the animation
    overlay.classList.add('active');
    fab.classList.add('hidden');
    // This triggers the CSS transform on .app-container, causing the slide
    appContainer.classList.add('chat-open'); 

    overlay.addEventListener('click', closeChatPanel, { once: true });
    console.log('Chat panel opened for:', chat.name);
}

// Function to close chat panel
function closeChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const overlay = document.querySelector('.chat-panel-overlay');
    const fab = document.querySelector('.fab');
    const appContainer = document.querySelector('.app-container');

    if (!chatPanel || !overlay || !fab || !appContainer) {
        console.error('Cannot close chat panel: Missing DOM elements', {
            chatPanel: !!chatPanel,
            overlay: !!overlay,
            fab: !!fab,
            appContainer: !!appContainer
        });
        return;
    }

    // 1. Start the reverse animation (slide back/pull)
    overlay.classList.remove('active');
    // This triggers the CSS reverse transform
    appContainer.classList.remove('chat-open'); 

    fab.classList.remove('hidden');

    // 2. Hide the panel only after the transition completes (300ms)
    setTimeout(() => {
        if (!appContainer.classList.contains('chat-open')) {
            chatPanel.classList.add('hidden');
            if (overlay) overlay.remove();
            console.log('Overlay removed');
        }
    }, 300);
}

// Expose openChatPanel
window.openChatPanel = openChatPanel;

