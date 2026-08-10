import { macroCals } from '../lib/calc';
import { Icon } from './Icon';
import { InfoCard } from './InfoButton';

export function ProfileView({ state, onSetTarget, onOpenName, onGoWizard }) {
  const t = state.targets;
  const fromMacros = macroCals(t.p, t.c, t.f);
  const gap = t.kcal - fromMacros;
  const balanced = Math.abs(gap) <= 25;

  const fields = [
    { id: 't-kcal', key: 'kcal', label: 'Calories' },
    { id: 't-p', key: 'p', label: 'Protein g' },
    { id: 't-c', key: 'c', label: 'Carbs g' },
    { id: 't-f', key: 'f', label: 'Fat g' },
  ];

  const row = (k, v) => (
    <div className="ledger-row" key={k}>
      <span className="k">{k}</span><span className="leader" /><span className="v num">{v}</span>
    </div>
  );

  return (
    <section className="pad" aria-label="Profile">
      <div className="card">
        <div className="prof-name">
          <div className="avatar">{state.name.charAt(0).toUpperCase()}</div>
          <div className="who">
            <h3>{state.name}</h3>
            <button className="press" onClick={onOpenName}>Change name</button>
          </div>
        </div>
      </div>

      <InfoCard label="Daily targets"
        info="Set these once (from your coach, a calculator, or the MacroMatch wizard) and leave them alone — the whole app filters food against what's left of these numbers each day.">
        <div className="t-edit">
          {fields.map((f) => (
            <div className="t-field" key={f.key}>
              <label htmlFor={f.id}>{f.label}</label>
              <input id={f.id} inputMode="numeric" value={t[f.key]}
                onChange={(e) => onSetTarget(f.key, Math.max(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0, 0))} />
            </div>
          ))}
        </div>
        <div className={`balance ${balanced ? 'ok' : 'gap'}`}>
          <Icon id={balanced ? 'i-check' : 'i-x'} sm />
          {balanced ? (
            <span>Balanced — {t.p}g P + {t.c}g C + {t.f}g F = <b className="num">{fromMacros} cal</b>, matching your budget.</span>
          ) : (
            <span>
              Your macros add to <b className="num">{fromMacros} cal</b> but the calorie target is{' '}
              <b className="num">{t.kcal}</b> — {Math.abs(gap)} cal {gap > 0 ? 'unaccounted for' : 'over'}.
              Adjust one number, or use the wizard for a guaranteed-balanced plan.
            </span>
          )}
        </div>
        <button className="wizard-cta press" onClick={onGoWizard}>
          <Icon id="i-calc" sm />
          {state.wizardDone ? 'Recalculate with the wizard' : 'Calculate my targets — the wizard'}
        </button>
      </InfoCard>

      <InfoCard label="The working"
        info="Every macro has a fixed calorie value — protein 4 cal/g, carbs 4 cal/g, fat 9 cal/g. Your targets should always add up to your calorie budget. MacroMatch checks this constantly so your numbers never quietly drift.">
        <div>
          {row(`Protein ${t.p} g × 4`, t.p * 4)}
          {row(`Carbs ${t.c} g × 4`, t.c * 4)}
          {row(`Fat ${t.f} g × 9`, t.f * 9)}
          <div className="ledger-row total">
            <span className="k">Day budget</span>
            <span className="leader" />
            <span className="v num">{t.kcal} cal</span>
          </div>
        </div>
      </InfoCard>

      <p className="fine">
        MacroMatch provides general nutrition information and calculation tools — not medical or dietary advice;
        individual needs vary. For personalised guidance see a GP or an Accredited Practising Dietitian.
        Branded values approximate published Australian nutrition information; check current labels.
      </p>
    </section>
  );
}
