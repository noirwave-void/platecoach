import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDailyTotals,
  calculateFoodNutrition,
  calculateMealTotals,
  createFoodItem,
  normalizeSavedMeal,
} from "./mealNutrition.js";

const labelFood = {
  id: "label-oats",
  name: "Oats (test label fixture)",
  unit: "g",
  basisAmount: 100,
  nutrition: { calories: 380, protein: 13, carbohydrates: 68, fat: 7 },
  source: "user",
};

test("scales food nutrition from its documented 100 g basis", () => {
  assert.deepEqual(calculateFoodNutrition(labelFood, 50), {
    calories: 190,
    protein: 6.5,
    carbohydrates: 34,
    fat: 3.5,
  });
});

test("meal and daily totals derive from item quantities", () => {
  const oats = createFoodItem(labelFood, 50);
  const doubleOats = createFoodItem(labelFood, 25);
  const breakfast = { id: "breakfast", name: "Breakfast", items: [oats, doubleOats] };
  const lunch = { id: "lunch", name: "Lunch", items: [createFoodItem(labelFood, 50)] };
  assert.deepEqual(calculateMealTotals(breakfast.items), {
    calories: 285,
    protein: 9.75,
    carbohydrates: 51,
    fat: 5.25,
  });
  assert.deepEqual(calculateDailyTotals([breakfast, lunch]), {
    calories: 475,
    protein: 16.25,
    carbohydrates: 85,
    fat: 8.75,
  });
});

test("rejects invalid quantities instead of silently inventing totals", () => {
  assert.throws(() => calculateFoodNutrition(labelFood, -1), /zero or more/);
});

test("migrates prior session-only meal totals into a preserved item snapshot", () => {
  const migrated = normalizeSavedMeal({
    id: "old-meal",
    name: "Old lunch",
    calories: 450,
    protein: 20,
    carbohydrates: 55,
    fat: 15,
  });
  assert.equal(migrated.items[0].source, "legacy");
  assert.deepEqual(calculateDailyTotals([migrated]), {
    calories: 450,
    protein: 20,
    carbohydrates: 55,
    fat: 15,
  });
});

