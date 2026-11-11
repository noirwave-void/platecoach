import { useState } from "react";

const INITIAL_MEAL = {
  name: "",
  calories: "",
  protein: "",
  carbohydrates: "",
  fat: "",
};

const FIELDS = [
  { key: "calories", label: "Calories", suffix: "kcal", step: "1" },
  { key: "protein", label: "Protein", suffix: "g", step: "0.1" },
  { key: "carbohydrates", label: "Carbohydrates", suffix: "g", step: "0.1" },
  { key: "fat", label: "Fat", suffix: "g", step: "0.1" },
];

export default function MealForm({ onAdd }) {
  const [meal, setMeal] = useState(INITIAL_MEAL);
  const [error, setError] = useState("");

  function update(field, value) {
    setMeal((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (FIELDS.some(({ key }) => meal[key].trim() === "")) {
      setError("Enter an amount for each nutrient.");
      return;
    }
    const numericFields = FIELDS.map(({ key }) => [key, Number(meal[key])]);
    const hasInvalidValue = numericFields.some(
      ([, value]) => !Number.isFinite(value) || value < 0,
    );
    if (hasInvalidValue) {
      setError("Enter valid amounts of zero or more for each nutrient.");
      return;
    }

    onAdd({
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      name: meal.name.trim(),
      calories: Number(meal.calories),
      protein: Number(meal.protein),
      carbohydrates: Number(meal.carbohydrates),
      fat: Number(meal.fat),
    });
    setMeal(INITIAL_MEAL);
    setError("");
  }

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      <label className="field meal-form__name">
        <span>Meal name</span>
        <input
          autoComplete="off"
          maxLength="48"
          onChange={(event) => update("name", event.target.value)}
          placeholder="e.g. Lunch"
          required
          value={meal.name}
        />
      </label>
      <div className="meal-form__nutrients">
        {FIELDS.map(({ key, label, suffix, step }) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <div className="input-with-suffix">
              <input
                inputMode="decimal"
                min="0"
                onChange={(event) => update(key, event.target.value)}
                required
                step={step}
                type="number"
                value={meal[key]}
              />
              <small>{suffix}</small>
            </div>
          </label>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button--primary meal-form__submit" type="submit">
        <span aria-hidden="true">＋</span> Add meal
      </button>
    </form>
  );
}
