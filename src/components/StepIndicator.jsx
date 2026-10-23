const STEPS = ["Your stats", "Activity", "Your goal"];

export default function StepIndicator({ currentStep }) {
  return (
    <ol className="step-indicator" aria-label="Goal setup progress">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const complete = currentStep > step;
        const active = currentStep === step;
        return (
          <li
            className={`step-indicator__item${active ? " is-active" : ""}${complete ? " is-complete" : ""}`}
            aria-current={active ? "step" : undefined}
            key={label}
          >
            <span className="step-indicator__number" aria-hidden="true">
              {complete ? "✓" : step}
            </span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
