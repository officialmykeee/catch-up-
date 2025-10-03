/**
 * skele.js
 * Contains functions for rendering skeleton loading states.
 */

// Function to render stories skeleton loading
export function renderStoriesSkeleton() {
    const skeletonStoriesList = document.getElementById('skeletonStoriesList');
    if (!skeletonStoriesList) return;
    skeletonStoriesList.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const skeletonStoryElement = document.createElement('div');
        skeletonStoryElement.className = 'skeleton-story-item';

        skeletonStoryElement.innerHTML = `
            <div class="skeleton skeleton-story-avatar"></div>
            <div class="skeleton skeleton-story-name"></div>
        `;

        skeletonStoriesList.appendChild(skeletonStoryElement);
    }
}

// Function to render chat skeleton loading
export function renderChatSkeleton() {
    const loadingSkeleton = document.getElementById('loadingSkeleton');
    if (!loadingSkeleton) return;
    loadingSkeleton.innerHTML = '';

    const messageWidths = ['long', 'short', 'medium', 'long', 'medium', 'short'];

    for (let i = 0; i < 6; i++) {
        const skeletonElement = document.createElement('div');
        skeletonElement.className = 'skeleton-chat-item';

        const messageClass = messageWidths[i] ? `skeleton-message ${messageWidths[i]}` : 'skeleton-message';

        skeletonElement.innerHTML = `
            <div class="skeleton-chat-content">
                <div class="skeleton skeleton-avatar"></div>
                <div class="skeleton-details">
                    <div class="skeleton-header">
                        <div class="skeleton skeleton-name" style="width: ${Math.floor(Math.random() * (140 - 80) + 80)}px;"></div>
                        <div class="skeleton skeleton-time"></div>
                    </div>
                    <div class="skeleton ${messageClass}"></div>
                </div>
            </div>
        `;

        loadingSkeleton.appendChild(skeletonElement);
    }
}

