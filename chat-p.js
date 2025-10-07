// Expose openChatPanel globally
window.openChatPanel = function(chat) {
    const chatPanel = document.getElementById('chatPanel');
    const appContainer = document.querySelector('.app-container');
    const fab = document.querySelector('.fab');

    console.log('Opening chat panel for:', chat.name); // Debug log

    // Build chat panel header and content dynamically
    chatPanel.innerHTML = `
        <div class="chat-panel-header">
            <div class="chat-panel-back">
                <i class="fa-solid fa-arrow-left"></i>
            </div>

            <div class="chat-panel-avatar" id="chatPanelAvatar">${chat.name.charAt(0).toUpperCase()}</div>

            <div class="chat-panel-userinfo">
                <div class="chat-panel-username" id="chatPanelTitle">${chat.name}</div>
                <div class="chat-panel-lastseen" id="chatPanelLastSeen">${chat.lastSeen || 'online'}</div>
            </div>

            <div class="chat-panel-menu">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </div>
        </div>

        <div class="chat-panel-content" id="chatPanelContent">
            ${chat.messages.map(msg => `
                <div class="chat-panel-message">${msg.text}</div>
            `).join('')}
        </div>
    `;

    // Slide in chat panel, slide out app container
    chatPanel.classList.add('open');
    appContainer.classList.add('slide-out');
    fab.classList.add('hidden');

    // Back button functionality
    const backButton = chatPanel.querySelector('.chat-panel-back');
    backButton.onclick = closeChatPanel;

    // Optional menu button
    const menuButton = chatPanel.querySelector('.chat-panel-menu');
    menuButton.onclick = () => console.log('Menu clicked');

    function closeChatPanel() {
        // Slide out chat panel, slide in app container
        chatPanel.classList.remove('open');
        appContainer.classList.remove('slide-out');
        fab.classList.remove('hidden');
    }
};
