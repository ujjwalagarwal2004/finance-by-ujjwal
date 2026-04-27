# Finance by Ujjwal — Setup Guide
### Complete step-by-step instructions (no tech knowledge needed)

---

## What you will set up in this guide

| Step | What | Time | Cost |
|---|---|---|---|
| 1 | GitHub account + upload the website code | 10 min | Free |
| 2 | Vercel — makes the site live on the internet | 5 min | Free |
| 3 | Telegram bot — sends you daily topic ideas | 5 min | Free |
| 4 | Daily 8am automation | 3 min | Free |

**Total: ~25 minutes, one time.**

---

## Step 1 — Create a GitHub Account (your website's home)

GitHub is where your website code lives. Think of it like Google Drive, but for code. Vercel reads from it and automatically makes your site live whenever you add a new article.

1. Go to **github.com**
2. Click **Sign up**
3. Enter your email, create a password, choose a username (e.g. `ujjwalagarwal`)
4. Verify your email
5. Choose the **Free plan**

---

## Step 2 — Install GitHub Desktop (the easy way to upload code)

Instead of using the command line for uploads, use the GitHub Desktop app — it's click-based.

1. Go to **desktop.github.com**
2. Click **Download for macOS**
3. Open the downloaded file, drag the app to your Applications folder
4. Open **GitHub Desktop**
5. Click **Sign in to GitHub.com** and log in with your new account

---

## Step 3 — Upload your website to GitHub

1. In GitHub Desktop, click **Add an Existing Repository from your Hard Drive**
2. Click **Choose...** and navigate to:
   `Downloads → finance-by-ujjwal`
3. It will say "This directory does not appear to be a Git repository" — click **create a repository**
4. Name it: `finance-by-ujjwal`
5. Leave everything else as default, click **Create Repository**
6. Click **Publish repository** (top right)
7. Make sure "Keep this code private" is **unchecked** (must be public for free Vercel)
8. Click **Publish Repository**

✅ Your code is now on GitHub at `github.com/YOUR-USERNAME/finance-by-ujjwal`

---

## Step 4 — Deploy to Vercel (make the site live)

Vercel is a free hosting service. Once connected, every time you push a new article, the website updates automatically within ~60 seconds.

1. Go to **vercel.com**
2. Click **Sign Up** → choose **Continue with GitHub**
3. Authorize Vercel to access your GitHub
4. Click **Add New Project**
5. Find `finance-by-ujjwal` in the list and click **Import**
6. Leave all settings as default
7. Click **Deploy**
8. Wait ~2 minutes — Vercel builds and deploys your site
9. You'll see a URL like `finance-by-ujjwal.vercel.app` — **that's your live website!**

Click the URL and you'll see your Finance by Ujjwal website live on the internet.

---

## Step 5 — Create your Telegram Bot (for daily topic ideas)

A Telegram bot is a special account that can send you automated messages. You create it in under 5 minutes.

1. Open Telegram on your phone or computer
2. Search for **@BotFather** (official Telegram bot creator — look for the blue verified checkmark)
3. Start a chat and send: `/newbot`
4. When asked for a name, type: `Finance by Ujjwal`
5. When asked for a username, type something like: `financebyujjwal_bot`
   (it must end in `_bot` and be unique)
6. BotFather will reply with a **token** — it looks like: `7283940281:AAFhG8j2...`
7. **Copy and save this token** — you'll need it in Step 7

### Get your Chat ID:
1. In Telegram, search for your new bot (e.g. `@financebyujjwal_bot`)
2. Click **Start** to begin a conversation with it
3. Now open this URL in your browser (replace YOUR-TOKEN with the actual token):
   `https://api.telegram.org/botYOUR-TOKEN/getUpdates`
4. Look for `"id":` inside the `"chat"` section — that number is your **Chat ID**
   (e.g. `"id": 1234567890`)
5. Save that number

---

## Step 6 — Add your Telegram secrets to GitHub

GitHub needs your Telegram token and chat ID to send the morning messages. You store them as "Secrets" — they're encrypted and never visible to anyone.

1. Go to your repo on GitHub: `github.com/YOUR-USERNAME/finance-by-ujjwal`
2. Click **Settings** (top tabs)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the first secret:
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: paste your token from BotFather
   - Click **Add secret**
6. Click **New repository secret** again
7. Add the second secret:
   - Name: `TELEGRAM_CHAT_ID`
   - Value: your chat ID number
   - Click **Add secret**

---

## Step 7 — Test the morning digest right now

Don't wait until 8am to check if it works. You can trigger it manually:

1. Go to your GitHub repo
2. Click the **Actions** tab (top navigation)
3. Click **Morning Finance Digest** in the left list
4. Click **Run workflow** (top right) → **Run workflow**
5. Wait ~30 seconds, then check your Telegram

You should receive a message with 5 finance topic ideas for today!

---

## Step 8 — Your daily workflow (after setup)

Every morning you'll get a Telegram message like this:

```
🌅 Good morning, Ujjwal!
📅 Monday, 27 April 2026

Here are today's top 5 finance story ideas:

1. RBI signals more rate cuts as inflation cools to 4.1%
   └ The central bank's monetary policy...
   🔗 https://...

2. US Fed holds rates steady amid tariff uncertainty...
...
```

**Your 5-step content routine:**

1. **Read the 5 ideas** in Telegram — pick the one that interests you most
2. **Open Claude Code** (you already have this) and say:
   > *"Write a full finance report on this topic: [paste the headline]. Include original analysis, citations, and a jargon glossary at the end. Make it simple enough for non-finance readers."*
3. **Review the report** Claude generates
4. When you're happy with it, run the publisher by typing in Terminal:
   ```
   cd ~/Downloads/finance-by-ujjwal
   python3 scripts/publish.py
   ```
5. Follow the prompts — paste the article, choose a category, and it publishes automatically

Your article will be live at `finance-by-ujjwal.vercel.app` within 60 seconds.

---

## Frequently Asked Questions

**Q: What if the 8am message doesn't arrive?**
A: Check GitHub → Actions tab. If the job failed, it'll show a red ✗. Click it to see the error and share it with me in Claude Code — I'll fix it.

**Q: Can I get a custom domain (like financebyujjwal.com)?**
A: Yes. Buy a domain at namecheap.com (~$10/year) and in Vercel → your project → Settings → Domains, add it there. Takes 5 minutes.

**Q: What if I want to edit an article after publishing?**
A: Open the `.md` file in the `content/` folder using any text editor (TextEdit works), make your changes, save, then in GitHub Desktop: write a commit message like "Fix typo in article" and click Commit + Push.

**Q: How do I delete an article?**
A: Delete the `.md` file in the `content/` folder, then commit and push via GitHub Desktop.

**Q: The website looks different on mobile — is that normal?**
A: Yes, the site is responsive (adapts to any screen size). This is by design.

---

## Need Help?

Open Claude Code and describe the issue. I have full context of how this project was built and can fix anything.
