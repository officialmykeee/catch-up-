// Function to open chat panel
function openChatPanel(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatList = document.getElementById('chatList'); // The main content area
    const chatMessages = document.getElementById('chatMessages');
    const fab = document.querySelector('.fab');
    // Select the main content container for the "push" effect
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

    // Clear the messages container to ensure no placeholder content is visible
    chatMessages.innerHTML = ''; 
    
    // --- STEP 1: Prepare the panel for the slide
    chatPanel.classList.remove('hidden');

    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        // Append overlay to the main content wrapper (#chatList) so it slides with the body
        chatList.prepend(overlay); 
    }

    // --- STEP 2: Start the slide and dim the background
    overlay.classList.add('active');
    fab.classList.add('hidden');
    // This is the single line that triggers the combined slide/push animation
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

    // --- STEP 1: Start the slide back and fade the dimming
    overlay.classList.remove('active');
    // This is the single line that triggers the reverse slide/pull animation
    appContainer.classList.remove('chat-open'); 

    fab.classList.remove('hidden');

    // --- STEP 2: Hide the panel after the transition completes (300ms)
    // This is crucial to prevent the panel from briefly appearing on the right
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

