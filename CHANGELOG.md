# Changelog

## 0.2.0

- Initial Booking.com Extranet implementation based on the proven Expedia Kolo runtime architecture.
- Adds private one-use local credential capture, automatic local login, multi-property selection, independent section pagination, skip-aware extraction, Booking.com official-total passthrough, and PDF reporting.
- Rebuilt the extractor from live Kolo evidence: exact Booking.com tabs and columns, Overview total parsing, fail-closed totals, active-property verification, content-based repeated-page detection, page-size/Next controls, and one-retry page handling.
- Removes guest names and VCC expiration dates; reports only the fields visible on the virtual-card lists.
