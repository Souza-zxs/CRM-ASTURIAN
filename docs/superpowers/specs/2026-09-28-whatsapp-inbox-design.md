# WhatsApp Inbox — Design

## Context

The CRM already imports inbound WhatsApp messages into the generic messaging model
(`Message` / `MessageThread` / `MessageParticipant` / `MessageChannel`, shared with
email) via `WhatsappInboundMessageImportService`. Outbound sending is already wired
end-to-end at the driver level (`MessagingMessageOutboundService` dispatches to
`WhatsappMessageOutboundService` based on `connectedAccount.provider ===
ConnectedAccountProvider.WHATSAPP`). There is a separate, deliberately independent
`WhatsappAgentConversation` / `WhatsappAgentMessage` pair of tables that back the AI
responder (cheap read/write state, not meant to be the human-facing inbox).

What's missing: any UI where a human can actually see and reply to a WhatsApp
conversation. Today the only WhatsApp-related UI is Settings → Accounts →
`SettingsAccountsWhatsappAgentConversationsList` (a read-only table with an
AI on/off toggle per conversation) — there is no chat view.

A prior plan referencing WhatsApp templates + funnel pages (`mossy-roaming-cake.md`)
was never committed to the repo or git history; it does not exist to build on. The
committed `2026-09-23-demo-readiness-design.md` spec explicitly scoped WhatsApp
templates down to a skeleton (no Meta API calls) — unrelated to this inbox work.

## Goals

- A human can see WhatsApp conversations and reply to them from inside the CRM,
  in two places:
  1. A per-record widget on a Person's page (`WhatsappCard`), mirroring the existing
     `EmailsCard` pattern but rendered as a chat (bubbles), not a thread list —
     each WhatsApp contact maps to exactly one ongoing thread.
  2. A global Inbox page listing every WhatsApp conversation in the workspace with
     an open-conversation panel (WhatsApp Web style) — for replying without
     navigating to a specific record.
- Sending a manual reply automatically disables the AI agent for that
  conversation, if one exists, so the agent doesn't reply over a human.
- Reuses the existing generic messaging infrastructure (Message/Thread/Participant/
  MessageChannel) rather than building a second, WhatsApp-only message store.

## Non-goals

- Sending template messages outside the 24h customer-initiated session window.
  WhatsApp Business API only allows free-text replies within 24h of the contact's
  last message; outside that window only an approved template can be sent. This
  design surfaces a clear error when a send fails for that reason — it does not
  add template sending (already deferred in the demo-readiness spec, Phase 3b).
- Media/attachment messages. Only text messages are imported today
  (`WhatsappInboundMessageImportService` drops non-text inbound messages); this
  design keeps that restriction and only sends/renders text.
- Starting a conversation with a contact who has never messaged in. The inbox
  only surfaces existing threads.
- Multiple threads per contact. The existing import already models "one WhatsApp
  chat with a contact" as one continuous `MessageThread`
  (`threadExternalId = contact's phone number`); this design does not change that.

## Backend prerequisites (must land before the UI is useful)

### 1. Fix contact matching/creation for phone-shaped handles

`CreateCompanyAndPersonService.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate`
(`packages/zyra-server/src/modules/contact-creation-manager/services/create-company-and-contact.service.ts:245`)
skips any handle without `@` when checking for an existing Person match — but
`formatPeopleToCreateFromContacts` (line ~455) unconditionally writes
`emails.primaryEmail = handle`. For a WhatsApp participant (handle = E.164 phone
number), this currently means: no existing-Person match is attempted, and if a new
Person is created, the phone number lands in the person's email field.

Fix: branch on whether `contact.handle` is phone-shaped (no `@`). For phone-shaped
handles:
- Match existing People by `person.phones.primaryPhoneNumber` /
  `person.phones.additionalPhones`, not `person.emails`.
- Create new People with `phones.primaryPhoneNumber = handle`, not `emails`.
- Skip the work-domain/company-inference logic that only makes sense for email
  handles (`isWorkEmail`/`getDomainNameFromHandle` already no-op safely on a
  non-email string, but should not be reached for phone handles).

This affects `createCompaniesAndPeople` (the entry point used by both email and
WhatsApp imports); the email path is unaffected since email handles keep going
through the existing `emails`-based branch.

### 2. New `sendWhatsappMessage` mutation

The existing `sendEmail` mutation goes through `EmailComposerService.composeEmail`,
which requires a subject, sanitizes HTML, and validates `to` as an email address —
none of which apply to WhatsApp. Add a new, minimal mutation:

- Input: `connectedAccountId`, `to` (phone number), `body` (plain text),
  `threadExternalId` (to attach the reply to the right thread — same phone number).
- Resolver calls `MessagingMessageOutboundService.sendMessage` directly (already
  dispatches to `WhatsappMessageOutboundService` via `connectedAccount.provider`),
  then persists the sent message through the same path
  `SentMessagePersistenceService` already uses for outbound email, so the reply
  shows up in `Message`/`MessageChannelMessageAssociation` immediately.
- On failure (e.g. 24h window closed), returns a typed error the frontend can show
  inline in the conversation, not a generic toast.
- After a successful send, if a `WhatsappAgentConversationEntity` row exists for
  `(whatsappAgentId, contactPhoneNumber = to)`, set `isAiEnabled = false`.

### 3. Query support for the record widget and the global inbox

- Record widget: needs a phone-number-scoped equivalent of
  `getTimelineThreadsFromObjectRecord` (which today matches by the record's email).
  Either add a phone-matching branch to that resolver, or add a sibling resolver —
  decide during planning based on how entangled the existing one is.
- Global inbox: new query listing all `MessageThread`s whose `MessageChannel.type`
  is the WhatsApp channel type, ordered by most recent message, across the whole
  workspace (not scoped to one record) — plus a way to fetch full message history
  for a selected thread (can follow the existing
  `fetchAllThreadMessagesOperationSignatureFactory` pattern).

## Frontend

- `WhatsappCard`: new component under
  `packages/asturian-front/src/modules/activities/whatsapp/` (sibling to the
  existing `emails` module), rendered on the Person record page. Chat-bubble list
  (incoming/outgoing), a reply input pinned to the bottom, and a small header
  showing AI-enabled status for that conversation with a toggle (same
  `useSetWhatsappAgentConversationAiEnabled` hook already used in Settings).
- Global inbox page: new route, conversation list on the left (contact name/phone,
  last message preview, timestamp) and the same chat-rendering component used by
  `WhatsappCard` on the right for the selected conversation. Nav entry only shown
  when `isWhatsappMessagingEnabledState` is true (same gating already used
  elsewhere for WhatsApp-dependent UI).
- Both surfaces share one internal "conversation view" component (message list +
  reply box) to avoid duplicating chat rendering logic.

## Testing / validation plan

- Backend: unit tests for the phone-vs-email branch in
  `CreateCompanyAndPersonService` (existing test file already covers the email
  path — add phone-handle cases); unit tests for the new `sendWhatsappMessage`
  resolver/service (mock `MessagingMessageOutboundService`); typecheck + lint diff
  for `zyra-server`.
- Frontend: component test for `WhatsappCard` (renders messages, sends a reply,
  shows the 24h-window error state); typecheck + lint diff for `asturian-front`.
- Manual: seed a WhatsApp channel + a couple of inbound messages (or trigger the
  webhook import locally), confirm a Person gets created with the phone number in
  `phones` (not `emails`), open that Person's record and confirm the WhatsApp card
  shows the conversation, reply from the card, confirm the AI toggle flips off,
  confirm the same conversation appears in the global inbox.
