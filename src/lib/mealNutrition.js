export const FOOD_UNITS = Object.freeze([
  { value: "g", label: "grams (g)", basisAmount: 100 },
  { value: "ml", label: "millilitres (ml)", basisAmount: 100 },
  { value: "serving", label: "serving", basisAmount: 1 },
  { value: "piece", label: "piece / unit", basisAmount: 1 },
]);

export const NUTRIENT_FIELDS = Object.freeze([
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbohydrates", label: "Carbohydrates", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
]);

export function calculateFoodNutrition(food, quantity) {
  const amount = Number(quantity);
  const basisAmount = Number(food?.basisAmount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Food quantity must be a number of zero or more.");
  }
  if (!Number.isFinite(basisAmount) || basisAmount <= 0) {
    throw new Error("This food does not have a valid nutrition basis.");
  }
  const multiplier = amount / basisAmount;
  return Object.fromEntries(
    NUTRIENT_FIELDS.map(({ key }) => {
      const value = Number(food?.nutrition?.[key]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`This food has an invalid ${key} value.`);
      }
      return [key, value * multiplier];
    }),
  );
}

export function calculateMealTotals(items = []) {
  return items.reduce(
    (sum, item) => {
      const nutrients = calculateFoodNutrition(item, item.quantity);
      for (const { key } of NUTRIENT_FIELDS) sum[key] += nutrients[key];
      return sum;
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  );
}

export function calculateDailyTotals(meals = []) {
  return meals.reduce(
    (sum, meal) => {
      const totals = calculateMealTotals(meal.items ?? []);
      for (const { key } of NUTRIENT_FIELDS) sum[key] += Number(totals[key]) || 0;
      return sum;
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  );
}

export function createFoodItem(food, quantity) {
  const amount = Number(quantity);
  calculateFoodNutrition(food, amount);
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    foodId: food.id,
    foodName: food.name,
    quantity: amount,
    unit: food.unit,
    basisAmount: food.basisAmount,
    nutrition: { ...food.nutrition },
    source: food.source ?? "catalog",
  };
}

export function normalizeSavedMeal(meal) {
  if (Array.isArray(meal?.items)) return { ...meal, items: meal.items };
  // Preserve old session-only manual logs without making manual nutrients a
  // new entry workflow. Each old log becomes a one-entry snapshot.
  if (["calories", "protein", "carbohydrates", "fat"].every((key) => Number.isFinite(Number(meal?.[key])))) {
    return {
      id: meal.id ?? `${Date.now()}-${Math.random()}`,
      name: meal.name || "Previous meal log",
      items: [
        {
          id: `${meal.id ?? "legacy"}-previous-entry`,
          foodId: "legacy-entry",
          foodName: "Previously logged totals",
          quantity: 1,
          unit: "entry",
          basisAmount: 1,
          nutrition: {
            calories: Number(meal.calories),
            protein: Number(meal.protein),
            carbohydrates: Number(meal.carbohydrates),
            fat: Number(meal.fat),
          },
          source: "legacy",
        },
      ],
    };
  }
  return null;
}
