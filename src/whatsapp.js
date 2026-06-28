'use strict';

const EventEmitter = require('events');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Wraps whatsapp-web.js: drives the QR-linked WhatsApp Web session, exposes
// the current connection state, and builds render-ready chat models.
class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.state = 'starting';
    this.qrDataUrl = null;
    this.me = null;
    this.error = null;
    this.client = null;
    this._avatarCache = new Map();
  }

  init() {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      },
    });

    this.client.on('qr', async (qr) => {
      try {
        this.qrDataUrl = await qrcode.toDataURL(qr, { margin: 1, width: 320 });
      } catch (e) { /* ignore */ }
      this._set('qr');
    });
    this.client.on('loading_screen', () => this._set('loading'));
    this.client.on('authenticated', () => { this.qrDataUrl = null; this._set('authenticated'); });
    this.client.on('auth_failure', (m) => { this.error = String(m); this._set('auth_failure'); });
    this.client.on('ready', () => {
      this.me = this.client.info
        ? { name: this.client.info.pushname, number: this.client.info.wid.user }
        : null;
      this._set('ready');
    });
    this.client.on('disconnected', (r) => { this.error = String(r); this._set('disconnected'); });

    this.client.initialize().catch((e) => {
      this.error = String(e && e.message ? e.message : e);
      this._set('error');
    });
  }

  _set(state) {
    this.state = state;
    this.emit('update', this.status());
  }

  status() {
    return { state: this.state, qr: this.qrDataUrl, me: this.me, error: this.error };
  }

  async _avatar(contact) {
    if (!contact) return null;
    const key = contact.id ? contact.id._serialized : String(contact);
    if (this._avatarCache.has(key)) return this._avatarCache.get(key);
    let dataUrl = null;
    try {
      const url = await contact.getProfilePicUrl();
      if (url) dataUrl = await fetchAsDataUrl(url);
    } catch (e) { /* no picture / private */ }
    this._avatarCache.set(key, dataUrl);
    return dataUrl;
  }

  async getChats() {
    const chats = await this.client.getChats();
    return chats.map((c) => ({
      id: c.id._serialized,
      name: c.name || (c.formattedTitle) || c.id.user,
      isGroup: c.isGroup,
      unread: c.unreadCount || 0,
      timestamp: c.timestamp || 0,
      lastMessage: c.lastMessage ? (c.lastMessage.body || '[media]') : '',
    })).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Build the render model for a single chat.
  async getChatModel(chatId, { limit = 1000, includeMedia = true } = {}) {
    const chat = await this.client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });

    const contact = await chat.getContact().catch(() => null);
    const header = {
      name: chat.name || (contact && (contact.pushname || contact.name)) || chat.id.user,
      avatar: await this._avatar(contact),
      initial: (chat.name || chat.id.user || '?').charAt(0),
      sub: chat.isGroup
        ? `Group${chat.participants ? ` · ${chat.participants.length} participants` : ''}`
        : (contact ? `+${contact.number || chat.id.user}` : ''),
    };

    const out = [];
    for (const msg of messages) {
      out.push(await this._mapMessage(msg, chat.isGroup, includeMedia));
    }

    return { header, isGroup: chat.isGroup, messages: out };
  }

  async _mapMessage(msg, isGroup, includeMedia) {
    const SYSTEM = new Set([
      'e2e_notification', 'notification', 'notification_template', 'gp2',
      'group_notification', 'broadcast_notification', 'call_log', 'protocol',
      'security', 'ciphertext',
    ]);

    const base = {
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      ack: msg.ack,
      type: msg.type,
      body: msg.body || '',
    };

    if (SYSTEM.has(msg.type) || msg.isStatus) {
      return { ...base, system: true, systemLabel: msg.body || labelForSystem(msg.type) };
    }

    // sender name (groups)
    if (isGroup && !msg.fromMe) {
      const c = await msg.getContact().catch(() => null);
      base.author = msg.author || (c && c.id ? c.id._serialized : '');
      base.senderName = (c && (c.pushname || c.name || c.shortName)) || (msg.author ? `+${msg.author.split('@')[0]}` : 'Unknown');
    } else {
      base.senderName = 'You';
    }

    if (msg.type === 'revoked') return { ...base, body: '' };

    // media
    if ((msg.type === 'image' || msg.type === 'sticker') && msg.hasMedia && includeMedia) {
      try {
        const media = await msg.downloadMedia();
        if (media && media.data) base.media = `data:${media.mimetype};base64,${media.data}`;
      } catch (e) { /* media not available */ }
    }

    if (msg.type === 'document') base.filename = msg.filename || (msg._data && msg._data.filename) || '';
    if (msg.type === 'ptt' || msg.type === 'audio' || msg.type === 'video') {
      const dur = msg.duration || (msg._data && msg._data.duration);
      if (dur) base.durationLabel = secsToClock(dur);
    }
    if (msg.type === 'location' && msg.location) {
      base.locationLabel = msg.location.description || `${msg.location.latitude}, ${msg.location.longitude}`;
    }
    if (msg.type === 'vcard') {
      base.vcardName = (msg.vCards && msg.vCards.length) ? parseVcardName(msg.vCards[0]) : '';
    }

    // quoted / reply
    if (msg.hasQuotedMsg) {
      try {
        const q = await msg.getQuotedMessage();
        const qc = await q.getContact().catch(() => null);
        const quoted = {
          name: q.fromMe ? 'You' : ((qc && (qc.pushname || qc.name)) || (q.author ? `+${q.author.split('@')[0]}` : 'Unknown')),
          author: q.author || (qc && qc.id ? qc.id._serialized : ''),
          body: q.body || '',
          type: q.type,
        };
        if ((q.type === 'image' || q.type === 'sticker') && q.hasMedia && includeMedia) {
          try {
            const qm = await q.downloadMedia();
            if (qm && qm.data) quoted.media = `data:${qm.mimetype};base64,${qm.data}`;
          } catch (e) { /* ignore */ }
        }
        base.quoted = quoted;
      } catch (e) { /* quoted not retrievable */ }
    }

    // reactions (best effort)
    try {
      const reactions = await msg.getReactions();
      if (reactions && reactions.length) {
        base.reactions = reactions.map((r) => ({
          emoji: r.aggregateEmoji || r.id,
          count: r.senders ? r.senders.length : 1,
        }));
      }
    } catch (e) { /* not supported / none */ }

    return base;
  }

  async logout() {
    try { await this.client.logout(); } catch (e) { /* ignore */ }
    this.me = null;
    this.qrDataUrl = null;
    this._avatarCache.clear();
    this._set('starting');
  }
}

function labelForSystem(type) {
  if (type === 'e2e_notification') return 'Messages are end-to-end encrypted.';
  if (type === 'call_log') return 'Call';
  return '';
}

function secsToClock(s) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

function parseVcardName(vcard) {
  const m = /FN:(.+)/i.exec(vcard);
  return m ? m[1].trim() : 'Contact';
}

async function fetchAsDataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

module.exports = { WhatsAppService };
