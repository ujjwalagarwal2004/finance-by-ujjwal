'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');

const { WhatsAppService } = require('./src/whatsapp');
const { renderChatHTML } = require('./src/render');
const { htmlToPdf } = require('./src/pdf');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const wa = new WhatsAppService();
wa.init();

function safeName(s) {
  return String(s).replace(/[^a-z0-9_\- ]/gi, '_').slice(0, 60).trim() || 'chat';
}

function requireReady(res) {
  if (wa.state !== 'ready') {
    res.status(409).json({ error: 'WhatsApp is not connected yet.', state: wa.state });
    return false;
  }
  return true;
}

// ---- connection state ----
app.get('/api/status', (req, res) => res.json(wa.status()));

// Server-sent events: push connection-state changes (QR, ready, etc.).
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (s) => res.write(`data: ${JSON.stringify(s)}\n\n`);
  send(wa.status());
  const onUpdate = (s) => send(s);
  wa.on('update', onUpdate);
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(ping);
    wa.off('update', onUpdate);
  });
});

app.post('/api/logout', async (req, res) => {
  await wa.logout();
  res.json({ ok: true });
});

// ---- chats ----
app.get('/api/chats', async (req, res) => {
  if (!requireReady(res)) return;
  try {
    res.json(await wa.getChats());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

function parseOpts(q) {
  return {
    limit: Math.min(Math.max(parseInt(q.limit, 10) || 1000, 1), 100000),
    includeMedia: q.media !== '0' && q.media !== 'false',
    mode: q.mode === 'continuous' ? 'continuous' : 'a4',
  };
}

// Live HTML preview (rendered into an iframe by the UI).
app.get('/api/chats/:id/preview', async (req, res) => {
  if (!requireReady(res)) return;
  const opts = parseOpts(req.query);
  try {
    const model = await wa.getChatModel(req.params.id, opts);
    res.type('html').send(renderChatHTML(model, { twemoji: true }));
  } catch (e) {
    res.status(500).type('html').send(`<pre>Failed to load chat: ${String(e.message || e)}</pre>`);
  }
});

// Generate and download the PDF.
app.get('/api/chats/:id/export', async (req, res) => {
  if (!requireReady(res)) return;
  const opts = parseOpts(req.query);
  try {
    const model = await wa.getChatModel(req.params.id, opts);
    const html = renderChatHTML(model, { twemoji: true });
    const pdf = await htmlToPdf(html, { mode: opts.mode });

    const filename = `${safeName(model.header.name)} - WhatsApp.pdf`;

    // Optionally persist a copy under ./exports for the user.
    try {
      const dir = path.join(__dirname, 'exports');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), pdf);
    } catch (e) { /* non-fatal */ }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log('\n  WhatsApp Chat → PDF exporter');
  console.log(`  Open  http://localhost:${PORT}  in your browser and scan the QR code.\n`);
});
