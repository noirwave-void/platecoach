# PlateCoach React frontend

This folder contains the Phase 1 React/Vite experience. From this directory, run:

```powershell
npm install
npm run dev
```

Build the production bundle with `npm run build`.

Run focused meal arithmetic tests with `npm test`.

## Calculator mapping

There is no Python HTTP service in the current project. `src/lib/calculator.js`
therefore mirrors the public `calculate_daily_targets` API in
`../src/goal_calculator.py`. It uses the same five activity factors, the same
male/female Mifflin-St Jeor constants, the same loss/gain/maintenance
adjustments, and the same 30/40/30 macro split and gram conversions. It returns
full-precision numbers; the UI formats them only when displaying values.
Keep the two implementations aligned if the Python calculator changes.

Activity cards display descriptive labels and training guidance. Their numeric
factors are internal values passed to the calculator and are not shown in the
normal interface.

Current target, profile, and meal entries live in per-tab `sessionStorage`.
They survive a page refresh in that tab and clear when the user starts over or
the browser session ends. Nothing is sent to a server or external API.

## Meal nutrition source and model

`src/data/foodCatalog.js` is the replaceable verified-food source. It is empty
by design: `data/raw/dish_nutrition_values.csv` currently has one explicitly
synthetic `Test_Chicken_Rice` row, and the Food.com recipe file documents
calories plus six percentage-of-daily-value fields but does not provide serving
counts or gram weights. Neither is a safe generic ingredient catalog. The
interface reports unknown food names and never fills in guessed values.

The advanced custom-food flow lets a user enter values from a source they trust
per 100 g, 100 ml, one serving, or one piece. Those values are kept in this
browser tab and labeled as custom; they are not part of the verified catalog.
`src/lib/mealNutrition.js` scales each nutrient by `quantity / basisAmount`. A
meal stores its name and item snapshots (`foodId`, label, quantity, unit,
nutrition basis, and source). Meal and daily totals are derived from food items
rather than stored separately, so changing a quantity cannot leave stale totals.
