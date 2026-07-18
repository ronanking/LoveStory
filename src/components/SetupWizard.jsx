import { useState } from 'react';
import { ACTIVITY, GOALS, SPLITS, BF_BANDS } from '../lib/constants';
import { calcPlan, macroCals, num } from '../lib/calc';
import { InfoCard } from './InfoButton';

const STEPS = ['About you', 'Activity', 'Goal', 'Macro style', 'Your numbers'];

// The target wizard: Mifflin-St Jeor, or Katch-McArdle when body fat is given,
// with the full working printed at the end — no black boxes.
export function SetupWizard({ initialProfile, onApply, onGoLearn }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialProfile || {
    sex: 'male', age: '', heightCm: '', weightKg: '', bodyFat: '',
    activity: 1.55, goal: 'maintain', split: 'balanced',
  });
  const set = (k, v) => setProfile((s) => ({ ...s, [k]: v }));
  const plan = calcPlan(profile);
  const canNext = step !== 0 ||
    (num(profile.age) !== null && num(profile.heightCm) !== null && num(profile.weightKg) !== null &&
      num(profile.age) > 0 && num(profile.heightCm) > 0 && num(profile.weightKg) > 0);

  return (
    <section className="pad" aria-label="Set up your targets">
      <div className="wiz-progress" aria-hidden="true">
        {STEPS.map((s, i) => <span key={s} className={i <= step ? 'on' : ''} />)}
      </div>
      <p className="wiz-step-label">Step {step + 1} of {STEPS.length} — <b>{STEPS[step]}</b></p>

      {step === 0 && (
        <InfoCard label="Tell us about you"
          info="These feed the calorie equations. If you also give a body fat estimate, we switch to the Katch-McArdle formula, which works off your lean mass — more accurate, especially at higher or lower body fat.">
          <div className="seg-row">
            {['male', 'female'].map((s) => (
              <button key={s} type="button" className="seg press" aria-pressed={profile.sex === s}
                onClick={() => set('sex', s)}>{s}</button>
            ))}
          </div>
          <div className="wiz-grid">
            <NumField id="w-age" label="Age" unit="yrs" ph="25" value={profile.age} onChange={(v) => set('age', v)} />
            <NumField id="w-h" label="Height" unit="cm" ph="180" value={profile.heightCm} onChange={(v) => set('heightCm', v)} />
            <NumField id="w-w" label="Weight" unit="kg" ph="82" value={profile.weightKg} onChange={(v) => set('weightKg', v)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <NumField id="w-bf" label="Body fat" unit="% · optional" ph="e.g. 18" value={profile.bodyFat} onChange={(v) => set('bodyFat', v)} />
            <p className="info-txt" style={{ marginTop: 8 }}>
              Why it helps: your lean mass — muscle, bone, organs — is what burns energy and needs protein.
              Two people at 90 kg can have very different lean mass. Don't know it? Tap the closest description:
            </p>
            {BF_BANDS[profile.sex].map((b) => (
              <button key={b.label} type="button"
                className={`bf-band press${num(profile.bodyFat) === b.mid ? ' sel' : ''}`}
                onClick={() => set('bodyFat', String(b.mid))}>
                <span><strong>{b.label}</strong> <span style={{ color: 'var(--sub)' }}>· {b.desc}</span></span>
                <span className="rng">{b.range}</span>
              </button>
            ))}
            <p className="fine" style={{ paddingTop: 10 }}>
              Visual estimates are within a few percent for most people — plenty accurate for setting targets.
              Skip it and we'll use the weight-based formula instead.
            </p>
          </div>
        </InfoCard>
      )}

      {step === 1 && (
        <InfoCard label="How active are you?"
          info="Your resting burn (BMR) gets multiplied by an activity factor to estimate total daily energy expenditure (TDEE) — everything you burn in a normal day. Most people overestimate this by one level; when in doubt, pick the lower one.">
          <div style={{ marginTop: 10 }}>
            {ACTIVITY.map((a) => (
              <OptionRow key={a.key} selected={profile.activity === a.key}
                onClick={() => set('activity', a.key)}
                title={a.label} desc={a.desc} right={`×${a.key}`} />
            ))}
          </div>
        </InfoCard>
      )}

      {step === 2 && (
        <InfoCard label="What's the goal?"
          info="Roughly 7,700 cal ≈ 1 kg of body weight, so ±0.5 kg/week works out to about ±550 cal/day from your TDEE. Cutting goals also nudge protein up to protect muscle.">
          <GoalHelper profile={profile} onPick={(k) => set('goal', k)} />
          <div style={{ marginTop: 8 }}>
            {GOALS.map((g) => (
              <OptionRow key={g.key} selected={profile.goal === g.key}
                onClick={() => set('goal', g.key)}
                title={g.label} subtitle={g.rate} desc={g.best}
                right={g.adj === 0 ? (g.key === 'recomp' ? 'TDEE +P' : 'TDEE') : `${g.adj > 0 ? '+' : ''}${g.adj} cal`}
                expandable={g.note} />
            ))}
          </div>
        </InfoCard>
      )}

      {step === 3 && (
        <InfoCard label="Pick a macro style"
          info="Protein and fat are set per kg of body weight (or lean mass, if you gave body fat) — the way sports nutrition actually prescribes them. Carbs fill whatever calories remain, so your macros always sum exactly to your calorie target.">
          <p className="info-txt" style={{ marginTop: 4 }}>
            There's no single "correct" split — protein and total calories do the heavy lifting for every goal.
            The right style is the one you'll stick to.
          </p>
          <div style={{ marginTop: 8 }}>
            {SPLITS.map((s) => (
              <OptionRow key={s.key} selected={profile.split === s.key}
                onClick={() => set('split', s.key)}
                title={s.label} desc={s.desc} right={`${s.pKg}P · ${s.fKg}F g/kg`}
                expandable={
                  <span>
                    <strong>Best for:</strong> {s.bestFor}<br />
                    <strong>The science:</strong> {s.science}<br />
                    <strong>Trade-off:</strong> {s.tradeoff}
                  </span>
                } />
            ))}
          </div>
          <button type="button" className="meal-add press" onClick={onGoLearn}>
            Want the full story on each macro? Open Learn
          </button>
        </InfoCard>
      )}

      {step === 4 && plan && (
        <InfoCard label="Your numbers — and the working"
          info="Every line below is a calculation you can check by hand. If we can't show the working, we don't ship it.">
          <div style={{ marginTop: 6 }}>
            {plan.lbm !== null && (
              <Row k={`Lean mass (${plan.bf}% body fat)`} v={`${plan.lbm} kg`} />
            )}
            <Row k={`Resting burn — ${plan.formula.split(' (')[0]}`} v={`${plan.bmr} cal`} />
            <Row k={`× activity (${ACTIVITY.find((a) => a.key === profile.activity).label})`} v={`${plan.tdee} cal`} />
            <Row k={plan.goalObj.label} v={`${plan.adj >= 0 ? '+' : ''}${plan.adj} cal`} />
            <div className="ledger-row" style={{ borderTop: '2px solid var(--ink)', marginTop: 6, paddingTop: 10 }}>
              <span className="k" style={{ color: 'var(--ink)', fontWeight: 700 }}>DAILY TARGET</span>
              <span className="leader" />
              <span className="v num" style={{ fontSize: 16 }}>{plan.kcal} cal</span>
            </div>
          </div>
          <div className="macro-tiles">
            {[
              { l: 'Protein', v: plan.p, n: `${plan.pKgUsed} g/kg ${plan.lbm !== null ? 'lean mass' : 'bodyweight'}`, c: 'var(--dot-p)' },
              { l: 'Carbs', v: plan.c, n: 'fills the rest', c: 'var(--dot-c)' },
              { l: 'Fat', v: plan.f, n: `${plan.sp.fKg} g/kg bodyweight`, c: 'var(--dot-f)' },
            ].map((m) => (
              <div className="macro-tile" key={m.l}>
                <div className="g" style={{ color: m.c }}>{m.v}g</div>
                <div className="l">{m.l}</div>
                <div className="n">{m.n}</div>
              </div>
            ))}
          </div>
          <p className="cross-check">
            Cross-check: {plan.p}×4 + {plan.c}×4 + {plan.f}×9 ={' '}
            <b className="num">{macroCals(plan.p, plan.c, plan.f)} cal ✓</b>
          </p>
          {plan.lowFlag && (
            <div className="low-flag">
              This lands quite low relative to your estimated resting burn. Consider a slower rate — and it's
              worth talking to a GP or accredited dietitian before running an aggressive deficit.
            </div>
          )}
          <button type="button" className="apply-btn press" onClick={() => onApply(plan, profile)}>
            Use these as my daily targets
          </button>
        </InfoCard>
      )}

      <div className="wiz-nav">
        <button type="button" className="back press" disabled={step === 0}
          onClick={() => setStep((s) => Math.max(s - 1, 0))}>← Back</button>
        {step < 4 && (
          <button type="button" className="next press" disabled={!canNext}
            onClick={() => canNext && setStep((s) => s + 1)}>Next →</button>
        )}
      </div>
    </section>
  );
}

function Row({ k, v }) {
  return (
    <div className="ledger-row">
      <span className="k">{k}</span><span className="leader" /><span className="v num">{v}</span>
    </div>
  );
}

function NumField({ id, label, unit, ph, value, onChange }) {
  return (
    <div className="t-field">
      <label htmlFor={id}>{label} · {unit}</label>
      <input id={id} inputMode="numeric" placeholder={ph} value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} />
    </div>
  );
}

function OptionRow({ selected, onClick, title, subtitle, desc, right, expandable }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`opt${selected ? ' sel' : ''}`}>
      <button type="button" className="opt-main" onClick={onClick} aria-pressed={selected}>
        <span>
          <span className="t">{title}</span>
          {subtitle && <span className="s">{subtitle}</span>}
          {desc && <span className="d">{desc}</span>}
        </span>
        {right && <span className="r">{right}</span>}
      </button>
      {expandable && (
        <div className="opt-more">
          <button type="button" className="toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? '▾ Hide details' : '▸ Who is this for, and why?'}
          </button>
          {open && <div className="detail">{expandable}</div>}
        </div>
      )}
    </div>
  );
}

// "Help me choose" goal recommender — two questions, one suggestion, with why.
function GoalHelper({ profile, onPick }) {
  const [open, setOpen] = useState(false);
  const [aim, setAim] = useState(null);
  const [exp, setExp] = useState(null);
  const bf = num(profile.bodyFat);
  const male = profile.sex === 'male';

  let rec = null;
  if (aim && exp) {
    if (aim === 'keep') rec = 'maintain';
    else if (aim === 'lose') {
      const veryLean = bf !== null && bf < (male ? 12 : 20);
      rec = veryLean ? 'cut_slow' : 'cut_std';
    } else if (aim === 'both') {
      if (exp === 'new') rec = 'recomp';
      else rec = bf !== null && bf > (male ? 18 : 26) ? 'cut_slow' : 'gain_lean';
    } else if (aim === 'build') {
      rec = bf !== null && bf > (male ? 20 : 30) ? 'recomp' : (exp === 'new' ? 'gain_std' : 'gain_lean');
    }
  }
  const recObj = rec ? GOALS.find((g) => g.key === rec) : null;
  const why = {
    maintain: "You said you're happy where you are — maintenance protects that while you focus on training and habits.",
    cut_std: 'A standard cut is the sweet spot for fat loss: real progress without wrecking your training or social life.',
    cut_slow: "You're already lean (or want to protect performance), so a gentle deficit keeps muscle safe while trimming.",
    recomp: 'With a new training stimulus (or higher body fat), your body can build muscle and burn fat at the same calories — no deficit needed yet.',
    gain_lean: 'As an experienced trainee, muscle comes slowly — a small surplus feeds growth without stacking on fat.',
    gain_std: 'Newer lifters grow quickly enough to use a bigger surplus, so a faster gain gets you moving.',
  };

  const Chip = ({ active, onClick, children }) => (
    <button type="button" className="chip mini press" aria-pressed={!!active} onClick={onClick}>{children}</button>
  );

  return (
    <div className="helper">
      <button type="button" className="toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '▾' : '▸'} No idea what's right for you? Answer two questions
      </button>
      {open && (
        <div>
          <p className="q">Right now, I mostly want to…</p>
          <div className="chips-wrap">
            <Chip active={aim === 'lose'} onClick={() => setAim('lose')}>Lose fat</Chip>
            <Chip active={aim === 'build'} onClick={() => setAim('build')}>Build muscle</Chip>
            <Chip active={aim === 'both'} onClick={() => setAim('both')}>Both at once</Chip>
            <Chip active={aim === 'keep'} onClick={() => setAim('keep')}>Stay as I am</Chip>
          </div>
          <p className="q">My weight training experience:</p>
          <div className="chips-wrap">
            <Chip active={exp === 'new'} onClick={() => setExp('new')}>New / returning (&lt;1 yr)</Chip>
            <Chip active={exp === 'exp'} onClick={() => setExp('exp')}>Experienced (1+ yrs)</Chip>
          </div>
          {recObj && (
            <div className="rec">
              <div style={{ fontSize: 13 }}>
                <strong style={{ color: 'var(--fit)' }}>Suggested: {recObj.label}</strong>{' '}
                <span style={{ color: 'var(--sub)' }}>({recObj.rate})</span>
              </div>
              <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{why[rec]}</div>
              {bf === null && aim !== 'keep' && (
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 4 }}>
                  Tip: adding a body fat estimate on step 1 sharpens this suggestion.
                </div>
              )}
              <button type="button" className="pick press" onClick={() => onPick(rec)}>
                Select {recObj.label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
