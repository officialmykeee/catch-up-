// Function to open chat panel
function openChatPanel(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatMessages = document.getElementById('chatMessages');
    const fab = document.querySelector('.fab');
    // --- MODIFIED: The .app-container is now the element that slides
    const appContainer = document.querySelector('.app-container'); 
    // The main chat list area is where the overlay lives
    const chatListArea = document.getElementById('chatList');

    if (!chatPanel || !chatMessages || !fab || !appContainer || !chatListArea) {
        console.error('Cannot open chat panel: Missing DOM elements', {
            chatPanel: !!chatPanel,
            chatMessages: !!chatMessages,
            fab: !!fab,
            appContainer: !!appContainer,
            chatListArea: !!chatListArea
        });
        return;
    }

    // Clear the messages container
    chatMessages.innerHTML = ''; 
    
    // --- STEP 1: Prepare the panel for the slide
    chatPanel.classList.remove('hidden');

    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        // Append overlay to the main content wrapper (#chatList)
        chatListArea.prepend(overlay); 
    }

    // --- STEP 2: Start the slide and dim the background
    overlay.classList.add('active');
    fab.classList.add('hidden');
    // This triggers the combined slide/push animation on the .app-container
    appContainer.classList.add('chat-open'); 

    overlay.addEventListener('click', closeChatPanel, { once: true });
    console.log('Chat panel opened for:', chat.name);
}

// Function to close chat panel
function closeChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const overlay = document.querySelector('.chat-panel-overlay');
    const fab = document.querySelector('.fab');
    // --- MODIFIED: The .app-container is the element that slides
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

    // --- STEP 1: Start the slide back and fade the dimming
    overlay.classList.remove('active');
    // This triggers the reverse slide/pull animation on the .app-container
    appContainer.classList.remove('chat-open'); 

    fab.classList.remove('hidden');

    // --- STEP 2: Hide the panel after the transition completes (300ms)
    setTimeout(() => {
        // Only hide if the appContainer has fully transitioned back
        if (!appContainer.classList.contains('chat-open')) {
            chatPanel.classList.add('hidden');
            if (overlay) overlay.remove();
            console.log('Overlay removed');
        }
    }, 300);
}

// Expose openChatPanel
window.openChatPanel = openChatPanel;


