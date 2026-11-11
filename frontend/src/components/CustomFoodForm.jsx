import { useState } from "react";
import { FOOD_UNITS, NUTRIENT_FIELDS } from "../lib/mealNutrition.js";

export default function CustomFoodForm({ onCancel, onSave }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");
  const [values, setValues] = useState({
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
  });
  const [error, setError] = useState("");
  const selectedUnit = FOOD_UNITS.find((item) => item.value === unit);

  function submit(event) {
    event.preventDefault();
    const nutrition = Object.fromEntries(
      NUTRIENT_FIELDS.map(({ key }) => [key, Number(values[key])]),
    );
    if (!name.trim()) {
      setError("Enter a food name.");
      return;
    }
    if (Object.values(values).some((value) => value.trim() === "") ||
        Object.values(nutrition).some((value) => !Number.isFinite(value) || value < 0)) {
      setError("Enter verified label values of zero or more for every nutrient.");
      return;
    }
    onSave({
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      name: name.trim(),
      unit,
      basisAmount: selectedUnit.basisAmount,
      nutrition,
      source: "user",
    });
  }

  return (
    <form className="custom-food-form" onSubmit={submit}>
      <div className="custom-food-form__notice">
        Use values from a package label or another source you trust. PlateCoach does not
        supply or estimate missing nutrition values.
      </div>
      <label className="field">
        <span>Food name</span>
        <input maxLength="70" onChange={(event) => setName(event.target.value)} required value={name} />
      </label>
      <label className="field">
        <span>Nutrition is per</span>
        <select onChange={(event) => setUnit(event.target.value)} value={unit}>
          {FOOD_UNITS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.basisAmount} {option.value}
            </option>
          ))}
        </select>
      </label>
      <div className="custom-food-form__grid">
        {NUTRIENT_FIELDS.map(({ key, label, unit: suffix }) => (
          <label className="field" key={key}>
            <span>{label} ({suffix})</span>
            <input
              min="0"
              onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              required
              step="any"
              type="number"
              value={values[key]}
            />
          </label>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="custom-food-form__basis">Values are stored per {selectedUnit.basisAmount} {selectedUnit.value}.</p>
      <div className="meal-editor__actions">
        <button className="button button--quiet" onClick={onCancel} type="button">Cancel</button>
        <button className="button button--primary" type="submit">Save custom food</button>
      </div>
    </form>
  );
}

