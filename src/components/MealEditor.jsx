import { useEffect, useMemo, useState } from "react";
import CustomFoodForm from "./CustomFoodForm.jsx";
import {
  calculateFoodNutrition,
  calculateMealTotals,
  createFoodItem,
  FOOD_UNITS,
  NUTRIENT_FIELDS,
} from "../lib/mealNutrition.js";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const decimal = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

function display(value) {
  return decimal.format(value);
}

export default function MealEditor({ initialMeal, catalog, onCancel, onSave, onSaveCustomFood }) {
  const [name, setName] = useState(initialMeal?.name ?? MEAL_TYPES[0]);
  const [customName, setCustomName] = useState(
    initialMeal && !MEAL_TYPES.includes(initialMeal.name) ? initialMeal.name : "",
  );
  const [items, setItems] = useState(() => (initialMeal?.items ?? []).map((item) => ({ ...item })));
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [error, setError] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  const allFoods = catalog;
  const selectedFood = allFoods.find((food) => food.id === selectedFoodId) ?? null;
  const suggestions = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return search ? allFoods.filter((food) => food.name.toLocaleLowerCase().includes(search)).slice(0, 8) : [];
  }, [allFoods, query]);
  const preview = selectedFood && Number(quantity) >= 0 && Number.isFinite(Number(quantity))
    ? calculateFoodNutrition(selectedFood, Number(quantity))
    : null;
  const mealTotals = calculateMealTotals(items);
  const mealName = name === "custom" ? customName.trim() : name;
  const selectableUnits = selectedFood
    ? FOOD_UNITS.find((unit) => unit.value === selectedFood.unit)
    : null;

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  function selectFood(food) {
    setSelectedFoodId(food.id);
    setQuery(food.name);
    setQuantity(String(food.unit === "g" || food.unit === "ml" ? 100 : 1));
    setError("");
  }

  function addSelectedFood(event) {
    event.preventDefault();
    if (!selectedFood) {
      setError(allFoods.length
        ? "Select a food from the suggestions before adding it."
        : "No verified foods are available yet. Add a custom food using trusted label values.");
      return;
    }
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    setItems((current) => [...current, createFoodItem(selectedFood, quantity)]);
    setSelectedFoodId("");
    setQuery("");
    setQuantity("100");
    setError("");
  }

  function updateQuantity(id, nextQuantity) {
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, quantity: nextQuantity } : item,
    ));
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function saveMeal(event) {
    event.preventDefault();
    if (!mealName) {
      setError("Enter a meal name.");
      return;
    }
    if (!items.length) {
      setError("Add at least one food to this meal before saving.");
      return;
    }
    onSave({ id: initialMeal?.id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, name: mealName, items });
  }

  function customFoodSaved(food) {
    onSaveCustomFood(food);
    selectFood(food);
    setShowCustomForm(false);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section className="meal-editor modal-panel" aria-labelledby="meal-editor-title" aria-modal="true" role="dialog">
        <header className="modal-panel__header">
          <div>
            <span className="eyebrow">MEAL BUILDER</span>
            <h2 id="meal-editor-title">{initialMeal ? "Edit meal" : "Add a meal"}</h2>
            <p>Choose foods and portions. Meal nutrition is calculated from each food’s saved basis.</p>
          </div>
          <button aria-label="Close meal editor" className="icon-button" onClick={onCancel} type="button">×</button>
        </header>

        {showCustomForm ? (
          <CustomFoodForm onCancel={() => setShowCustomForm(false)} onSave={customFoodSaved} />
        ) : (
          <form onSubmit={saveMeal}>
            <div className="meal-editor__meal-name">
              <label className="field">
                <span>Meal</span>
                <select onChange={(event) => setName(event.target.value)} value={name}>
                  {MEAL_TYPES.map((type) => <option key={type}>{type}</option>)}
                  <option value="custom">Custom meal</option>
                </select>
              </label>
              {name === "custom" && (
                <label className="field">
                  <span>Custom name</span>
                  <input maxLength="40" onChange={(event) => setCustomName(event.target.value)} required value={customName} />
                </label>
              )}
            </div>

            <section className="food-picker" aria-labelledby="food-picker-title">
              <div className="food-picker__heading">
                <h3 id="food-picker-title">Add food</h3>
                <span>{allFoods.length} saved foods</span>
              </div>
              <label className="field">
                <span>Search foods</span>
                <input
                  autoFocus
                  autoComplete="off"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedFoodId("");
                    setError("");
                  }}
                  placeholder="Search food name"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={suggestions.length > 0}
                  value={query}
                />
              </label>
              {suggestions.length > 0 && (
                <ul className="food-suggestions" role="listbox" aria-label="Food suggestions">
                  {suggestions.map((food) => (
                    <li key={food.id} role="option" aria-selected={selectedFoodId === food.id}>
                      <button onClick={() => selectFood(food)} type="button">
                        <span>{food.name}</span><small>per {food.basisAmount} {food.unit}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {query.trim() && !suggestions.length && !selectedFood && (
                <p className="food-picker__empty" role="status">“{query}” isn’t in the verified food data. PlateCoach won’t guess its nutrition.</p>
              )}
              {!allFoods.length && (
                <p className="food-picker__source-note">No verified general-food records were included in the project assets. You can add a custom food from trusted label values below.</p>
              )}

              {selectedFood && (
                <div className="food-quantity-card">
                  <div className="food-quantity-card__row">
                    <strong>{selectedFood.name}</strong>
                    <label className="quantity-control">
                      <span className="sr-only">Quantity in {selectedFood.unit}</span>
                      <input
                        aria-label={`Quantity in ${selectedFood.unit}`}
                        min="0.1"
                        onChange={(event) => setQuantity(event.target.value)}
                        step="any"
                        type="number"
                        value={quantity}
                      />
                      <span>{selectableUnits?.value ?? selectedFood.unit}</span>
                    </label>
                  </div>
                  {preview && (
                    <div className="nutrition-preview" aria-live="polite">
                      {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
                        <span key={key}><strong>{display(preview[key])}</strong> {unit} {label}</span>
                      ))}
                    </div>
                  )}
                  <button className="button button--primary" onClick={addSelectedFood} type="button">Add food</button>
                </div>
              )}
              <button className="text-button" onClick={() => setShowCustomForm(true)} type="button">
                + Add custom food <span>(advanced)</span>
              </button>
            </section>

            {error && <p className="form-error" role="alert">{error}</p>}

            <section className="meal-draft" aria-labelledby="meal-draft-title">
              <div className="food-picker__heading">
                <h3 id="meal-draft-title">{mealName || "Meal"} foods <span>{items.length}</span></h3>
                <div className="meal-draft__total"><strong>{display(mealTotals.calories)} kcal</strong><span>meal total</span></div>
              </div>
              {items.length ? (
                <ul className="meal-draft__items">
                  {items.map((item) => {
                    const rowTotals = calculateFoodNutrition(item, item.quantity);
                    return (
                      <li className="meal-draft-item" key={item.id}>
                        <div className="meal-draft-item__main">
                          <strong>{item.foodName}</strong>
                          {item.source === "user" && <small>Custom food</small>}
                          {item.source === "legacy" && <small>Previous session entry</small>}
                        </div>
                        {item.source !== "legacy" ? (
                          <label className="quantity-control quantity-control--compact">
                            <span className="sr-only">{item.foodName} quantity</span>
                            <input
                              aria-label={`${item.foodName} quantity`}
                              min="0.1"
                              onChange={(event) => updateQuantity(item.id, event.target.value === "" ? "" : Number(event.target.value))}
                              step="any"
                              type="number"
                              value={item.quantity}
                            />
                            <span>{item.unit}</span>
                          </label>
                        ) : <span className="meal-draft-item__quantity">Previous entry</span>}
                        <div className="meal-draft-item__nutrition">
                          <strong>{display(rowTotals.calories)} kcal</strong>
                          <small>P {display(rowTotals.protein)} · C {display(rowTotals.carbohydrates)} · F {display(rowTotals.fat)} g</small>
                        </div>
                        <button aria-label={`Remove ${item.foodName}`} className="icon-button icon-button--small" onClick={() => removeItem(item.id)} type="button">×</button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="meal-draft__empty">Your food items will appear here. Add one or more foods above.</div>
              )}
              <div className="meal-draft__summary">
                {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
                  <span key={key}>{label} <strong>{display(mealTotals[key])} {unit}</strong></span>
                ))}
              </div>
            </section>

            <div className="meal-editor__actions">
              <button className="button button--quiet" onClick={onCancel} type="button">Cancel</button>
              <button className="button button--primary" type="submit">Save meal</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
