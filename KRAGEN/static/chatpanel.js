// chatpanel.js - Chat panel and resize functionality

// Global variables for chat management
window.currentChatId = null;
window.chats = [];

// Global addMessage function that can be called from code.js
window.addMessage = function(message, type, shouldSave = true) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return; // Guard against DOM not being ready yet
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type + '-message';
    messageDiv.innerText = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save message to database if we have a current chat and shouldSave is true
    if (shouldSave && window.currentChatId) {
        fetch('/save_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: window.currentChatId,
                message: message,
                type: type
            })
        });
    }
};

// Function to create a new chat
function createNewChat(title = null) {
    // If no title provided, generate one with current date/time
    if (!title) {
        const now = new Date();
        title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }
    
    // Clear the chat interface more thoroughly
    const chatMessages = document.getElementById('chat-messages');
    while (chatMessages.firstChild) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
    
    // Create a new chat on the server
    return fetch('/create_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title })
    })
    .then(response => response.json())
    .then(data => {
        window.currentChatId = data.chat_id;
        // Add to local chat list and update UI
        window.chats.unshift({
            id: data.chat_id,
            title: data.title,
            created_at: new Date().toISOString()
        });
        updateChatHistoryPanel();
        
        // Update debug panel
        updateChatDebugInfo();
        
        // Clear the graph
        window.graph.clear();
        window.editor.graphcanvas.resize();
        
        return data;
    })
    .catch(error => {
        console.error('Error creating new chat:', error);
        throw error;
    });
}

// Function to update chat debug info
function updateChatDebugInfo() {
    const chatDebug = document.getElementById('chat-debug');
    const currentChatIdSpan = document.getElementById('current-chat-id');
    
    if (window.currentChatId) {
        chatDebug.style.display = 'block';
        currentChatIdSpan.textContent = window.currentChatId;
    } else {
        chatDebug.style.display = 'none';
        currentChatIdSpan.textContent = 'none';
    }
}

// Function to load a specific chat
function loadChat(chatId) {
    fetch(`/get_chat_messages?chat_id=${chatId}`)
    .then(response => response.json())
    .then(data => {
        // Set current chat ID
        window.currentChatId = chatId;
        
        // Update debug panel
        updateChatDebugInfo();
        
        // Clear messages area more thoroughly
        const chatMessages = document.getElementById('chat-messages');
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
        
        // Populate messages without saving them again (shouldSave = false)
        data.messages.forEach(msg => {
            window.addMessage(msg.message, msg.type, false);
        });
        
        // If there's graph data, load it
        if (data.chat.graph_data) {
            try {
                console.log("Loading graph data from chat:", chatId);
                const graphData = JSON.parse(data.chat.graph_data);
                
                // First clear the current graph
                window.graph.clear();
                
                // Then configure with saved data
                window.graph.configure(graphData);
                
                // Resize canvas to ensure proper display
                window.editor.graphcanvas.resize();
                window.updateEditorHiPPICanvas();
                
                console.log("Graph loaded successfully");
            } catch (e) {
                console.error('Error loading graph data:', e);
            }
        } else {
            console.log("No graph data found for chat:", chatId);
            // Clear the graph anyway to avoid showing previous graph
            window.graph.clear();
            window.editor.graphcanvas.resize();
        }
        
        // Update chat history UI
        updateChatHistoryPanel();
        
        // Hide history panel if it's open
        const historyPanel = document.getElementById('chat-history-panel');
        if (historyPanel && historyPanel.style.display === 'block') {
            toggleHistoryPanel();
        }
    })
    .catch(error => {
        console.error('Error loading chat:', error);
    });
}

// Function to fetch and update chat history
function fetchChatHistory() {
    fetch('/get_chats')
    .then(response => response.json())
    .then(data => {
        window.chats = data.chats;
        updateChatHistoryPanel();
    })
    .catch(error => {
        console.error('Error fetching chat history:', error);
    });
}

// Function to delete a chat
function deleteChat(chatId, event) {
    // Stop the click event from bubbling up to the parent (which would open the chat)
    event.stopPropagation();
    
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        return;
    }
    
    fetch('/delete_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chat_id: chatId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If the deleted chat is the currently active one, reset the UI
            if (window.currentChatId === chatId) {
                window.currentChatId = null;
                updateChatDebugInfo();
                
                // Clear chat interface thoroughly
                const chatMessages = document.getElementById('chat-messages');
                while (chatMessages.firstChild) {
                    chatMessages.removeChild(chatMessages.firstChild);
                }
                chatMessages.appendChild(createSystemMessage("Welcome to KRAGEN! Type a message and press send to start a new conversation."));
                chatMessages.appendChild(createSystemMessage("Ask me anything about biomedical knowledge, drug interactions, genetic data, or any other related topics."));
                
                // Clear the graph
                window.graph.clear();
                window.editor.graphcanvas.resize();
            }
            
            // Remove the chat from the local array
            window.chats = window.chats.filter(chat => chat.id !== chatId);
            
            // Update the UI
            updateChatHistoryPanel();
        } else {
            console.error('Error deleting chat:', data.error);
            alert('Error deleting chat: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error deleting chat:', error);
        alert('Error deleting chat: ' + error.message);
    });
}

// Helper function to create system message (moving outside the initChatPanel for reuse)
function createSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'system-message';
    div.innerText = text;
    return div;
}

// Update the chat history panel UI
function updateChatHistoryPanel() {
    const historyList = document.getElementById('chat-history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    // Create list items for each chat
    window.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-history-item';
        if (window.currentChatId === chat.id) {
            chatItem.classList.add('active');
        }
        
        // Left content: chat details
        const chatInfo = document.createElement('div');
        chatInfo.className = 'chat-info';
        
        const chatTitle = document.createElement('span');
        chatTitle.textContent = chat.title;
        chatTitle.className = 'chat-title';
        
        const chatDate = document.createElement('span');
        chatDate.textContent = new Date(chat.created_at).toLocaleString();
        chatDate.className = 'chat-date';
        
        chatInfo.appendChild(chatTitle);
        chatInfo.appendChild(chatDate);
        
        // Right content: delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&times;';
        deleteButton.className = 'delete-chat-button';
        deleteButton.title = 'Delete this chat';
        deleteButton.addEventListener('click', (e) => deleteChat(chat.id, e));
        
        // Container to align content
        const chatItemContainer = document.createElement('div');
        chatItemContainer.className = 'chat-item-container';
        chatItemContainer.appendChild(chatInfo);
        chatItemContainer.appendChild(deleteButton);
        
        chatItem.appendChild(chatItemContainer);
        
        // Make the entire chat item clickable, except the delete button
        chatItem.addEventListener('click', () => {
            loadChat(chat.id);
        });
        
        historyList.appendChild(chatItem);
    });
    
    // Add message if no chats
    if (window.chats.length === 0) {
        const noChats = document.createElement('div');
        noChats.className = 'no-chats-message';
        noChats.textContent = 'No chat history found. Start a new chat!';
        historyList.appendChild(noChats);
    }
}

// Toggle chat history panel visibility
function toggleHistoryPanel() {
    const historyPanel = document.getElementById('chat-history-panel');
    if (historyPanel.style.display === 'none' || !historyPanel.style.display) {
        historyPanel.style.display = 'block';
        fetchChatHistory(); // Refresh history when opening
    } else {
        historyPanel.style.display = 'none';
    }
}

// Initialize the chat panel and resize functionality
function initChatPanel() {
    // Elements
    const chatPanel = document.getElementById('chat-panel');
    const resizeHandle = document.getElementById('resize-handle');
    const mainContainer = document.getElementById('main');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // Create history button and new chat button if they don't exist
    if (!document.getElementById('chat-history-button')) {
        const chatHeader = document.createElement('div');
        chatHeader.id = 'chat-header';
        chatHeader.innerHTML = `
            <div class="chat-controls">
                <button id="new-chat-button">New Chat</button>
                <button id="chat-history-button">History</button>
            </div>
            <h3>KRAGEN Chat</h3>
        `;
        
        // Add the header to the top of the chat panel
        chatPanel.insertBefore(chatHeader, chatPanel.firstChild);
        
        // Create history panel
        const historyPanel = document.createElement('div');
        historyPanel.id = 'chat-history-panel';
        historyPanel.innerHTML = `
            <div class="history-header">
                <h3>Chat History</h3>
                <button id="close-history">×</button>
            </div>
            <div id="chat-history-list"></div>
        `;
        document.body.appendChild(historyPanel);
        
        // Event handlers for new buttons
        document.getElementById('new-chat-button').addEventListener('click', () => {
            // Only create a new chat if we're currently in a chat
            if (window.currentChatId) {
                createNewChat();
            } else {
                // If no chat is active, just clear the message area
                const chatMessages = document.getElementById('chat-messages');
                chatMessages.innerHTML = '';
                chatMessages.appendChild(createSystemMessage("Welcome to KRAGEN! Type a message and press send to start a new conversation."));
                chatMessages.appendChild(createSystemMessage("Ask me anything about biomedical knowledge, drug interactions, genetic data, or any other related topics."));
                
                // Clear the graph
                window.graph.clear();
                window.editor.graphcanvas.resize();
            }
        });
        
        document.getElementById('chat-history-button').addEventListener('click', () => {
            toggleHistoryPanel();
        });
        
        document.getElementById('close-history').addEventListener('click', () => {
            historyPanel.style.display = 'none';
        });
    }
    
    // Variables for resize
    let isResizing = false;
    let lastDownX = 0;
    let chatPanelWidth = 300; // Initial width

    // Add event listeners for resizing
    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        lastDownX = e.clientX;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        const offsetX = e.clientX - lastDownX;
        const newWidth = chatPanelWidth + offsetX;
        
        // Check if trying to drag beyond limits
        if ((newWidth >= 800 && offsetX > 0) || (newWidth <= 250 && offsetX < 0)) {
            // User is trying to drag beyond limits, stop resizing
            isResizing = false;
            // Set to exact limit
            chatPanelWidth = offsetX > 0 ? 800 : 250;
        } else {
            // Normal resize within limits
            chatPanelWidth = Math.max(250, Math.min(800, newWidth));
            lastDownX = e.clientX;
        }
        
        // Update positions and sizes
        chatPanel.style.width = chatPanelWidth + 'px';
        resizeHandle.style.left = chatPanelWidth + 'px';
        mainContainer.style.left = (chatPanelWidth + 8) + 'px';
        mainContainer.style.width = `calc(100% - ${chatPanelWidth + 8}px)`;
        
        // Update litegraph canvas
        if (window.editor) {
            window.editor.graphcanvas.resize();
            window.updateEditorHiPPICanvas();
        }
    });

    document.addEventListener('mouseup', function() {
        isResizing = false;
    });
    
    // Add mouseleave listener to handle cases where mouse moves outside browser window
    document.addEventListener('mouseleave', function() {
        if (isResizing) {
            isResizing = false;
        }
    });

    // Also handle cases where the mouse enters after leaving while in resize mode
    document.addEventListener('mouseenter', function(e) {
        // If mouse button is not pressed (mouseup happened outside), ensure resize mode is off
        if (e.buttons === 0) {
            isResizing = false;
        }
    });

    function handleUserMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.value = '';
        
        // Create a new chat if none exists, then add the message
        if (!window.currentChatId) {
            createNewChat().then(() => {
                // Add user message to chat after chat is created
                window.addMessage(message, 'user');
                processChatMessage(message);
            });
        } else {
            // Add user message to chat
            window.addMessage(message, 'user');
            processChatMessage(message);
        }
    }
    
    function processChatMessage(message) {
        // Create a Generate Plans node with user input
        const planNode = LiteGraph.createNode("KRAGEN/Generate_Plans");
        planNode.properties.input = message;
        planNode.mode = 1; // Set to processing mode immediately for visual feedback
        window.graph.add(planNode);
        
        // Position in center of canvas
        const canvasWidth = window.editor.canvas.width / window.devicePixelRatio;
        const canvasHeight = window.editor.canvas.height / window.devicePixelRatio;
        planNode.pos = [(canvasWidth - planNode.size[0]) / 2, (canvasHeight - planNode.size[1]) / 2];

        // Save initial graph state with just the node added (before execution)
        if (window.currentChatId) {
            window.saveCurrentGraphState();
        }

        // Add assistant response to chat
        setTimeout(() => {
            window.addMessage("I've created a Generate Plans node with your question. Starting processing now...", 'assistant');
            
            // Execute the node to start processing
            planNode.onExecute();
        }, 500);
    }
    
    // Function to save current graph state
    window.saveCurrentGraphState = function() {
        const graphData = window.graph.serialize();
        
        fetch('/save_graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: window.currentChatId,
                graph_data: graphData
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Graph state saved successfully");
        })
        .catch(error => {
            console.error('Error saving graph state:', error);
        });
    };

    // Event listeners for chat
    sendButton.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });
    
    // We no longer create a new chat on startup
    // Instead, we'll only create one when user sends a message
}

// Ensure the canvas gets resized properly on window resize
const originalWindowResize = window.onresize || function() {};
window.onresize = function() {
    originalWindowResize();
    
    if (window.editor) {
        window.editor.graphcanvas.resize();
        window.updateEditorHiPPICanvas();
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initChatPanel); 