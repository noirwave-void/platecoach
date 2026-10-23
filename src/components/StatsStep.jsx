export default function StatsStep({ profile, onChange, onContinue, error }) {
  function handleSubmit(event) {
    event.preventDefault();
    onContinue();
  }

  return (
    <section className="setup-panel" aria-labelledby="stats-title">
      <div className="setup-panel__intro">
        <span className="eyebrow">STEP 01 · YOUR STARTING POINT</span>
        <h1 id="stats-title">Let’s start with your stats.</h1>
        <p>A few basics help us estimate a daily target that fits you.</p>
      </div>

      <form className="stats-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <span>Age</span>
            <div className="input-with-suffix">
              <input
                autoComplete="off"
                inputMode="numeric"
                max="110"
                min="1"
                onChange={(event) => onChange("age", event.target.value)}
                placeholder="24"
                required
                type="number"
                value={profile.age}
              />
              <small>years</small>
            </div>
          </label>

          <label className="field">
            <span>Sex</span>
            <select
              onChange={(event) => onChange("sex", event.target.value)}
              value={profile.sex}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>

          <label className="field">
            <span>Height</span>
            <div className="input-with-suffix">
              <input
                inputMode="decimal"
                min="0.1"
                onChange={(event) => onChange("heightCm", event.target.value)}
                placeholder="165"
                required
                step="0.1"
                type="number"
                value={profile.heightCm}
              />
              <small>cm</small>
            </div>
          </label>

          <label className="field">
            <span>Weight</span>
            <div className="input-with-suffix">
              <input
                inputMode="decimal"
                min="0.1"
                onChange={(event) => onChange("weightKg", event.target.value)}
                placeholder="62"
                required
                step="0.1"
                type="number"
                value={profile.weightKg}
              />
              <small>kg</small>
            </div>
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-footer">
          <p>Your details stay in this browser session.</p>
          <button className="button button--primary" type="submit">
            Continue <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}
