'use strict';

// CSS for the rendered chat. Shared verbatim by the live preview iframe and
// the Puppeteer PDF pass so what you preview is exactly what you print.
// Colours/metrics are tuned to match WhatsApp's mobile (light theme) UI.

module.exports = `
:root {
  --wa-bg: #efeae2;
  --wa-header: #008069;
  --wa-in: #ffffff;
  --wa-out: #d9fdd3;
  --wa-quote-in: #f5f6f6;
  --wa-quote-out: #cbf0c2;
  --wa-tick: #8696a0;
  --wa-tick-read: #53bdeb;
  --wa-time: rgba(17,27,33,0.45);
  --wa-pill: #ffffff;
  --wa-text: #111b21;
}

* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

html, body {
  margin: 0;
  padding: 0;
  background: #d2dbd4;
  font-family: "Segoe UI", "Helvetica Neue", Helvetica, system-ui, -apple-system, Roboto, Arial, sans-serif;
  color: var(--wa-text);
  font-size: 14.2px;
  line-height: 1.32;
}

.wa-phone {
  max-width: 480px;
  margin: 0 auto;
  background: var(--wa-bg);
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%23000000' fill-opacity='0.025'%3E%3Ccircle cx='15' cy='15' r='3'/%3E%3Ccircle cx='75' cy='45' r='2'/%3E%3Ccircle cx='45' cy='90' r='2.5'/%3E%3Cpath d='M95 95l6 0 0 6 -6 0z'/%3E%3Cpath d='M20 60l5 5 -5 5 -5 -5z'/%3E%3C/g%3E%3C/svg%3E");
}

/* ---- Header ---- */
.wa-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  background: var(--wa-header);
  color: #fff;
}
.wa-header .wa-back { font-size: 22px; line-height: 1; opacity: 0.95; }
.wa-header .wa-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #ccd0d5; overflow: hidden; flex: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #fff;
}
.wa-header .wa-avatar img { width: 100%; height: 100%; object-fit: cover; }
.wa-header .wa-meta { flex: 1; min-width: 0; }
.wa-header .wa-name { font-weight: 600; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wa-header .wa-sub { font-size: 12.5px; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wa-header .wa-icons { display: flex; gap: 18px; font-size: 18px; opacity: 0.95; }

/* ---- Message area ---- */
.wa-body { padding: 8px 7% 18px; }

.wa-divider { display: flex; justify-content: center; margin: 14px 0 10px; }
.wa-divider span {
  background: #ffffff;
  color: #54656f;
  font-size: 12.2px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
  text-transform: none;
}

.wa-system { display: flex; justify-content: center; margin: 8px 0; }
.wa-system span {
  background: #fcf4cb;
  color: #54656f;
  font-size: 12.2px;
  padding: 6px 12px;
  border-radius: 8px;
  text-align: center;
  max-width: 85%;
  box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
}

.wa-row { display: flex; margin-top: 2px; break-inside: avoid; }
.wa-row.grouped { margin-top: 8px; }
.wa-row.out { justify-content: flex-end; }
.wa-row.in { justify-content: flex-start; }

.wa-bubble {
  position: relative;
  max-width: 80%;
  padding: 6px 7px 8px 9px;
  border-radius: 7.5px;
  box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.wa-row.in .wa-bubble { background: var(--wa-in); border-top-left-radius: 0; }
.wa-row.out .wa-bubble { background: var(--wa-out); border-top-right-radius: 0; }
.wa-row.grouped.in .wa-bubble { border-top-left-radius: 7.5px; }
.wa-row.grouped.out .wa-bubble { border-top-right-radius: 7.5px; }

/* Bubble tail */
.wa-row:not(.grouped) .wa-bubble::before {
  content: "";
  position: absolute;
  top: 0;
  width: 8px;
  height: 13px;
  background-repeat: no-repeat;
}
.wa-row.in:not(.grouped) .wa-bubble::before {
  left: -8px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='13'%3E%3Cpath fill='%23ffffff' d='M8 0H0c2 4 6 8 8 13z'/%3E%3C/svg%3E");
}
.wa-row.out:not(.grouped) .wa-bubble::before {
  right: -8px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='13'%3E%3Cpath fill='%23d9fdd3' d='M0 0h8c-2 4-6 8-8 13z'/%3E%3C/svg%3E");
}

.wa-sender { font-size: 13px; font-weight: 600; margin-bottom: 2px; }

.wa-text { font-size: 14.2px; white-space: normal; }
.wa-text.jumbo { font-size: 40px; line-height: 1.1; }
.wa-text a { color: #027eb5; text-decoration: none; }
.wa-text a:hover { text-decoration: underline; }
.wa-code-block, .wa-code-inline {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
}
.wa-code-block { display: block; white-space: pre-wrap; }

.wa-text del { text-decoration: line-through; }

/* Inline emoji rendered by Twemoji */
img.emoji { height: 1.1em; width: 1.1em; margin: 0 0.04em 0 0.04em; vertical-align: -0.18em; }
.wa-text.jumbo img.emoji { height: 0.95em; width: 0.95em; }

/* Reply / quoted block */
.wa-quote {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 4px;
  background: var(--wa-quote-in);
  cursor: default;
}
.wa-row.out .wa-quote { background: var(--wa-quote-out); }
.wa-quote .bar { width: 4px; flex: none; background: #06cf9c; }
.wa-quote .qbody { padding: 5px 8px; min-width: 0; flex: 1; }
.wa-quote .qname { font-size: 12.8px; font-weight: 600; margin-bottom: 1px; }
.wa-quote .qtext { font-size: 12.8px; color: #667781; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wa-quote .qthumb { width: 38px; height: 38px; flex: none; object-fit: cover; }

/* Media */
.wa-media { margin: -2px -3px 3px -5px; border-radius: 6px; overflow: hidden; }
.wa-media img { display: block; max-width: 100%; border-radius: 6px; }
.wa-sticker { background: transparent !important; box-shadow: none !important; padding: 2px; }
.wa-sticker .wa-media img { width: 130px; height: 130px; object-fit: contain; }
.wa-caption { margin-top: 2px; }

.wa-attach {
  display: flex; align-items: center; gap: 10px;
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
  padding: 9px 11px;
  min-width: 200px;
}
.wa-attach .ico { font-size: 22px; flex: none; }
.wa-attach .lab { font-size: 13.5px; }
.wa-attach .sub { font-size: 11.8px; color: #667781; }

/* Reactions */
.wa-reactions { margin-top: 3px; }
.wa-reactions .pill {
  display: inline-flex; align-items: center; gap: 2px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  padding: 1px 7px 1px 5px;
  font-size: 12.5px;
  box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
}

/* Meta row (time + ticks) */
.wa-meta-line { float: right; margin: 4px 0 -2px 8px; height: 15px; display: inline-flex; align-items: center; gap: 3px; }
.wa-time { font-size: 11px; color: var(--wa-time); white-space: nowrap; }
.wa-tick svg { width: 16px; height: 11px; display: block; }
.wa-clear { clear: both; }

@page { margin: 0; }
@media print { html, body { background: #fff; } }
`;
