import MealEditor from "./MealEditor.jsx";
import ProgressBar from "./ProgressBar.jsx";
import { calculateDailyTotals, calculateMealTotals } from "../lib/mealNutrition.js";

const MACROS = [
  { key: "protein", label: "Protein", targetKey: "proteinG", unit: "g", color: "green" },
  { key: "carbohydrates", label: "Carbohydrates", targetKey: "carbohydrateG", unit: "g", color: "orange" },
  { key: "fat", label: "Fat", targetKey: "fatG", unit: "g", color: "blue" },
];
const caloriesFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const macroFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const formatCalories = (value) => `${caloriesFormat.format(value)} kcal`;
const formatMacro = (value) => `${macroFormat.format(value)} g`;

function MacroCard({ macro, consumed, target }) {
  const remaining = target - consumed;
  return (
    <article className="macro-card">
      <div className="macro-card__heading">
        <span className={`macro-dot macro-dot--${macro.color}`} aria-hidden="true" />
        <h3>{macro.label}</h3>
        <span className="macro-card__target">of {formatMacro(target)}</span>
      </div>
      <ProgressBar label={`${macro.label} consumed`} target={target} tone={macro.color} value={consumed} />
      <div className="macro-card__numbers">
        <span><strong>{formatMacro(consumed)}</strong> consumed</span>
        <span className={remaining < 0 ? "text-over" : ""}>
          <strong>{formatMacro(remaining)}</strong> remaining
        </span>
      </div>
    </article>
  );
}

function MealCard({ meal, onEdit, onDelete }) {
  const totals = calculateMealTotals(meal.items);
  return (
    <article className="today-meal-card">
      <header className="today-meal-card__header">
        <div>
          <span className="eyebrow">{meal.items.length} {meal.items.length === 1 ? "FOOD" : "FOODS"}</span>
          <h3>{meal.name}</h3>
        </div>
        <div className="today-meal-card__actions">
          <strong>{formatCalories(totals.calories)}</strong>
          <button aria-label={`Edit ${meal.name}`} className="text-button" onClick={onEdit} type="button">Edit meal</button>
          <button aria-label={`Delete ${meal.name}`} className="icon-button icon-button--small icon-button--danger" onClick={onDelete} type="button">×</button>
        </div>
      </header>
      <ul className="today-meal-card__items">
        {meal.items.map((item) => {
          const quantity = Number(item.quantity);
          const foodTotals = calculateMealTotals([{ ...item, quantity: Number.isFinite(quantity) ? quantity : 0 }]);
          return (
            <li key={item.id}>
              <span>{item.foodName}<small>{item.source === "user" ? " · custom" : item.source === "legacy" ? " · previous entry" : ""}</small></span>
              <span>{item.quantity} {item.unit}</span>
              <strong>{formatCalories(foodTotals.calories)}</strong>
            </li>
          );
        })}
      </ul>
      <footer className="today-meal-card__totals">
        <span>Protein <strong>{formatMacro(totals.protein)}</strong></span>
        <span>Carbs <strong>{formatMacro(totals.carbohydrates)}</strong></span>
        <span>Fat <strong>{formatMacro(totals.fat)}</strong></span>
      </footer>
    </article>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="confirm-title" aria-modal="true" className="confirm-dialog" role="alertdialog">
        <span className="confirm-dialog__icon" aria-hidden="true">!</span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button autoFocus className="button button--quiet" onClick={onCancel} type="button">Cancel</button>
          <button className="button button--danger" onClick={onConfirm} type="button">{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

export default function Dashboard({
  targets,
  activityLabel,
  goalLabel,
  meals,
  catalog,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  onEditTargets,
  onResetSession,
}) {
  const totals = calculateDailyTotals(meals);
  const caloriesRemaining = targets.calorieTarget - totals.calories;
  const calorieRatio = targets.calorieTarget > 0 ? totals.calories / targets.calorieTarget : 0;
  const calorieProgress = Math.min(100, Math.max(0, calorieRatio * 100));
  const progressState = calorieRatio > 1
    ? "Above target"
    : calorieRatio >= 0.98
      ? "At target"
      : calorieRatio >= 0.9
        ? "Close to target"
        : "Under target";
  const progressTone = calorieRatio > 1 ? "over" : calorieRatio >= 0.98 ? "at" : calorieRatio >= 0.9 ? "close" : "under";

  return (
    <div className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">YOUR DAILY PLAN</span>
          <h1 id="dashboard-title">A little more mindful, every day.</h1>
          <p>{goalLabel} · {activityLabel} · Your meals, all in one place.</p>
        </div>
        <div className="dashboard-header__actions">
          <button className="button button--primary" onClick={onAddMeal} type="button"><span aria-hidden="true">＋</span> Add meal</button>
          <button className="button button--quiet" onClick={onEditTargets} type="button">Edit target</button>
        </div>
      </header>

      <section className="calorie-panel" aria-labelledby="calorie-panel-title">
        <div className="calorie-panel__main">
          <div className="calorie-panel__title-row">
            <span className="calorie-panel__icon" aria-hidden="true">◒</span>
            <span className="eyebrow">DAILY CALORIES</span>
            <span className={`target-state target-state--${progressTone}`}>{progressState}</span>
          </div>
          <h2 id="calorie-panel-title">{formatCalories(targets.calorieTarget)}</h2>
          <p>Your estimated daily energy target</p>
          <ProgressBar label="Calories consumed toward daily target" target={targets.calorieTarget} tone="green" value={totals.calories} />
          <div className="calorie-panel__progress-labels">
            <span>{calorieProgress.toFixed(0)}% of target</span>
            <span>{formatCalories(totals.calories)} consumed</span>
          </div>
        </div>
        <div className="calorie-panel__remaining">
          <span className="eyebrow">LEFT TODAY</span>
          <strong className={caloriesRemaining < 0 ? "text-over" : ""}>{formatCalories(caloriesRemaining)}</strong>
          <span>{caloriesRemaining < 0 ? "above your target" : "remaining"}</span>
        </div>
      </section>

      <section className="macro-section" aria-labelledby="macro-title">
        <div className="section-heading">
          <div><span className="eyebrow">YOUR DAILY BALANCE</span><h2 id="macro-title">Macros</h2></div>
          <span className="section-heading__hint">Targets update when you edit your goal</span>
        </div>
        <div className="macro-grid">
          {MACROS.map((macro) => <MacroCard key={macro.key} consumed={totals[macro.key]} macro={macro} target={targets[macro.targetKey]} />)}
        </div>
      </section>

      <section className="today-meals-section" aria-labelledby="today-meals-title">
        <div className="section-heading">
          <div><span className="eyebrow">TODAY</span><h2 id="today-meals-title">Today's meals <span className="meal-count">{meals.length}</span></h2></div>
          <button className="button button--outline" onClick={onAddMeal} type="button"><span aria-hidden="true">＋</span> Add meal</button>
        </div>
        {meals.length ? (
          <div className="today-meal-list">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onDelete={() => onDeleteMeal(meal)}
                onEdit={() => onEditMeal(meal)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--meals">
            <span className="empty-state__icon" aria-hidden="true">◌</span>
            <strong>Nothing on your plate yet</strong>
            <p>Add breakfast, lunch, dinner, or a snack to see daily totals update.</p>
            <button className="button button--primary" onClick={onAddMeal} type="button">＋ Add your first meal</button>
          </div>
        )}
      </section>

      <details className="calculation-note">
        <summary>How this estimate is calculated</summary>
        <p>Your BMR estimate is {formatCalories(targets.bmr)} and estimated daily energy expenditure is {formatCalories(targets.tdee)}. The goal adjustment and macro split follow the PlateCoach Phase 1 calculator.</p>
      </details>
      <p className="dashboard-footnote">A planning estimate, not a substitute for personalized medical advice. Food values from custom foods are supplied by you.</p>

      <div className="dashboard-footer-actions">
        <span>Reset today's plan and meal log</span>
        <button className="button button--danger-quiet" onClick={onResetSession} type="button">Start over</button>
      </div>
      {catalog.length > 0 && <span className="sr-only">{catalog.length} saved foods available for search</span>}
    </div>
  );
}

export { ConfirmDialog, MealEditor };
