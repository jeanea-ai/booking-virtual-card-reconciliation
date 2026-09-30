# Security Policy

Never place passwords, MFA or recovery codes, card numbers, CVV/CVC values, cookies, session tokens, or live credentials in chat, issues, fixtures, logs, screenshots, reports, or commits. Test data must be synthetic.

The one-use loopback form is the only credential entry path. The local credential store is outside the package, owner-restricted, atomically written, symlink-resistant, and not encrypted at rest. Only `scripts/login_local.js` may read it, and it may submit credentials only through loopback CDP to a Booking.com origin.

Reservation number, charge-before/refund deadline, row amount, refund reason, cardholder, property, section, and run timestamp are permitted in the final report. Guest names and VCC expiration dates are not collected. Temporary extraction and structured JSON must be removed after successful PDF verification.
