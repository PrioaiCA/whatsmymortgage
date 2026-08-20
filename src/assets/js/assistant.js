// Sitewide "talk to our mortgage assistant" widget, bottom-right on every
// page. Ships fully wired to /api/assistant, which — until ASSISTANT_WEBHOOK_URL
// is set server-side — answers with a small built-in keyword router instead
// of a real model (see functions/api/assistant.js). Nothing here changes
// once a real backend is connected; only the replies get smarter.
//
// Voice mode uses the browser's own SpeechRecognition/SpeechSynthesis APIs
// (Chrome/Edge; unsupported browsers fall back to text-only) — no external
// voice service required to try it.
import { track } from './lib/analytics.js';
import { iconSvg } from './lib/icons.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognitionCtor;
const ttsSupported = 'speechSynthesis' in window;

export function initAssistant() {
  const widget = document.getElementById('assistant-widget');
  const toggle = document.getElementById('assistant-toggle');
  const closeBtn = document.getElementById('assistant-close');
  const panel = document.getElementById('assistant-panel');
  const body = document.getElementById('assistant-body');
  if (!widget || !toggle || !panel || !body) return;

  let mode = null; // 'text' | 'voice'
  let history = [];
  let recognizer = null;
  let listening = false;

  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (!mode) renderModePicker();
    track('assistant_open', { path: location.pathname });
  }

  function close() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (listening && recognizer) recognizer.stop();
  }

  toggle.addEventListener('click', () => (panel.hidden ? open() : close()));
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.addEventListener('click', (e) => { if (!panel.hidden && !widget.contains(e.target)) close(); });

  function renderModePicker() {
    body.innerHTML = `
      <p class="assistant-intro">Tell me what's going on with your mortgage and I'll point you to the right place. Not financial advice — just a faster way to find the right calculator.</p>
      <div class="assistant-mode-choice">
        <button type="button" class="btn btn-secondary assistant-mode-btn" data-mode="text">${iconSvg('keyboard', 20)}<span>Text chat</span></button>
        <button type="button" class="btn btn-secondary assistant-mode-btn" data-mode="voice" ${speechSupported ? '' : 'disabled title="Voice isn\'t supported in this browser — try text instead."'}>${iconSvg('mic', 20)}<span>Voice chat</span></button>
      </div>`;
    body.querySelectorAll('.assistant-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        track('assistant_mode_selected', { mode, path: location.pathname });
        renderChat();
      });
    });
  }

  function renderChat() {
    body.innerHTML = `
      <div class="assistant-thread" id="assistant-thread"></div>
      <form id="assistant-form" class="assistant-form">
        ${mode === 'voice' ? `<button type="button" id="assistant-mic" class="assistant-mic-btn" aria-label="Hold to talk">${iconSvg('mic', 20)}</button>` : ''}
        <input type="text" id="assistant-input" class="input" placeholder="${mode === 'voice' ? 'Or type instead…' : "What's going on?"}" autocomplete="off"/>
        <button type="submit" class="assistant-icon-btn assistant-send" aria-label="Send">${iconSvg('send', 18)}</button>
      </form>
      <button type="button" id="assistant-switch-mode" class="assistant-switch">Switch to ${mode === 'voice' ? 'text' : 'voice'}</button>`;

    addMessage('assistant', "Hi — what's going on with your mortgage?");

    const form = document.getElementById('assistant-form');
    const input = document.getElementById('assistant-input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      sendMessage(text);
    });

    document.getElementById('assistant-switch-mode').addEventListener('click', () => {
      mode = mode === 'voice' ? 'text' : 'voice';
      renderChat();
    });

    if (mode === 'voice') {
      const micBtn = document.getElementById('assistant-mic');
      if (speechSupported) {
        micBtn.addEventListener('click', () => toggleListening(micBtn, input));
      } else {
        micBtn.disabled = true;
      }
    }
  }

  function addMessage(role, text, suggestion) {
    const thread = document.getElementById('assistant-thread');
    if (!thread) return;
    const bubble = document.createElement('div');
    bubble.className = `assistant-msg assistant-msg-${role}`;
    bubble.innerHTML = esc(text);
    thread.appendChild(bubble);
    if (suggestion) {
      const link = document.createElement('a');
      link.className = 'btn btn-primary assistant-suggestion';
      link.href = suggestion.href;
      link.textContent = `Go to ${suggestion.label} →`;
      thread.appendChild(link);
    }
    thread.scrollTop = thread.scrollHeight;
    history.push({ role, text });
    if (role === 'assistant' && mode === 'voice' && ttsSupported) speak(text);
  }

  async function sendMessage(text) {
    addMessage('user', text);
    track('assistant_message_sent', { mode, path: location.pathname });
    const thinking = document.createElement('div');
    thinking.className = 'assistant-msg assistant-msg-assistant assistant-thinking';
    thinking.textContent = '…';
    const thread = document.getElementById('assistant-thread');
    thread.appendChild(thinking);
    thread.scrollTop = thread.scrollHeight;

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, mode, history: history.slice(-10), pageUrl: location.href })
      });
      const data = await res.json();
      thinking.remove();
      if (data.ok) addMessage('assistant', data.reply, data.suggestion);
      else addMessage('assistant', "That didn't go through — mind trying again?");
    } catch (e) {
      thinking.remove();
      addMessage('assistant', "I couldn't reach the server just now — mind trying again in a moment?");
    }
  }

  function toggleListening(micBtn, input) {
    if (listening) {
      recognizer.stop();
      return;
    }
    recognizer = new SpeechRecognitionCtor();
    recognizer.lang = 'en-CA';
    recognizer.interimResults = true;
    recognizer.onstart = () => { listening = true; micBtn.classList.add('is-listening'); };
    recognizer.onend = () => { listening = false; micBtn.classList.remove('is-listening'); };
    recognizer.onerror = () => { listening = false; micBtn.classList.remove('is-listening'); };
    recognizer.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      input.value = transcript;
      const last = e.results[e.results.length - 1];
      if (last.isFinal && transcript.trim()) {
        input.value = '';
        sendMessage(transcript.trim());
      }
    };
    recognizer.start();
  }

  function speak(text) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
    } catch (e) { /* speech synthesis best-effort only */ }
  }
}

initAssistant();
