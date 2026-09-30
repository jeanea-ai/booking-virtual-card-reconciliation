# Security Policy

Never place passwords, MFA or recovery codes, card numbers, CVV/CVC values, cookies, session tokens, or live credentials in chat, issues, fixtures, logs, screenshots, reports, or commits. Test data must be synthetic.

The one-use loopback form is the only credential entry path. The local credential store is outside the package, owner-restricted, atomically written, symlink-resistant, and not encrypted at rest. Only `scripts/login_local.js` may read it, and it may submit credentials only through loopback CDP to a Booking.com origin.

Guest name, reservation/confirmation number, VCC expiration date, row amount, property, section, and run timestamp are intentionally permitted in the final report. Temporary extraction and structured JSON must be removed after successful PDF verification.
