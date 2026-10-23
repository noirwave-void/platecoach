import { ACTIVITY_OPTIONS } from "../data/options.js";

export default function ActivityStep({ selectedId, onSelect, onBack, onContinue }) {
  return (
    <section className="setup-panel" aria-labelledby="activity-title">
      <div className="setup-panel__intro">
        <span className="eyebrow">STEP 02 · YOUR MOVEMENT</span>
        <h1 id="activity-title">How active are most weeks?</h1>
        <p>Choose the description that best matches your typical routine.</p>
      </div>

      <div className="activity-grid" role="group" aria-label="Choose your activity level">
        {ACTIVITY_OPTIONS.map((activity) => {
          const selected = selectedId === activity.id;
          return (
            <button
              aria-pressed={selected}
              className={`choice-card activity-card${selected ? " is-selected" : ""}`}
              key={activity.id}
              onClick={() => onSelect(activity.id)}
              type="button"
            >
              <span className="choice-card__icon" aria-hidden="true">{activity.icon}</span>
              <span className="choice-card__copy">
                <strong>{activity.label}</strong>
                <small>{activity.description}</small>
                <small className="choice-card__frequency">{activity.frequency}</small>
              </span>
              <span className="choice-card__check" aria-hidden="true">{selected ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      <div className="form-footer form-footer--nav">
        <button className="button button--quiet" onClick={onBack} type="button">
          <span aria-hidden="true">←</span> Back
        </button>
        <button className="button button--primary" onClick={onContinue} type="button">
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
