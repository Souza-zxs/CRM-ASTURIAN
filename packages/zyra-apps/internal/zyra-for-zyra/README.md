This is a [Zyra](https://zyra.com) application bootstrapped with [`create-zyra-app`](https://www.npmjs.com/package/create-zyra-app).

## Overview

**Zyra for Zyra** is the official internal Zyra app. It is organized into modules, each integrating a third-party service with Zyra.

### Resend module (`src/modules/resend/`)

Two-way sync between Zyra and the [Resend](https://resend.com) email platform. The module syncs contacts, segments, templates, broadcasts, and emails.

**Inbound (Resend -> Zyra):**

- A cron job runs every 5 minutes to pull all entities from the Resend API
- A webhook endpoint receives real-time events for contacts and emails

**Outbound (Zyra -> Resend):**

- Database event triggers push contact and segment changes back to Resend when records are created, updated, or deleted in Zyra

## Getting Started

### 1. Install and run the app

```bash
yarn zyra dev
```

This registers the app with your local Zyra instance at `http://localhost:3000/settings/applications`.

### 2. Configure app variables

In Zyra, go to **Settings > Applications > Zyra for Zyra** and set:

- **RESEND_API_KEY** -- Your Resend API key. Create one at https://resend.com/api-keys (full access recommended).
- **RESEND_WEBHOOK_SECRET** -- The signing secret for verifying inbound webhooks (see "Webhook setup" below).

### 3. Webhook setup

The app exposes an HTTP endpoint at `/s/webhook/resend` that receives Resend webhook events. To connect it:

1. Go to https://resend.com/webhooks
2. Click **Add webhook**
3. Set the **Endpoint URL** to your Zyra server's public URL + `/s/webhook/resend` (e.g. `https://your-domain.com/s/webhook/resend`)
4. Set **Events types** to **All Events**
5. Click **Add**
6. Copy the **signing secret** Resend displays and paste it into the `RESEND_WEBHOOK_SECRET` app variable in Zyra

The webhook handles:

- **Contact events** (`contact.created`, `contact.updated`, `contact.deleted`) -- upserts/deletes Resend contact records in Zyra
- **Email events** (`email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`, etc.) -- updates delivery status on Resend email records in real-time
- **Domain events** -- logged and skipped (no domain object in the app yet)

### 4. Testing webhooks locally

Install the [Resend CLI](https://resend.com/docs/resend-cli):

```bash
brew install resend/cli/resend
```

Or via npm if Homebrew has issues:

```bash
npm install -g resend-cli
```

Authenticate:

```bash
resend login
```

Start the webhook listener with forwarding to your local Zyra server:

```bash
resend webhooks listen --forward-to http://localhost:3000/s/webhook/resend
```

The CLI will:

1. Create a public tunnel automatically
2. Register a temporary webhook in Resend pointing to that tunnel
3. Forward incoming events (with Svix signature headers) to your local Zyra server
4. Display events in the terminal as they arrive
5. Clean up the temporary webhook when you press Ctrl+C

To trigger test events, create or update a contact in the [Resend dashboard](https://resend.com/contacts), or send a test email.

## Sync behavior

### Inbound sync

| Source | Mechanism | Entities |
|---|---|---|
| Cron (every 5 min) | Polls Resend API, upserts into Zyra | Contacts, segments, templates, broadcasts, emails |
| Webhook (real-time) | Receives Resend events via HTTP | Contacts, emails |

### Outbound sync

| Zyra action | Resend API call |
|---|---|
| Create contact | `contacts.create()` -- writes `resendId` back to Zyra |
| Update contact (name, email, unsubscribed) | `contacts.update()` |
| Delete contact | `contacts.remove()` |
| Create segment | `segments.create()` -- writes `resendId` back to Zyra |
| Delete segment | `segments.remove()` |

### Loop prevention

A `lastSyncedFromResend` field on contact, segment, and email records tracks when data came from Resend. Outbound triggers skip processing when this field is part of the update, preventing infinite echo loops between inbound and outbound sync.

## Commands

Run `yarn zyra help` to list all available commands.

## Learn More

- [Zyra Apps documentation](https://docs.zyra.com/developers/extend/apps/getting-started)
- [zyra-sdk CLI reference](https://www.npmjs.com/package/zyra-sdk)
- [Resend API documentation](https://resend.com/docs)
