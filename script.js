document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages-container');
    const themeToggle = document.getElementById('theme-toggle');
    const quickBtns = document.querySelectorAll('.quick-btn');
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('darker-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('darker-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Quick buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.innerText;
            chatInput.style.height = 'auto';
            sendBtn.removeAttribute('disabled');
            chatInput.focus();
        });
    });

    // Sidebar interactions
    const newChatBtn = document.querySelector('.new-chat-btn');
    const historyItems = document.querySelectorAll('.history-item');

    newChatBtn.addEventListener('click', () => {
        historyItems.forEach(item => item.classList.remove('active'));
        messagesContainer.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>System initialized. Secure connection established. <i class="fa-solid fa-lock" style="color: var(--neon-green); font-size: 0.9em;"></i></p>
                    <p>How can I assist you with your cybersecurity operations today?</p>
                </div>
            </div>
        `;
    });

    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            historyItems.forEach(h => h.classList.remove('active'));
            item.classList.add('active');
            
            const topic = item.querySelector('span').innerText;
            chatInput.value = "Tell me about: " + topic;
            chatInput.style.height = 'auto';
            sendBtn.removeAttribute('disabled');
            chatInput.focus();
        });
    });

    // Generate background particles
    const bgElements = document.querySelector('.bg-elements');
    if (bgElements) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 5) + 's';
            bgElements.appendChild(particle);
        }
    }

    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Cap max height
        if (this.scrollHeight > 200) {
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }

        if (this.value.trim() !== '') {
            sendBtn.removeAttribute('disabled');
        } else {
            sendBtn.setAttribute('disabled', 'true');
        }
    });

    // Handle enter key to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        appendMessage('user', text);
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.setAttribute('disabled', 'true');

        // Scroll to bottom
        scrollToBottom();

        // Simulate bot typing
        showTypingIndicator();
        
        try {
            const response = await generateBotResponse(text);
            removeTypingIndicator();
            appendMessage('bot', response);
            scrollToBottom();
        } catch (error) {
            removeTypingIndicator();
            appendMessage('bot', `**Connection Error:**\n${error.message}`);
            scrollToBottom();
        }
    }

    function appendMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        let avatarHTML = '';
        if (sender === 'user') {
            avatarHTML = `<div class="message-avatar"><i class="fa-solid fa-user-shield"></i></div>`;
        } else {
            avatarHTML = `<div class="message-avatar"><i class="fa-solid fa-robot"></i></div>`;
        }

        let contentHTML = '';
        if (sender === 'bot') {
            if (typeof marked !== 'undefined') {
                contentHTML = marked.parse(content);
            } else {
                contentHTML = `<p>${escapeHTML(content).replace(/\n/g, '<br>')}</p>`;
            }
        } else {
            contentHTML = `<p>${escapeHTML(content).replace(/\n/g, '<br>')}</p>`;
        }

        messageDiv.innerHTML = `
            ${avatarHTML}
            <div class="message-content">
                ${contentHTML}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(15px)';
        messageDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        // Trigger reflow
        void messageDiv.offsetWidth;
        
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }

    function showTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message bot-message typing-container`;
        messageDiv.id = 'typing-indicator';
        
        messageDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Advanced bot logic using Gemini API
    async function generateBotResponse(text) {
        let apiKey = localStorage.getItem('gemini_api_key') || "AIzaSyB2XfK993BQSXgUQcZHwjYFEP7AmMARBoQ";
        if (!apiKey) {
            return "⚠️ System Error: Gemini API Key not configured.\n\nPlease click the Settings gear icon ⚙️ in the top right corner to add your API Key so I can connect to the server.";
        }

        const modeSelect = document.getElementById('mode-select');
        let mode = modeSelect ? modeSelect.value : 'advanced';
        let systemPrompt = "You are a professional CyberSecurity AI Assistant. Provide highly accurate, concise, and technical answers.";
        
        if (mode === 'beginner') {
            systemPrompt = "You are a CyberSecurity AI Assistant. Explain security concepts simply and clearly for beginners, using analogies where helpful.";
        } else if (mode === 'exam') {
            systemPrompt = "You are a CyberSecurity Exam Prep Assistant. Act as an examiner for CompTIA Security+ or CISSP. Provide detailed, exam-focused explanations.";
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [{ text: text }]
            }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'API Request Failed');
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Unexpected API response format");
        }
    }

    // Handle Settings Button to add API Key
    const settingsBtn = document.querySelector('button[title="Settings"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const currentKey = localStorage.getItem('gemini_api_key') || '';
            const newKey = prompt('Configure Gemini API Key:\nGet one at https://aistudio.google.com/', currentKey);
            if (newKey !== null) {
                localStorage.setItem('gemini_api_key', newKey.trim());
                alert('API Key updated successfully!');
            }
        });
    }
});
