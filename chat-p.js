// Expose openChatPanel globally
window.openChatPanel = function(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const chatPanelTitle = document.getElementById('chatPanelTitle');
    const chatPanelContent = document.getElementById('chatPanelContent');
    const appContainer = document.querySelector('.app-container');
    const fab = document.querySelector('.fab');

    console.log('Opening chat panel for:', chat.name); // Debug log

    // Set chat panel content
    chatPanelTitle.textContent = chat.name;
    chatPanelContent.innerHTML = chat.messages.map(msg => `
        <div class="chat-panel-message">${msg.text}</div>
    `).join('');

    // Slide in chat panel, slide out app container
    chatPanel.classList.add('open');
    appContainer.classList.add('slide-out');
    fab.classList.add('hidden');

    // Add back button handler
    const backButton = document.querySelector('.chat-panel-back');
    backButton.onclick = closeChatPanel;

    function closeChatPanel() {
        // Slide out chat panel, slide in app container
        chatPanel.classList.remove('open');
        appContainer.classList.remove('slide-out');
        fab.classList.remove('hidden');
    }
};
