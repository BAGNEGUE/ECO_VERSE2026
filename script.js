document.addEventListener('DOMContentLoaded', () => {
    // Puure Chatbot Toggle Logic
    const toggleChatBtn = document.getElementById('toggleChat');
    const closeChatBtn = document.getElementById('closeChat');
    const puureChat = document.getElementById('puureChat');
    const notificationDot = document.querySelector('.notification-dot');

    function openChat() {
        puureChat.classList.add('open');
        if(notificationDot) notificationDot.style.display = 'none';
    }

    function closeChat() {
        puureChat.classList.remove('open');
    }

    toggleChatBtn.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', closeChat);

    // Initial message appearance animation is handled by CSS, 
    // but we can add interactive functionality for sending messages in the mockup.
    const chatInput = document.querySelector('.chat-input');
    const btnSend = document.querySelector('.btn-send');
    const chatBody = document.querySelector('.chat-body');

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text !== '') {
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'message';
            userMsg.style.alignSelf = 'flex-end';
            userMsg.style.marginTop = '10px';
            
            const msgContent = document.createElement('div');
            msgContent.className = 'msg-content';
            msgContent.style.background = 'rgba(255, 255, 255, 0.1)';
            msgContent.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            msgContent.style.borderBottomLeftRadius = '18px';
            msgContent.style.borderBottomRightRadius = '4px';
            msgContent.textContent = text;
            
            userMsg.appendChild(msgContent);
            chatBody.appendChild(userMsg);
            
            chatInput.value = '';
            
            // Scroll to bottom
            chatBody.scrollTop = chatBody.scrollHeight;
            
            // Simulate bot typing
            setTimeout(() => {
                const botTyping = document.createElement('div');
                botTyping.className = 'message bot-message';
                botTyping.style.marginTop = '10px';
                
                const typingContent = document.createElement('div');
                typingContent.className = 'msg-content';
                typingContent.innerHTML = '<i>Puure est en train de réfléchir...</i> <i class="ri-loader-4-line ri-spin"></i>';
                
                botTyping.appendChild(typingContent);
                chatBody.appendChild(botTyping);
                chatBody.scrollTop = chatBody.scrollHeight;
                
                // Simulate reply
                setTimeout(() => {
                    chatBody.removeChild(botTyping);
                    
                    const botReply = document.createElement('div');
                    botReply.className = 'message bot-message';
                    
                    const replyContent = document.createElement('div');
                    replyContent.className = 'msg-content';
                    replyContent.textContent = "C'est noté ! Je traite votre demande avec une approche écologique. 🌿";
                    
                    botReply.appendChild(replyContent);
                    chatBody.appendChild(botReply);
                    
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 1500);
                
            }, 500);
        }
    }

    btnSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
