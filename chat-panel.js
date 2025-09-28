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
        return;
    }

    chatMessages.innerHTML = `<p>${chat.lastMessage}</p>`;
    chatPanel.classList.remove('hidden');

    let overlay = document.querySelector('.chat-panel-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'chat-panel-overlay';
        document.querySelector('.app-container').appendChild(overlay);
    }

    chatList.classList.add('hidden');
    chatPanel.classList.add('active');
    overlay.classList.add('active');
    fab.classList.add('hidden');

    overlay.addEventListener('click', closeChatPanel, { once: true });
    console.log('Chat panel opened for:', chat.name);
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

    chatPanel.classList.remove('active');
    overlay.classList.remove('active');
    chatList.classList.remove('hidden');
    fab.classList.remove('hidden');

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



