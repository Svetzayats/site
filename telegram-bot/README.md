# quotes-telegram-bot

A Cloudflare Worker that accepts Telegram messages and saves them as quotes via the site's `/api/quotes` endpoint.

## Deploying changes

```bash
cd telegram-bot
npx wrangler deploy
```

## First-time setup

Install wrangler globally or via npx, then set the required secrets:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN   # from BotFather
npx wrangler secret put QUOTES_API_TOKEN     # same token used by POST /api/quotes
npx wrangler secret put ALLOWED_CHAT_ID      # your personal Telegram chat ID
npx wrangler secret put SITE_URL             # e.g. https://your-site.pages.dev
```

Secrets are stored in Cloudflare and persist across deploys.

## Message format

Send a message to the bot in this format (author and tags are optional):

```
Quote text goes here
-- Author Name
#tag1 #tag2
```
