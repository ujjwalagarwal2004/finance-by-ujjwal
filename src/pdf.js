'use strict';

const puppeteer = require('puppeteer');

// Renders a standalone chat HTML document to a PDF buffer.
//  - mode 'a4'        : paginated A4 pages (best for printing).
//  - mode 'continuous': a single tall page sized to the content (screenshot-like).
async function htmlToPdf(html, { mode = 'a4' } = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 120000 });
    // Wait for fonts and Twemoji <img> swaps to settle.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => {
        img.addEventListener('load', r);
        img.addEventListener('error', r);
      }))));
    });

    if (mode === 'continuous') {
      const height = await page.evaluate(() => Math.ceil(document.querySelector('.wa-phone').scrollHeight) + 4);
      return await page.pdf({
        printBackground: true,
        width: '480px',
        height: `${height}px`,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    }

    return await page.pdf({
      printBackground: true,
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    await browser.close();
  }
}

module.exports = { htmlToPdf };
