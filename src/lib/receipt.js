// Heuristics for turning raw OCR text from a grocery receipt into a list of
// candidate items. Receipts are noisy (store info, totals, tax, loyalty, prices,
// product codes), so this is deliberately conservative — the user reviews and
// edits the result before anything is added.

// Lines containing any of these tokens are almost never food items.
const NOISE = new RegExp(
  '\\b(' +
    [
      'sub\\s*-?\\s*total',
      'total',
      'balance',
      'change',
      'tax',
      'hst',
      'gst',
      'pst',
      'vat',
      'cash(\\s*back)?',
      'debit',
      'credit',
      'visa',
      'master(card)?',
      'amex',
      'discover',
      'interac',
      'card',
      'account',
      'acct',
      'auth',
      'approv\\w*',
      'ref',
      'tender',
      'aid',
      'seq',
      'term(inal)?',
      'batch',
      'trace',
      'tel',
      'phone',
      'fax',
      'email',
      'store',
      'mart',
      'market',
      'supermarket',
      'grocery',
      'cashier',
      'clerk',
      'server',
      'register',
      'lane',
      'reg\\b',
      'receipt',
      'invoice',
      'order\\s*#?',
      'transaction',
      'purchase',
      'thank',
      'welcome',
      'survey',
      'feedback',
      'points?',
      'rewards?',
      'member(ship)?',
      'loyalty',
      'savings?',
      'you\\s*saved',
      'coupon',
      'discount',
      'items?\\s*sold',
      'qty',
      'quantity',
      'price',
      'amount',
      'unit',
      'www\\.',
      '\\.com',
      '\\.ca',
      'http',
      'street',
      '\\bst\\b',
      'ave(nue)?',
      'road',
      '\\brd\\b',
      'blvd',
      'suite',
      'unit\\s*#',
      'gift',
      'return',
      'policy',
      'open',
      'hours',
      'am\\b',
      'pm\\b',
    ].join('|') +
    ')\\b',
  'i',
)

// A price like 3.99, $3.99, 3,99, optionally with a trailing tax flag (F/T/N).
const TRAILING_PRICE = /[-$]?\s*\d+[.,]\d{2}\s*[A-Z]?\s*$/
const HAS_PRICE = /\d+[.,]\d{2}\b/
const LEADING_QTY = /^(\d{1,2})\s*(?:x|@|\*)?\s+/i
// Unit / weight tokens that cling to item names.
const TRAILING_UNIT = /\b\d*\s*(ea|each|lb|lbs|kg|g|gm|oz|ml|l|ct|pk|pkg|pc|pcs|dz|doz|bag|box)\b\.?$/i
const DATE_LIKE = /\b\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}\b/
const TIME_LIKE = /\b\d{1,2}:\d{2}\b/
const DAYS = /\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/i
const MONTHS = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(And|Of|With)\b/g, (m) => m.toLowerCase())
}

function vowelRatio(s) {
  const letters = s.replace(/[^a-z]/gi, '')
  if (!letters) return 0
  return (letters.match(/[aeiou]/gi)?.length ?? 0) / letters.length
}

// Parse OCR text → [{ name, quantity }]. Order follows the receipt.
export function parseReceipt(text) {
  const out = []
  const seen = new Set()
  // Receipts open with store name / address / phone (a header with no item
  // prices). Skip everything until the first line that carries a price.
  let inItems = false

  for (const rawLine of String(text).split(/\r?\n/)) {
    const original = rawLine.replace(/\s+/g, ' ').trim()
    if (!inItems) {
      if (HAS_PRICE.test(original)) inItems = true
      else continue
    }

    let line = original
    if (line.length < 3) continue
    if (NOISE.test(line)) continue
    if (DATE_LIKE.test(line) || TIME_LIKE.test(line)) continue
    if (DAYS.test(line) || MONTHS.test(line)) continue
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
    // Drop a trailing unit/weight token ("BANANAS 2LB" -> "BANANAS").
    line = line.replace(TRAILING_UNIT, '').trim()

    if (line.length < 2 || !/[a-z]{2,}/i.test(line)) continue
    // Reject code-like tokens with too few vowels (e.g. "PLU", "TXN").
    if (line.length <= 6 && vowelRatio(line) < 0.2) continue

    const name = titleCase(line.slice(0, 40))
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    out.push({ name, quantity })
    if (out.length >= 40) break
  }

  return out
}
