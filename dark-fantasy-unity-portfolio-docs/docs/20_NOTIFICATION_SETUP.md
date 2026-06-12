# Notification Setup

This project saves every visitor message to `data/chat-messages.json`.
Optional notifications can also be sent by Messenger webhook, email, or a Zalo/webhook bridge.

## Messenger / Facebook

The public contact card opens this inbox:

```env
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/MahiruShiina.tym.1207
NEXT_PUBLIC_MESSENGER_URL=https://m.me/MahiruShiina.tym.1207
```

Facebook personal profile links can open Messenger, but they cannot receive automatic server push messages by URL alone.
For realtime notifications from the portfolio backend, use a webhook bridge:

```env
MESSENGER_WEBHOOK_URL=https://your-webhook-url
```

The webhook can be an n8n/Make workflow, your own small bridge, or a Facebook Page Messenger Platform integration.
Leave SMTP blank if Messenger/webhook is your only notification channel.

## Email via SMTP

SMTP is the standard way an app logs in to an email provider and sends email.
Use it when you want new contact messages to arrive in your inbox.

Required `.env.local` values:

```env
NOTIFY_EMAIL_TO=your-email@example.com
NOTIFY_EMAIL_FROM=your-email@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
```

For Gmail, `SMTP_PASS` should be an app password, not your normal login password.

## Zalo via Webhook

Zalo personal accounts do not provide a simple API for sending direct messages by phone number.
Use a webhook bridge instead:

- n8n webhook
- Make webhook
- your own small server
- Zalo Official Account integration behind a webhook

Required `.env.local` value:

```env
ZALO_WEBHOOK_URL=https://your-webhook-url
```

The portfolio server will send a JSON payload to that URL whenever a visitor leaves a message.

## Recommended Local Setup

For the quickest no-code realtime route, fill `MESSENGER_WEBHOOK_URL` with an n8n/Make webhook and have that workflow notify you.
If you still want email as a backup, fill SMTP:

```env
NOTIFY_EMAIL_TO=sang62375@gmail.com
NOTIFY_EMAIL_FROM=sang62375@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sang62375@gmail.com
SMTP_PASS=your-gmail-app-password
```

Then restart the local server.
