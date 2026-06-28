# WhatsApp Chat → PDF Exporter

A **local-first** tool to log into WhatsApp by scanning a QR code and export any
chat as a PDF that looks **exactly like the chat interface on your phone** —
green/grey bubbles with tails, timestamps and read ticks, date separators,
coloured group sender names, reply quotes, inline images & stickers, emoji,
and `*bold* / _italic_ / ~strike~ / ```mono``` ` formatting. Voice notes,
videos, documents, locations and contacts are shown as labelled placeholders.

It's meant for people who want to **print or archive their chats as PDF**
instead of relying on WhatsApp's binary backups.

## How it works

1. Run the server locally — it opens a WhatsApp Web session (`whatsapp-web.js`).
2. You scan the QR code with **WhatsApp → Settings → Linked Devices**.
3. Pick a chat. A live preview shows it rendered as the phone interface.
4. Click **Export PDF**. The page is rendered to PDF with headless Chromium.

Your chats are read on your own machine and rendered there — **nothing is sent
to any external server.** The session is stored locally in `.wwebjs_auth/`.

## Setup

Requires **Node.js 18+** (uses the built-in `fetch`).

```bash
npm install      # also downloads a Chromium build for rendering (~150 MB)
npm start
```

Then open **http://localhost:3000** and scan the QR code.

Exported PDFs are downloaded by the browser and also saved to `./exports/`.

## Options (per chat)

| Option           | What it does                                                        |
|------------------|--------------------------------------------------------------------|
| **Messages**     | How many recent messages to include (200 → all available).         |
| **Include images** | Embed photos/stickers inline. Turn off for a smaller, faster PDF. |
| **Layout**       | `A4 pages` (best for printing) or `Single long page` (screenshot-like). |

> History is limited to what your linked device has synced. Increasing the
> message count past what's loaded will fetch more from WhatsApp, which can be
> slow for very large chats.

## Project layout

```
server.js              Express server + REST/SSE API
src/whatsapp.js        whatsapp-web.js wrapper: QR session, chat models, media
src/render.js          Builds the WhatsApp-look HTML for a chat
src/chat-styles.js     The CSS that mimics WhatsApp mobile (shared by preview & PDF)
src/format.js          WhatsApp text formatting → safe HTML (bold/italic/links/…)
src/pdf.js             Headless-Chromium HTML → PDF
public/                Web UI (QR screen, chat list, preview, export)
```

## A note on terms of service

WhatsApp does not offer an official API for reading personal chats. This tool
links to **WhatsApp Web** the same way the desktop app does. Automating
WhatsApp Web is outside WhatsApp's official Terms of Service, so use it with
your own account, on your own chats, at your own discretion.
