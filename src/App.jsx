import { useEffect, useMemo, useState } from "react";
import ActivityStep from "./components/ActivityStep.jsx";
import Dashboard, { ConfirmDialog, MealEditor } from "./components/Dashboard.jsx";
import GoalStep from "./components/GoalStep.jsx";
import StatsStep from "./components/StatsStep.jsx";
import StepIndicator from "./components/StepIndicator.jsx";
import { VERIFIED_FOOD_CATALOG } from "./data/foodCatalog.js";
import {
  ACTIVITY_OPTIONS,
  DEFAULT_ACTIVITY_ID,
  DEFAULT_GOAL_ID,
  DEFAULT_PROFILE,
  GOAL_OPTIONS,
} from "./data/options.js";
import { calculateDailyTargets } from "./lib/calculator.js";
import { normalizeSavedMeal } from "./lib/mealNutrition.js";

const SESSION_KEY = "platecoach.phase1.session.v1";

function defaultSession() {
  return {
    profile: { ...DEFAULT_PROFILE },
    activityId: DEFAULT_ACTIVITY_ID,
    goalId: DEFAULT_GOAL_ID,
    targets: null,
    meals: [],
    customFoods: [],
    training: [],
    recovery: [],
  };
}

function readSession() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return defaultSession();
    return {
      ...defaultSession(),
      ...saved,
      profile: { ...DEFAULT_PROFILE, ...(saved.profile ?? {}) },
      activityId: ACTIVITY_OPTIONS.some((item) => item.id === saved.activityId)
        ? saved.activityId
        : DEFAULT_ACTIVITY_ID,
      goalId: GOAL_OPTIONS.some((item) => item.id === saved.goalId) ? saved.goalId : DEFAULT_GOAL_ID,
      targets: saved.targets && typeof saved.targets === "object" ? saved.targets : null,
      meals: Array.isArray(saved.meals) ? saved.meals.map(normalizeSavedMeal).filter(Boolean) : [],
      customFoods: Array.isArray(saved.customFoods) ? saved.customFoods : [],
      training: Array.isArray(saved.training) ? saved.training : [],
      recovery: Array.isArray(saved.recovery) ? saved.recovery : [],
    };
  } catch {
    return defaultSession();
  }
}

function BrandMark() {
  return (
    <a className="brand" href="#top" aria-label="PlateCoach home">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="img"><circle cx="20" cy="20" r="16" /><circle cx="20" cy="20" r="10" /><path d="M20 10a10 10 0 0 1 9.2 6H20z" /></svg>
      </span>
      <span>plate<span>coach</span></span>
    </a>
  );
}

function App() {
  const [session, setSession] = useState(readSession);
  const [step, setStep] = useState(() => (readSession().targets ? 4 : 1));
  const [targetDraft, setTargetDraft] = useState(null);
  const [error, setError] = useState("");
  const [mealEditor, setMealEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // The app remains usable in a browser that blocks session storage.
    }
  }, [session]);

  const profile = targetDraft?.profile ?? session.profile;
  const activityId = targetDraft?.activityId ?? session.activityId;
  const goalId = targetDraft?.goalId ?? session.goalId;
  const catalog = useMemo(
    () => [...VERIFIED_FOOD_CATALOG, ...session.customFoods],
    [session.customFoods],
  );
  const activityLabel = ACTIVITY_OPTIONS.find((item) => item.id === activityId)?.label ?? "Activity";
  const goalLabel = GOAL_OPTIONS.find((item) => item.id === goalId)?.label ?? "Daily";

  function updateProfile(field, value) {
    if (targetDraft) {
      setTargetDraft((current) => ({ ...current, profile: { ...current.profile, [field]: value } }));
    } else {
      setSession((current) => ({ ...current, profile: { ...current.profile, [field]: value } }));
    }
    setError("");
  }

  function updateChoice(field, value) {
    if (targetDraft) setTargetDraft((current) => ({ ...current, [field]: value }));
    else setSession((current) => ({ ...current, [field]: value }));
  }

  function continueFromStats() {
    const invalid = [
      [profile.age, "Age"], [profile.heightCm, "Height"], [profile.weightKg, "Weight"],
    ].find(([value]) => !Number.isFinite(Number(value)) || Number(value) <= 0);
    if (invalid) {
      setError(`${invalid[1]} must be greater than zero.`);
      return;
    }
    setStep(2);
    setError("");
  }

  function calculateTargets() {
    const activity = ACTIVITY_OPTIONS.find((item) => item.id === activityId);
    try {
      const targets = calculateDailyTargets({
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        sex: profile.sex,
        activityFactor: activity?.factor,
        goal: goalId,
      });
      if (targetDraft) {
        setSession((current) => ({ ...current, ...targetDraft, targets }));
        setTargetDraft(null);
      } else {
        setSession((current) => ({ ...current, targets }));
      }
      setStep(4);
      setError("");
    } catch (calculationError) {
      setError(calculationError.message || "We couldn’t calculate that target. Check your details.");
    }
  }

  function beginTargetEdit() {
    setTargetDraft({
      profile: { ...session.profile },
      activityId: session.activityId,
      goalId: session.goalId,
    });
    setStep(1);
    setError("");
  }

  function cancelTargetEdit() {
    setTargetDraft(null);
    setStep(4);
    setError("");
  }

  function saveMeal(meal) {
    setSession((current) => {
      const exists = current.meals.some((savedMeal) => savedMeal.id === meal.id);
      return {
        ...current,
        meals: exists
          ? current.meals.map((savedMeal) => savedMeal.id === meal.id ? meal : savedMeal)
          : [...current.meals, meal],
      };
    });
    setMealEditor(null);
  }

  function addCustomFood(food) {
    setSession((current) => ({ ...current, customFoods: [...current.customFoods, food] }));
  }

  function addTraining(entry) {
    setSession((current) => ({ ...current, training: [...current.training, entry] }));
  }

  function addRecovery(entry) {
    setSession((current) => ({ ...current, recovery: [...current.recovery, entry] }));
  }

  function confirmAction() {
    if (confirmation?.kind === "reset") {
      try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* Reset in-memory even if storage is blocked. */ }
      setSession(defaultSession());
      setStep(1);
      setTargetDraft(null);
    } else if (confirmation?.kind === "delete-meal") {
      setSession((current) => ({ ...current, meals: current.meals.filter((meal) => meal.id !== confirmation.meal.id) }));
    }
    setConfirmation(null);
  }

  function addMeal() {
    setMealEditor({ meal: null });
  }

  return (
    <div className="app-shell" id="top">
      <header className="topbar">
        <BrandMark />
        <div className="topbar__tagline"><span className="status-dot" aria-hidden="true" /> A simple plan for your day</div>
      </header>

      <main className="page-content">
        {step < 4 ? (
          <>
            <div className="setup-heading">
              <div>
                <span className="eyebrow">PLATECOACH · PHASE 1</span>
                <p className="setup-heading__note">{targetDraft ? "Update your target. Your meal log will stay right where it is." : "A few thoughtful choices. One clear daily target."}</p>
              </div>
              {targetDraft ? (
                <button className="button button--quiet" onClick={cancelTargetEdit} type="button">Cancel target edit</button>
              ) : (
                <div className="privacy-note"><span aria-hidden="true">▣</span> Saved only for this browser session</div>
              )}
            </div>
            <StepIndicator currentStep={step} />
            {step === 1 && <StatsStep error={error} onChange={updateProfile} onContinue={continueFromStats} profile={profile} />}
            {step === 2 && (
              <ActivityStep
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
                onSelect={(nextId) => updateChoice("activityId", nextId)}
                selectedId={activityId}
              />
            )}
            {step === 3 && (
              <GoalStep
                error={error}
                onBack={() => setStep(2)}
                onCalculate={calculateTargets}
                onSelect={(nextId) => updateChoice("goalId", nextId)}
                selectedId={goalId}
                submitLabel={targetDraft ? "Save updated target" : "Calculate my target"}
              />
            )}
          </>
        ) : (
          <Dashboard
            activityLabel={activityLabel}
            catalog={catalog}
            goalLabel={goalLabel}
            meals={session.meals}
            onAddMeal={addMeal}
            onDeleteMeal={(meal) => setConfirmation({ kind: "delete-meal", meal })}
            onEditMeal={(meal) => setMealEditor({ meal })}
            onEditTargets={beginTargetEdit}
            onResetSession={() => setConfirmation({ kind: "reset" })}
            recovery={session.recovery}
            training={session.training}
            onAddTraining={addTraining}
            onAddRecovery={addRecovery}
            targets={session.targets}
          />
        )}
      </main>

      <footer className="app-footer"><span>PlateCoach</span><span>Small steps, steady progress.</span></footer>

      {mealEditor && (
        <MealEditor
          catalog={catalog}
          initialMeal={mealEditor.meal}
          onCancel={() => setMealEditor(null)}
          onSave={saveMeal}
          onSaveCustomFood={addCustomFood}
        />
      )}
      {confirmation?.kind === "reset" && (
        <ConfirmDialog
          title="Start over?"
          message="This will clear your current target and today's meal log. This action cannot be undone."
          confirmLabel="Start over"
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmAction}
        />
      )}
      {confirmation?.kind === "delete-meal" && (
        <ConfirmDialog
          title={`Delete ${confirmation.meal.name}?`}
          message="This meal and its food items will be removed from today's totals."
          confirmLabel="Delete meal"
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}

export default App;
