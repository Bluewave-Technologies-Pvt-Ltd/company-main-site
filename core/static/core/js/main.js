/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ===== MOBILE MENU ===== */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileMenuBtn.classList.toggle('active');
});
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
    });
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* ===== FADE-IN ANIMATION ===== */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.service-card, .solution-item, .process-step, .about-point, .metric').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

/* ===== CSRF HELPER ===== */
function getCsrfToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith(name + '=')) return decodeURIComponent(c.slice(name.length + 1));
    }
    const meta = document.querySelector('[name=csrfmiddlewaretoken]');
    return meta ? meta.value : '';
}

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const successEl = document.getElementById('formSuccess');
        const errorEl = document.getElementById('formError');

        successEl.classList.remove('show');
        errorEl.classList.remove('show');

        const name = contactForm.querySelector('#name').value.trim();
        const email = contactForm.querySelector('#email').value.trim();
        const subject = contactForm.querySelector('#subject').value.trim();
        const message = contactForm.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            errorEl.textContent = 'Please fill in your name, email and message.';
            errorEl.classList.add('show');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch('/api/contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                btn.textContent = 'Message Sent!';
                successEl.classList.add('show');
                contactForm.reset();
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'Send Message';
                    successEl.classList.remove('show');
                }, 6000);
            } else {
                throw new Error(data.error || 'Server error');
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Send Message';
            errorEl.textContent = err.message || 'Something went wrong. Please try again.';
            errorEl.classList.add('show');
        }
    });
}

/* ===== CHATBOT ===== */
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatMessages = document.getElementById('chatMessages');
const openIcon = chatToggle.querySelector('.chat-icon-open');
const closeIcon = chatToggle.querySelector('.chat-icon-close');
const notification = chatToggle.querySelector('.chat-notification');

let chatHistory = [];
let isTyping = false;

function openChat() {
    chatPanel.classList.add('open');
    openIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    notification.classList.add('hidden');
    chatInput.focus();
}

function closeChat() {
    chatPanel.classList.remove('open');
    openIcon.style.display = 'block';
    closeIcon.style.display = 'none';
}

chatToggle.addEventListener('click', () => {
    chatPanel.classList.contains('open') ? closeChat() : openChat();
});
chatCloseBtn.addEventListener('click', closeChat);

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-message ${role === 'user' ? 'user-message' : 'bot-message'}`;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function appendTyping() {
    const div = document.createElement('div');
    div.className = 'chat-message bot-message';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function appendQuoteSuccess() {
    const div = document.createElement('div');
    div.className = 'chat-message bot-message';
    const inner = document.createElement('div');
    inner.className = 'chat-quote-success';
    inner.innerHTML = '<span class="qs-icon">&#10003;</span> Quote request submitted. Our team will reach out to you shortly.';
    div.appendChild(inner);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || isTyping) return;

    chatInput.value = '';
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    isTyping = true;
    chatSendBtn.disabled = true;
    appendTyping();

    try {
        const response = await fetch('/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({ message: text, history: chatHistory }),
        });

        removeTyping();

        if (!response.ok) throw new Error('Server error');

        const data = await response.json();
        const reply = data.reply || 'Sorry, I had trouble processing that. Please try again.';

        appendMessage('assistant', reply);
        chatHistory.push({ role: 'assistant', content: reply });

        if (data.quote_captured) {
            appendQuoteSuccess();
        }

    } catch (err) {
        removeTyping();
        appendMessage('assistant', 'Connection error. Please try again or use the contact form below.');
    }

    isTyping = false;
    chatSendBtn.disabled = false;
    chatInput.focus();
}

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

/* Pulse notification after 3s on first visit */
if (!sessionStorage.getItem('chatOpened')) {
    setTimeout(() => {
        if (!chatPanel.classList.contains('open')) {
            notification.classList.remove('hidden');
        }
    }, 3000);
}
