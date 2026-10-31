import { calculateDailyTotals } from "../lib/mealNutrition.js";
import { coachingSignals, sessionStrain, weekKey } from "../lib/wellness.js";

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const calorieFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

const formatNumber = (value) => numberFormat.format(value);
const formatCalories = (value) => `${calorieFormat.format(value)} kcal`;

function knownPositive(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function MetricRow({ label, value }) {
  return (
    <div className="features-card__metric-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function FeaturesCard({
  targets,
  meals = [],
  training = [],
  recovery = [],
  activeFeature = "nutrition",
  onSelectFeature,
}) {
  const currentWeek = weekKey(new Date());
  const totals = calculateDailyTotals(meals);
  const thisWeekTraining = training.filter((record) => weekKey(record?.date) === currentWeek);
  const thisWeekRecovery = recovery
    .filter((record) => weekKey(record?.date) === currentWeek)
    .sort((left, right) => new Date(left.date) - new Date(right.date));
  const validDurations = thisWeekTraining
    .map((record) => knownPositive(record.durationMinutes))
    .filter((value) => value !== null);
  const validStrains = thisWeekTraining
    .map(sessionStrain)
    .filter((value) => value !== null);
  const weeklyDuration = validDurations.length
    ? validDurations.reduce((sum, value) => sum + value, 0)
    : null;
  const weeklyStrain = validStrains.length
    ? validStrains.reduce((sum, value) => sum + value, 0)
    : null;
  const latestRecovery = thisWeekRecovery.at(-1) ?? null;
  const recoveryWithSleep = thisWeekRecovery
    .map((record) => knownPositive(record.sleepHours))
    .filter((value) => value !== null);
  const averageSleep = recoveryWithSleep.length
    ? recoveryWithSleep.reduce((sum, value) => sum + value, 0) / recoveryWithSleep.length
    : null;
  const calorieTarget = knownPositive(targets?.calorieTarget);
  const calorieProgress = calorieTarget
    ? Math.min(100, Math.max(0, (totals.calories / calorieTarget) * 100))
    : 0;

  const features = [
    {
      id: "nutrition",
      label: "Nutrition",
      value: calorieTarget ? formatCalories(totals.calories) : "Unavailable",
      caption: calorieTarget ? `of ${formatCalories(calorieTarget)} today` : "Set a goal to see progress",
    },
    {
      id: "training",
      label: "Training",
      value: `${thisWeekTraining.length} ${thisWeekTraining.length === 1 ? "session" : "sessions"}`,
      caption: weeklyDuration === null ? "Duration not recorded" : `${formatNumber(weeklyDuration)} min this week`,
    },
    {
      id: "recovery",
      label: "Recovery",
      value: `${thisWeekRecovery.length} ${thisWeekRecovery.length === 1 ? "check-in" : "check-ins"}`,
      caption: averageSleep === null ? "Sleep not recorded" : `${formatNumber(averageSleep)} h average sleep`,
    },
    {
      id: "weekly-progress",
      label: "Weekly progress",
      value: `${thisWeekTraining.length} ${thisWeekTraining.length === 1 ? "workout" : "workouts"}`,
      caption: "Based on this week's saved records",
    },
  ];
  const selected = features.find((feature) => feature.id === activeFeature) ?? features[0];
  const signals = coachingSignals({ meals, targets, training, recovery });

  return (
    <section aria-labelledby="features-card-title" className="features-card" id="features-card" tabIndex={-1}>
      <header className="features-card__header">
        <div>
          <h2 id="features-card-title">Your progress, from your log.</h2>
          <p>Nutrition is calculated from logged meals. Training and recovery only appear when recorded.</p>
        </div>
      </header>

      <div className="features-card__layout">
        <div aria-label="Choose a progress focus" className="features-card__choices" role="group">
          {features.map((feature) => (
            <button
              aria-pressed={selected.id === feature.id}
              className={`features-card__choice features-card__choice--${feature.id}${selected.id === feature.id ? " is-selected" : ""}`}
              key={feature.id}
              onClick={() => onSelectFeature(feature.id)}
              type="button"
            >
              <span>{feature.label}</span>
              <strong>{feature.value}</strong>
              <small>{feature.caption}</small>
            </button>
          ))}
        </div>

        <article aria-live="polite" className="features-card__detail">
          <p className="features-card__detail-label">Selected view</p>
          <h3>{selected.label}</h3>

          {selected.id === "nutrition" && (
            <>
              <div className="features-card__hero-number">
                {formatCalories(totals.calories)}
                <span>{calorieTarget ? ` of ${formatCalories(calorieTarget)} consumed today` : "logged today"}</span>
              </div>
              <div
                aria-label={`${calorieProgress.toFixed(0)} percent of daily calorie target logged`}
                aria-valuemax="100"
                aria-valuemin="0"
                aria-valuenow={calorieProgress}
                className="features-card__track"
                role="progressbar"
              >
                <span style={{ width: `${calorieProgress}%` }} />
              </div>
              <dl className="features-card__metrics">
                <MetricRow label="Protein" value={`${formatNumber(totals.protein)} / ${formatNumber(targets.proteinG)} g`} />
                <MetricRow label="Carbohydrates" value={`${formatNumber(totals.carbohydrates)} / ${formatNumber(targets.carbohydrateG)} g`} />
                <MetricRow label="Fat" value={`${formatNumber(totals.fat)} / ${formatNumber(targets.fatG)} g`} />
              </dl>
              <p className="features-card__note">Fiber and food-group insights are unavailable in the current food records.</p>
            </>
          )}

          {selected.id === "training" && (
            thisWeekTraining.length ? (
              <dl className="features-card__metrics">
                <MetricRow label="Sessions this week" value={String(thisWeekTraining.length)} />
                <MetricRow label="Recorded duration" value={weeklyDuration === null ? "Not recorded" : `${formatNumber(weeklyDuration)} min`} />
                <MetricRow label="Estimated strain" value={weeklyStrain === null ? "Unavailable" : `${formatNumber(weeklyStrain)} AU`} />
              </dl>
            ) : (
              <p className="features-card__empty">No workout sessions are recorded for this week.</p>
            )
          )}

          {selected.id === "recovery" && (
            latestRecovery ? (
              <>
                <p className="features-card__date">Latest check-in · {formatDate(latestRecovery.date)}</p>
                <dl className="features-card__metrics">
                  <MetricRow label="Sleep" value={knownPositive(latestRecovery.sleepHours) === null ? "Not recorded" : `${formatNumber(Number(latestRecovery.sleepHours))} h`} />
                  <MetricRow label="Check-ins this week" value={String(thisWeekRecovery.length)} />
                </dl>
              </>
            ) : (
              <p className="features-card__empty">No recovery check-ins are recorded for this week.</p>
            )
          )}

          {selected.id === "weekly-progress" && (
            <>
              <dl className="features-card__metrics">
                <MetricRow label="Workouts" value={String(thisWeekTraining.length)} />
                <MetricRow label="Recovery check-ins" value={String(thisWeekRecovery.length)} />
                <MetricRow label="Logged sleep average" value={averageSleep === null ? "Not available" : `${formatNumber(averageSleep)} h`} />
                <MetricRow label="Weekly nutrition average" value="Unavailable: meals have no dates" />
              </dl>
              {weeklyStrain !== null && <p className="features-card__note">Recorded training strain: {formatNumber(weeklyStrain)} AU. This estimate uses duration × session RPE.</p>}
            </>
          )}
        </article>
      </div>

      <aside aria-label="Coaching notes" className="features-card__coaching">
        <h3>Coaching notes</h3>
        <div className="features-card__coaching-list">
          {signals.map((signal, index) => (
            <article className={`features-card__signal features-card__signal--${signal.tone}`} key={`${signal.title}-${index}`}>
              <h4>{signal.title}</h4>
              <p>{signal.body}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
