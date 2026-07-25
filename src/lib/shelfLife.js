import { isoInDays } from './expiry.js'

// Rough shelf life (days from purchase) keyed by keywords in the item name.
// `null` means "keeps" — no expiry date. First match wins, so order matters.
const KEYWORD_DAYS = [
  [/rice|pasta|noodle|flour|sugar|cereal|oat|bean|lentil|chickpea|can(ned)?\b|tin(ned)?|jar|spice|sauce|oil|vinegar|honey|jam|peanut|nutella|coffee|tea|stock|broth/, null],
  [/frozen|freezer/, null],
  [/egg/, 21],
  [/butter|margarine/, 30],
  [/milk|cream|half.?and.?half/, 7],
  [/yogurt|yoghurt|kefir/, 10],
  [/cheese|feta|mozzarella|cheddar|parmesan/, 14],
  [/chicken|turkey|pork|beef|lamb|mince|steak|meat|fish|salmon|tuna|cod|seafood|shrimp|prawn/, 3],
  [/bacon|sausage|deli|ham|salami|chorizo/, 6],
  [/spinach|lettuce|salad|greens|herb|basil|cilantro|coriander|parsley|arugula|rocket|kale/, 4],
  [/strawberr|raspberr|blueberr|berry|berries/, 4],
  [/banana|avocado|peach|apricot|plum|mango/, 4],
  [/apple|orange|citrus|lemon|lime|grape|pear|melon/, 12],
  [/tomato|cucumber|pepper|broccoli|cauliflower|zucchini|courgette|mushroom|asparagus|bean sprout|corn/, 6],
  [/carrot|potato|onion|garlic|cabbage|squash|pumpkin|beet|turnip|ginger/, 21],
  [/bread|bagel|bun|roll|tortilla|wrap|pita|naan|croissant/, 5],
  [/tofu|tempeh|hummus|dip|guacamole/, 7],
  [/juice/, 6],
  [/leftover/, 3],
]

// Fallback by category when nothing matches the name.
const CATEGORY_DAYS = { food: 7, 'meal-prep': 4, leftovers: 3 }

// Days until an item like this typically goes off, or null if it keeps.
export function estimateShelfDays(name = '', category = 'food') {
  const n = name.toLowerCase()
  for (const [re, days] of KEYWORD_DAYS) if (re.test(n)) return days
  return CATEGORY_DAYS[category] ?? 7
}

// A suggested YYYY-MM-DD expiry for a new item, or '' when it keeps.
export function defaultExpiration(name, category) {
  const days = estimateShelfDays(name, category)
  return days == null ? '' : isoInDays(days)
}
