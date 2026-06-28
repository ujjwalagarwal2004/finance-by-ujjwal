'use strict';

const $ = (id) => document.getElementById(id);
let chats = [];
let activeId = null;

// ---------- connection state via SSE ----------
function applyState(s) {
  const connect = $('connect');
  const app = $('app');
  const account = $('account');

  if (s.state === 'ready') {
    connect.classList.add('hidden');
    app.classList.remove('hidden');
    account.classList.remove('hidden');
    $('account-name').textContent = s.me ? `${s.me.name || ''} (+${s.me.number})` : 'Connected';
    if (!chats.length) loadChats();
    return;
  }

  connect.classList.remove('hidden');
  app.classList.add('hidden');
  account.classList.add('hidden');

  const title = $('connect-title');
  const status = $('connect-status');
  const qrWrap = $('qr-wrap');
  const spinner = $('spinner');
  const qr = $('qr');

  qrWrap.classList.add('hidden');
  spinner.classList.remove('hidden');

  switch (s.state) {
    case 'qr':
      title.textContent = 'Scan to connect';
      status.textContent = 'Scan this QR code with WhatsApp on your phone.';
      qr.src = s.qr || '';
      qrWrap.classList.remove('hidden');
      spinner.classList.add('hidden');
      break;
    case 'loading':
    case 'authenticated':
      title.textContent = 'Loading your chats…';
      status.textContent = 'Syncing with WhatsApp. This can take a moment.';
      break;
    case 'auth_failure':
      title.textContent = 'Authentication failed';
      status.textContent = s.error || 'Please try linking again.';
      spinner.classList.add('hidden');
      break;
    case 'disconnected':
      title.textContent = 'Disconnected';
      status.textContent = 'The session was disconnected. Reload to reconnect.';
      spinner.classList.add('hidden');
      break;
    case 'error':
      title.textContent = 'Something went wrong';
      status.textContent = s.error || 'Failed to start WhatsApp.';
      spinner.classList.add('hidden');
      break;
    default:
      title.textContent = 'Connecting…';
      status.textContent = 'Starting WhatsApp session…';
  }
}

function listenEvents() {
  const es = new EventSource('/api/events');
  es.onmessage = (e) => {
    try { applyState(JSON.parse(e.data)); } catch (err) { /* ignore */ }
  };
  es.onerror = () => { /* browser auto-reconnects */ };
}

// ---------- chats ----------
async function loadChats() {
  try {
    const res = await fetch('/api/chats');
    if (!res.ok) return;
    chats = await res.json();
    renderChatList(chats);
  } catch (e) { toast('Could not load chats', true); }
}

function initials(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function renderChatList(items) {
  const ul = $('chat-list');
  ul.innerHTML = '';
  items.forEach((c) => {
    const li = document.createElement('li');
    li.className = 'chat-item' + (c.id === activeId ? ' active' : '');
    li.dataset.id = c.id;
    li.innerHTML =
      `<div class="chat-avatar">${c.isGroup ? '👥' : initials(c.name)}</div>`
      + `<div class="chat-main"><div class="chat-name">${escapeHtml(c.name)}</div>`
      + `<div class="chat-last">${escapeHtml(c.lastMessage || '')}</div></div>`
      + (c.unread ? `<span class="chat-badge">${c.unread}</span>` : '');
    li.addEventListener('click', () => selectChat(c));
    ul.appendChild(li);
  });
}

function selectChat(c) {
  activeId = c.id;
  document.querySelectorAll('.chat-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === c.id);
  });
  $('empty').classList.add('hidden');
  $('viewer').classList.remove('hidden');
  $('viewer-name').textContent = c.name;
  refreshPreview();
}

function currentQuery() {
  const params = new URLSearchParams({
    limit: $('limit').value,
    media: $('media').checked ? '1' : '0',
    mode: $('mode').value,
  });
  return params.toString();
}

function refreshPreview() {
  if (!activeId) return;
  const loading = $('preview-loading');
  loading.classList.remove('hidden');
  const iframe = $('preview');
  iframe.src = `/api/chats/${encodeURIComponent(activeId)}/preview?${currentQuery()}`;
  iframe.onload = () => loading.classList.add('hidden');
}

function exportPdf() {
  if (!activeId) return;
  toast('Generating PDF… this may take a moment.');
  const url = `/api/chats/${encodeURIComponent(activeId)}/export?${currentQuery()}`;
  window.location.href = url;
}

// ---------- helpers ----------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

let toastTimer;
function toast(msg, isError) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 4000);
}

// ---------- wire up ----------
$('refresh').addEventListener('click', refreshPreview);
$('export').addEventListener('click', exportPdf);
$('logout').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  chats = []; activeId = null;
});
$('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderChatList(chats.filter((c) => (c.name || '').toLowerCase().includes(q)));
});

listenEvents();
