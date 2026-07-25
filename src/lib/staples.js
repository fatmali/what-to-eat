// Common fridge/pantry staples for the onboarding "tap what you have" grid.
export const STAPLES = [
  'Milk',
  'Eggs',
  'Butter',
  'Cheese',
  'Yogurt',
  'Bread',
  'Chicken',
  'Mince',
  'Bacon',
  'Spinach',
  'Tomatoes',
  'Onions',
  'Garlic',
  'Carrots',
  'Potatoes',
  'Peppers',
  'Apples',
  'Bananas',
  'Lemons',
  'Rice',
  'Pasta',
  'Tofu',
  'Hummus',
  'Orange juice',
]

// Guess a category from an item name for pasted lists.
export function guessCategory(name) {
  const n = name.toLowerCase()
  if (/leftover|leftovers/.test(n)) return 'leftovers'
  if (/meal.?prep|prepped|batch/.test(n)) return 'meal-prep'
  return 'food'
}
