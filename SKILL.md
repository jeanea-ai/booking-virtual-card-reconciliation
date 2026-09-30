---
name: booking-virtual-card-reconciliation
description: Reconcile Booking.com Extranet virtual cards into Ready to Charge and Refund Due PDF reports. Use for Booking.com VCC reconciliation, cards ready to charge, or refunds due. Read-only; never charges or refunds cards.
tags: [hotel, booking.com, virtual-cards, reconciliation, browser, accounting]
version: 0.2.0
---

# Booking.com Virtual Card Reconciliation

Create a read-only, Booking.com-specific PDF from the Extranet’s Ready to Charge and Refund Due sections. Minimize questions and never perform a charge, refund, reservation edit, or other mutation.

## Non-negotiable privacy rules

- Credentials enter only through `npm run credentials:setup`, the expiring one-use loopback form. Never ask for them in chat or pass them as arguments.
- Never read, save, log, report, or return a card number, CVV/CVC, password, MFA/recovery code, cookie, session token, or other payment credential.
- Reservation number, charge-before date or refund deadline, row amount, refund reason, cardholder, property, section, and run date/time are permitted in the final PDF. Do not open “View card details” or individual reservations.
- The local credential file is owner-restricted but not encrypted at rest. It lives outside this package at `~/.openclaw/workspace-main/booking-vcc/.credentials.json`, or under `BOOKING_VCC_CONFIG_DIR`.
- The user completes MFA directly on Booking.com. Never request or observe the code.

## Setup and sign-in

Run `npm run credentials:check`; if needed, explain local storage and run `npm run credentials:setup`. Create a sanitized `setup-state.json` conforming to `schema/setup-state.schema.json`, using only the `booking.username` and `booking.password` references plus non-secret property IDs, names, and IANA timezones. Run `node scripts/check_setup.js setup-state.json` and continue only on `ready`.

Run `npm run login:local`. It may connect only to loopback CDP and may submit credentials only on a `booking.com` host. On `mfa_required`, pause while the user completes MFA directly. Then verify the live session and property with `BookingVccExtractor.verifyInteractiveSession`.

## Property selection

If the user names a property, match case-insensitively by exact or partial name among accessible properties. Use a unique match. If multiple partial matches remain, show only those choices and ask the user. If none match, show accessible choices. If none was specified and exactly one property is accessible, select and verify it automatically. If several are accessible, show choices. Process one or multiple selected properties, producing a separate report per property.

## Extraction workflow

1. Create a unique owner-restricted run directory and validated `run-context.json`; do not include browser/session data.
2. Navigate to the Booking.com Extranet virtual-card page through the verified session. Do not rely on a fixed property/account URL when the live Extranet provides navigation.
3. On the Overview tab, call `extractOverviewTotals(document)` and require a displayed total for both sections. `Total amount: US$5,180.12` is valid. A missing total is fatal; never substitute zero. Then open the exact `Virtual cards to charge` and `Virtual cards to refund` tabs with `prepareSection`.
4. Paginate each section until its Next control is disabled. Refuse repeated signatures and stop at 100 pages. If a whole page is unreadable, reload/revisit and retry it once; after the second failure, append a sanitized `{section,page,error}` page contract and continue to the other pages/section.
5. Skip an unreadable individual row, continue the page, and retain only its row number plus a sanitized reason in `skippedRecords`.
6. Capture only reservation number, charge-before/refund-deadline, displayed row amount, refund reason, cardholder, section, source page, verified property, and run timestamp.
7. Treat the Overview totals as official. Pass them into every full-list extraction call. Do not sum rows or compare row amounts with totals. Zero is valid only when Booking.com explicitly displays zero.
8. Save page contracts temporarily as `pages.json`; validate and normalize with `node scripts/reconcile.js pages.json run-context.json reconciliation.json`.

## PDF and cleanup

Generate with `node scripts/build_report.js reconciliation.json booking-vcc-report.pdf CHROMIUM_PATH`. The PDF must always show both sections and their Booking.com-displayed totals, including zero; permitted record fields; property; run date/time; and a Skipped Records section (including skipped pages/errors).

Verify the PDF opens and visibly contains both headings, property, timestamp, and official totals. After successful generation and verification, delete `pages.json`, `reconciliation.json`, `run-context.json`, temporary HTML, and any other extraction artifacts. Retain only the final PDF. Deliver it in the Kolo conversation with a short summary listing the property, the two displayed totals, and skip counts. If PDF generation fails, retain the validated temporary data only long enough to retry or diagnose; do not expose it as the normal deliverable.

## Release gate

Run `pnpm install --frozen-lockfile` and `npm test`. Tests must cover both sections, empty sections, independent pagination, partial/ambiguous property matching, skipped rows, a page skipped after one retry, official-total passthrough without arithmetic, sensitive-field rejection, credential form behavior, login origin allowlisting, and HTML escaping. Perform a secret scan and confirm no real guest or credential data exists. Live selectors must be revalidated in a Kolo workspace against the current Booking.com Extranet before publication.
