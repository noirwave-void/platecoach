import { ACTIVITY_FACTORS, GOALS } from "../lib/calculator.js";

const activityDetails = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Little or no planned exercise",
    frequency: "0–2 days / week",
    icon: "🪑",
  },
  {
    id: "lightly-active",
    label: "Lightly active",
    description: "Light exercise or regular walks",
    frequency: "1–3 days / week",
    icon: "🚶",
  },
  {
    id: "moderately-active",
    label: "Moderately active",
    description: "Moderate, consistent training",
    frequency: "3–5 days / week",
    icon: "🏃",
  },
  {
    id: "very-active",
    label: "Very active",
    description: "Hard training most days",
    frequency: "6–7 days / week",
    icon: "🏋️",
  },
  {
    id: "extremely-active",
    label: "Extremely active",
    description: "Very hard training or a physical job",
    frequency: "High daily activity",
    icon: "⚡",
  },
];

export const ACTIVITY_OPTIONS = Object.freeze(
  activityDetails.map((activity, index) => ({
    ...activity,
    factor: ACTIVITY_FACTORS[index],
  })),
);

const goalDetails = [
  {
    id: "loss",
    label: "Lose weight",
    description: "A measured calorie deficit for gradual progress.",
    icon: "↘",
  },
  {
    id: "maintenance",
    label: "Maintain",
    description: "Stay close to your estimated daily energy needs.",
    icon: "＝",
  },
  {
    id: "gain",
    label: "Gain weight",
    description: "A modest surplus to support a steady increase.",
    icon: "↗",
  },
];

export const GOAL_OPTIONS = Object.freeze(
  goalDetails.filter((goal) => GOALS.includes(goal.id)),
);

export const DEFAULT_PROFILE = Object.freeze({
  age: "24",
  sex: "female",
  heightCm: "165",
  weightKg: "62",
});

export const DEFAULT_ACTIVITY_ID = "moderately-active";
export const DEFAULT_GOAL_ID = "maintenance";
