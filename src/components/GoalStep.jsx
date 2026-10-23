import { GOAL_OPTIONS } from "../data/options.js";

export default function GoalStep({ selectedId, onSelect, onBack, onCalculate, error, submitLabel = "Calculate my target" }) {
  return (
    <section className="setup-panel" aria-labelledby="goal-title">
      <div className="setup-panel__intro">
        <span className="eyebrow">STEP 03 · YOUR DIRECTION</span>
        <h1 id="goal-title">What are you working toward?</h1>
        <p>Your target is a starting point you can adjust as you learn what works.</p>
      </div>

      <div className="goal-grid" role="group" aria-label="Choose your nutrition goal">
        {GOAL_OPTIONS.map((goal) => {
          const selected = selectedId === goal.id;
          return (
            <button
              aria-pressed={selected}
              className={`choice-card goal-card${selected ? " is-selected" : ""}`}
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              type="button"
            >
              <span className="goal-card__icon" aria-hidden="true">{goal.icon}</span>
              <strong>{goal.label}</strong>
              <small>{goal.description}</small>
              <span className="choice-card__check" aria-hidden="true">{selected ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-footer form-footer--nav">
        <button className="button button--quiet" onClick={onBack} type="button">
          <span aria-hidden="true">←</span> Back
        </button>
        <button className="button button--primary" onClick={onCalculate} type="button">
          {submitLabel} <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="setup-footnote">Estimates are for planning and aren’t medical advice.</p>
    </section>
  );
}
