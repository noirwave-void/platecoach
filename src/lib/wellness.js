export function sessionStrain(session) {
  const duration = Number(session?.durationMinutes);
  const rpe = Number(session?.rpe);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(rpe) || rpe < 1 || rpe > 10) return null;
  return duration * rpe;
}

export function weekKey(date = new Date()) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "unknown";
  const monday = new Date(value);
  const day = (value.getDay() + 6) % 7;
  monday.setDate(value.getDate() - day);
  return monday.toISOString().slice(0, 10);
}

export function weeklySummary(training = [], recovery = [], meals = []) {
  const grouped = new Map();
  training.forEach((item) => {
    const key = weekKey(item.date);
    const row = grouped.get(key) ?? { week: key, workouts: 0, duration: 0, load: 0, loadSessions: 0 };
    const strain = sessionStrain(item);
    row.workouts += 1;
    row.duration += Number(item.durationMinutes) || 0;
    if (strain !== null) { row.load += strain; row.loadSessions += 1; }
    grouped.set(key, row);
  });
  recovery.forEach((item) => {
    const key = weekKey(item.date);
    const row = grouped.get(key) ?? { week: key, workouts: 0, duration: 0, load: 0, loadSessions: 0 };
    row.sleep = (row.sleep ?? 0) + (Number(item.sleepHours) || 0);
    row.recoveryEntries = (row.recoveryEntries ?? 0) + 1;
    grouped.set(key, row);
  });
  return [...grouped.values()].sort((a, b) => b.week.localeCompare(a.week));
}

export function coachingSignals({ meals = [], targets, training = [], recovery = [] }) {
  const signals = [];
  if (targets && meals.length === 0) signals.push({ tone: "quiet", title: "Start with one meal", body: "Log your next meal to make today’s nutrition signal useful." });
  const recent = training.filter((item) => weekKey(item.date) === weekKey()).length;
  if (recent === 0) signals.push({ tone: "blue", title: "No training logged this week", body: "Add a session when you train; load is only calculated from duration and a valid RPE." });
  const latest = recovery.filter((item) => weekKey(item.date) === weekKey()).at(-1);
  if (latest?.sleepHours && Number(latest.sleepHours) < 7) signals.push({ tone: "orange", title: "Sleep is below 7 hours", body: "Consider a lighter day if your energy or soreness also feels off." });
  if (!signals.length) signals.push({ tone: "green", title: "Your log is up to date", body: "Keep recording meals, training, and recovery to make the weekly view more useful." });
  return signals.slice(0, 3);
}
