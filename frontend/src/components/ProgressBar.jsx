export default function ProgressBar({ value, target, tone = "green", label }) {
  const percentage = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  return (
    <div
      aria-label={label}
      aria-valuemax="100"
      aria-valuemin="0"
      aria-valuenow={Math.round(percentage)}
      className={`progress-track progress-track--${tone}`}
      role="progressbar"
    >
      <span className="progress-track__fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
