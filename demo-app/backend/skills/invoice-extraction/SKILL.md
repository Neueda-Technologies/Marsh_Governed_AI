---
id: invoice-extraction
version: 1.0.0
description: Invoice-oriented entity hints and summary constraints
keywords:
  - invoice
  - inv-
  - amount due
  - eur
  - usd
---

When the document looks like an invoice:
- Prefer entities such as invoice_number, amount_due, due_date, vendor_name
- Keep summary under 120 characters
- If currency is ambiguous, note uncertainty in summary; do not invent amounts
