// Frontend mirror of src/goal_calculator.py. Keep the supported values and
// calculation order aligned with calculate_daily_targets in the Python app.
export const ACTIVITY_FACTORS = Object.freeze([1.2, 1.375, 1.55, 1.725, 1.9]);
export const GOALS = Object.freeze(["loss", "maintenance", "gain"]);

function finiteNumber(value, name) {
  if (typeof value === "boolean" || value === "" || value == null) {
    throw new Error(`${name} must be a finite number.`);
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${name} must be a finite number.`);
  }
  return number;
}

function positiveNumber(value, name) {
  const number = finiteNumber(value, name);
  if (number <= 0) {
    throw new Error(`${name} must be greater than zero.`);
  }
  return number;
}

/** Mirror the tested Python calculator and return full-precision values. */
export function calculateDailyTargets({
  age,
  heightCm,
  weightKg,
  sex,
  activityFactor,
  goal,
}) {
  const ageValue = positiveNumber(age, "Age");
  const heightValue = positiveNumber(heightCm, "Height");
  const weightValue = positiveNumber(weightKg, "Weight");
  const sexValue = String(sex ?? "").trim().toLowerCase();
  if (!["male", "female"].includes(sexValue)) {
    throw new Error("Choose male or female to calculate your target.");
  }

  const factor = finiteNumber(activityFactor, "Activity level");
  if (!ACTIVITY_FACTORS.includes(factor)) {
    throw new Error("Choose one of the listed activity levels.");
  }

  const goalValue = String(goal ?? "").trim().toLowerCase();
  if (!GOALS.includes(goalValue)) {
    throw new Error("Choose a valid goal.");
  }

  const sexConstant = sexValue === "male" ? 5 : -161;
  const bmr = 10 * weightValue + 6.25 * heightValue - 5 * ageValue + sexConstant;
  const tdee = bmr * factor;
  const calorieTarget =
    goalValue === "loss" ? tdee - 500 : goalValue === "gain" ? tdee + 300 : tdee;

  return {
    bmr,
    tdee,
    calorieTarget,
    proteinG: (calorieTarget * 0.3) / 4,
    carbohydrateG: (calorieTarget * 0.4) / 4,
    fatG: (calorieTarget * 0.3) / 9,
  };
}
