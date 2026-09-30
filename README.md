# Booking.com Virtual Card Reconciliation — Kolo Skill

A read-only Kolo/OpenClaw skill for Booking.com Extranet virtual-card reconciliation. It automatically signs in through a private local credential path, lets the user complete MFA directly on Booking.com, processes one or more properties, paginates Ready to Charge and Refund Due, and creates a Booking.com-specific PDF.

## Runtime

- Node.js 18+ (Node 20.19+ for development tests)
- pnpm
- Visible shared Chromium with loopback CDP (`KOLO_BROWSER_CDP_URL`, default `http://127.0.0.1:9222`)
- A Chromium executable for PDF generation

Install runtime dependencies with `pnpm install --prod --frozen-lockfile`. For development, use `pnpm install --frozen-lockfile` and `npm test`.

## Credentials

`npm run credentials:setup` opens an expiring, one-use form in the shared browser. Credentials are stored outside the repository in an owner-restricted local file and are not encrypted at rest. They are read only by `scripts/login_local.js`, never printed, and submitted only to Booking.com through the local browser connection. MFA is entered by the user directly on Booking.com.

Use `npm run credentials:check`, rotate with `node scripts/credential_webform.js capture --replace`, and remove only on explicit request with `node scripts/credential_webform.js remove --confirm`.

## Report contract

Reports include property, run timestamp, both sections, Booking.com’s displayed section totals, guest name, reservation/confirmation number, VCC expiration date, row amount, and sanitized skipped-record diagnostics. They intentionally do not calculate or compare totals. Card numbers, CVVs, credentials, MFA values, cookies, and session tokens are forbidden.

The DOM adapter is resilient to column order because it maps Booking.com headings by name. Booking.com can change its Extranet, so live compatibility must be validated in the target Kolo workspace before publishing.

## License

MIT
