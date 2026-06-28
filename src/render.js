'use strict';

const { formatBody, isEmojiOnly, escapeHtml } = require('./format');
const CHAT_CSS = require('./chat-styles');

// Colours WhatsApp cycles through for sender names in group chats.
const NAME_COLORS = [
  '#e542a3', '#6bcbef', '#dfae3d', '#fa3b5c', '#0a7d8c',
  '#ff9c33', '#7f66ff', '#1f8a70', '#d4504e', '#3f86d3',
];

function colorFor(key) {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return NAME_COLORS[h % NAME_COLORS.length];
}

function fmtTime(ts) {
  const d = new Date(ts * 1000);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function fmtDateDivider(ts) {
  const d = new Date(ts * 1000);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, yest)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function dayKey(ts) {
  return new Date(ts * 1000).toDateString();
}

const CHECK_GREY = `<span class="wa-tick"><svg viewBox="0 0 16 11" fill="none"><path d="M11.07.65L5.4 7.6 2.6 4.9l-.95.93 3.75 3.65L12.1 1.5z" fill="#8696a0"/><path d="M15.0.65L9.34 7.6l-.6-.58 5.3-6.5z" fill="#8696a0"/></svg></span>`;
const CHECK_BLUE = `<span class="wa-tick"><svg viewBox="0 0 16 11" fill="none"><path d="M11.07.65L5.4 7.6 2.6 4.9l-.95.93 3.75 3.65L12.1 1.5z" fill="#53bdeb"/><path d="M15.0.65L9.34 7.6l-.6-.58 5.3-6.5z" fill="#53bdeb"/></svg></span>`;
const CHECK_ONE = `<span class="wa-tick"><svg viewBox="0 0 16 11" fill="none"><path d="M9.5.65L3.84 7.6 1.04 4.9l-.95.93 3.75 3.65L10.55 1.5z" fill="#8696a0"/></svg></span>`;
const CLOCK = `<span class="wa-tick"><svg viewBox="0 0 16 11"><g fill="none" stroke="#8696a0" stroke-width="1"><circle cx="8" cy="5.5" r="4.2"/><path d="M8 3.2v2.4l1.6 1" stroke-linecap="round"/></g></svg></span>`;

function ticksFor(ack) {
  switch (ack) {
    case 0: return CLOCK;
    case 1: return CHECK_ONE;
    case 2: return CHECK_GREY;
    case 3:
    case 4: return CHECK_BLUE;
    default: return '';
  }
}

const TYPE_LABEL = {
  image: ['🖼️', 'Photo'],
  video: ['🎥', 'Video'],
  ptt: ['🎤', 'Voice message'],
  audio: ['🎵', 'Audio'],
  document: ['📄', 'Document'],
  sticker: ['🩹', 'Sticker'],
  location: ['📍', 'Location'],
  vcard: ['👤', 'Contact'],
  multi_vcard: ['👤', 'Contacts'],
  poll_creation: ['📊', 'Poll'],
  revoked: ['🚫', 'This message was deleted'],
};

function quotePreview(q) {
  if (q.body) return escapeHtml(q.body.length > 90 ? `${q.body.slice(0, 90)}…` : q.body);
  const lbl = TYPE_LABEL[q.type];
  return lbl ? `${lbl[0]} ${lbl[1]}` : 'Message';
}

// ---- media / attachment block per message ----
function mediaBlock(m) {
  const isSticker = m.type === 'sticker';
  if ((m.type === 'image' || isSticker) && m.media) {
    return `<div class="wa-media"><img src="${m.media}" alt=""></div>`;
  }
  const lbl = TYPE_LABEL[m.type];
  if (!lbl) return '';
  let sub = '';
  if (m.type === 'document' && m.filename) sub = escapeHtml(m.filename);
  else if (m.durationLabel) sub = m.durationLabel;
  else if (m.type === 'location' && m.locationLabel) sub = escapeHtml(m.locationLabel);
  else if (m.type === 'vcard' && m.vcardName) sub = escapeHtml(m.vcardName);
  return `<div class="wa-attach"><span class="ico">${lbl[0]}</span><span><div class="lab">${lbl[1]}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</span></div>`;
}

function reactionsBlock(reactions) {
  if (!reactions || !reactions.length) return '';
  const pills = reactions.map((r) => {
    const count = r.count > 1 ? `<span class="cnt">${r.count}</span>` : '';
    return `<span class="pill">${escapeHtml(r.emoji)}${count}</span>`;
  }).join(' ');
  return `<div class="wa-reactions">${pills}</div>`;
}

function renderMessage(m, ctx) {
  if (m.system) {
    return `<div class="wa-system"><span>${formatBody(m.body) || escapeHtml(m.systemLabel || '')}</span></div>`;
  }

  const side = m.fromMe ? 'out' : 'in';
  const grouped = ctx.grouped ? ' grouped' : '';
  const isSticker = m.type === 'sticker' && m.media;

  // sender name: groups, incoming, first of a run only
  let senderHtml = '';
  if (ctx.showSender && !m.fromMe) {
    senderHtml = `<div class="wa-sender" style="color:${colorFor(m.author || m.senderName)}">${escapeHtml(m.senderName)}</div>`;
  }

  let quoteHtml = '';
  if (m.quoted) {
    const thumb = m.quoted.media ? `<img class="qthumb" src="${m.quoted.media}" alt="">` : '';
    quoteHtml = `<div class="wa-quote"><div class="bar" style="background:${colorFor(m.quoted.author || m.quoted.name || 'x')}"></div>`
      + `<div class="qbody"><div class="qname" style="color:${colorFor(m.quoted.author || m.quoted.name || 'x')}">${escapeHtml(m.quoted.name || 'You')}</div>`
      + `<div class="qtext">${quotePreview(m.quoted)}</div></div>${thumb}</div>`;
  }

  const media = mediaBlock(m);

  let textHtml = '';
  if (m.body && m.type !== 'revoked') {
    const jumbo = !media && isEmojiOnly(m.body) ? ' jumbo' : '';
    const cls = media ? 'wa-text wa-caption' : `wa-text${jumbo}`;
    textHtml = `<div class="${cls}">${formatBody(m.body)}</div>`;
  } else if (m.type === 'revoked') {
    textHtml = `<div class="wa-text" style="color:#667781;font-style:italic">🚫 This message was deleted</div>`;
  }

  const meta = `<span class="wa-meta-line"><span class="wa-time">${fmtTime(m.timestamp)}${m.edited ? ' · edited' : ''}</span>${m.fromMe ? ticksFor(m.ack) : ''}</span>`;

  const bubbleCls = `wa-bubble${isSticker ? ' wa-sticker' : ''}`;
  const inner = senderHtml + quoteHtml + media + textHtml + reactionsBlock(m.reactions) + meta + '<span class="wa-clear"></span>';

  return `<div class="wa-row ${side}${grouped}"><div class="${bubbleCls}">${inner}</div></div>`;
}

// Build the full standalone HTML document for a chat.
// `model` = { header:{name,sub,avatar,initial}, isGroup, messages:[...] }
function renderChatHTML(model, { twemoji = true } = {}) {
  const rows = [];
  let lastDay = null;
  let prevAuthor = null;
  let prevFromMe = null;
  let prevTs = 0;

  for (const m of model.messages) {
    if (m.system) {
      rows.push(renderMessage(m, {}));
      prevAuthor = null;
      prevFromMe = null;
      continue;
    }

    const dk = dayKey(m.timestamp);
    if (dk !== lastDay) {
      rows.push(`<div class="wa-divider"><span>${fmtDateDivider(m.timestamp)}</span></div>`);
      lastDay = dk;
      prevAuthor = null;
      prevFromMe = null;
    }

    const sameSender = prevFromMe === m.fromMe
      && (m.fromMe || prevAuthor === (m.author || m.senderName));
    const closeInTime = m.timestamp - prevTs < 60;
    const grouped = sameSender && closeInTime;

    const showSender = model.isGroup && !m.fromMe && !grouped;
    rows.push(renderMessage(m, { grouped, showSender }));

    prevAuthor = m.author || m.senderName;
    prevFromMe = m.fromMe;
    prevTs = m.timestamp;
  }

  const h = model.header;
  const avatarInner = h.avatar
    ? `<img src="${h.avatar}" alt="">`
    : escapeHtml((h.initial || '?').toUpperCase());

  const twemojiTag = twemoji
    ? `<script src="https://cdn.jsdelivr.net/npm/@twemoji/api@15.1.0/dist/twemoji.min.js" crossorigin="anonymous"></script>`
      + `<script>try{twemoji.parse(document.body,{folder:'svg',ext:'.svg',base:'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/'});}catch(e){}</script>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>${escapeHtml(h.name)} — WhatsApp</title><style>${CHAT_CSS}</style></head>`
    + `<body><div class="wa-phone">`
    + `<div class="wa-header"><span class="wa-back">‹</span>`
    + `<span class="wa-avatar">${avatarInner}</span>`
    + `<span class="wa-meta"><div class="wa-name">${escapeHtml(h.name)}</div>`
    + `${h.sub ? `<div class="wa-sub">${escapeHtml(h.sub)}</div>` : ''}</span>`
    + `<span class="wa-icons">📹 📞 ⋮</span></div>`
    + `<div class="wa-body">${rows.join('')}</div>`
    + `</div>${twemojiTag}</body></html>`;
}

module.exports = { renderChatHTML };
