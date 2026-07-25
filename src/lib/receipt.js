// Heuristics for turning raw OCR text from a grocery receipt into a list of
// candidate items. Receipts are noisy (store info, totals, tax, loyalty, prices,
// product codes), so this is deliberately conservative — the user reviews and
// edits the result before anything is added.

// Lines containing any of these tokens are almost never food items.
const NOISE =
  /\b(sub\s*-?\s*total|total|balance|change|tax|hst|gst|pst|vat|cash|debit|credit|visa|master(?:card)?|amex|card|account|auth|approv|ref|tender|tel|phone|fax|store|cashier|register|receipt|invoice|order\s*#|thank|welcome|points?|rewards?|member|loyalty|savings?|coupon|discount|qty|price|amount|subtotal|purchase|transaction|www\.|\.com|http|street|ave|road|blvd)\b/i

// A price like 3.99, $3.99, 3,99, optionally with a trailing tax flag (F/T/N).
const TRAILING_PRICE = /[-$]?\s*\d+[.,]\d{2}\s*[A-Z]?\s*$/
const LEADING_QTY = /^(\d{1,2})\s*(?:x|@|\*)?\s+/i

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bAnd\b/g, 'and')
}

// Parse OCR text → [{ name, quantity }]. Order follows the receipt.
export function parseReceipt(text) {
  const out = []
  const seen = new Set()

  for (const rawLine of String(text).split(/\r?\n/)) {
    let line = rawLine.replace(/\s+/g, ' ').trim()
    if (line.length < 3) continue
    if (NOISE.test(line)) continue
    // Needs a run of letters to be a plausible product name.
    if (!/[a-z]{2,}/i.test(line)) continue

    // Pull a leading quantity ("2 x MILK", "3 APPLES") if present.
    let quantity = 1
    const qm = line.match(LEADING_QTY)
    if (qm) quantity = Math.min(99, parseInt(qm[1], 10) || 1)
    line = line.replace(LEADING_QTY, '')

    // Drop trailing price and any per-unit price fragments.
    line = line.replace(TRAILING_PRICE, '')
    line = line.replace(/@\s*\d+[.,]\d{2}.*/i, '')
    // Drop long product / PLU codes.
    line = line.replace(/\b\d{4,}\b/g, ' ')
    // Trim non-letter noise from the ends.
    line = line.replace(/^[^a-z]+/i, '').replace(/[^a-z0-9%)\s]+$/i, '')
    line = line.replace(/\s+/g, ' ').trim()

    if (line.length < 2 || !/[a-z]{2,}/i.test(line)) continue

    const name = titleCase(line.slice(0, 40))
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    out.push({ name, quantity })
    if (out.length >= 40) break
  }

  return out
}
