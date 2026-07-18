import { useEffect, useState } from 'react';
import { MEALS } from '../lib/constants';
import { greeting, fmtTime, proteinPressure, pressureBand, PRESSURE_READS } from '../lib/calc';
import { Icon } from './Icon';
import { InfoCard } from './InfoButton';

export function TodayView({ state, remaining, eaten, onOpenName, onOpenEat, onDeleteEntry, onGoWizard }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const r = remaining;
  const pp = proteinPressure(r.p, r.kcal);
  const band = pressureBand(pp);
  const read = r.p === 0
    ? { label: 'Protein done', msg: 'Whatever fits your remaining calories is fair game.' }
    : PRESSURE_READS[band];

  const macroRows = [
    { k: 'Protein', dot: 'var(--dot-p)', left: r.p, t: state.targets.p, u: 'g' },
    { k: 'Carbs', dot: 'var(--dot-c)', left: r.c, t: state.targets.c, u: 'g' },
    { k: 'Fat', dot: 'var(--dot-f)', left: r.f, t: state.targets.f, u: 'g' },
  ];

  return (
    <section className="pad" aria-label="Today">
      <div className="greet-block">
        <p className="greet-line">
          <span>{greeting(now.getHours())}</span>,{' '}
          <button className="name-btn press" onClick={onOpenName} aria-label="Change your name">
            <span>{state.name}</span><Icon id="i-pen" />
          </button>
        </p>
        <div className="big-remain">
          <span>{r.kcal}</span><small> cal left today</small>
        </div>
        <p className="greet-q">
          It's <b className="num">{fmtTime(now)}</b> — <b>what'll it be?</b>
        </p>
      </div>

      {!state.wizardDone && (
        <div className="card nudge">
          <h3>Using default targets</h3>
          <p>Answer a few quick questions and we'll calculate yours — showing every step of the maths.</p>
          <button className="btn-light press" onClick={onGoWizard}>Calculate my targets</button>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <span className="label">Left today</span>
          <span className="label num">
            {now.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="macro-bars">
          {macroRows.map((m) => {
            const pct = m.t ? Math.min(((m.t - m.left) / m.t) * 100, 100) : 0;
            return (
              <div key={m.k}>
                <div className="ledger-row">
                  <span className="dot" style={{ background: m.dot }} />
                  <span className="k">{m.k}</span>
                  <span className="leader" />
                  <span className="v num">{m.left} {m.u} left</span>
                </div>
                <div className="mini-track"><i style={{ width: pct + '%' }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <InfoCard label="Protein pressure"
        info="The protein you still need, divided by the calories you have left (per 100 cal). Low = relaxed, almost anything works. High = your remaining calories must come from lean, protein-dense food. Chicken breast is ~19 g/100 cal; hot chips are ~1.">
        <div className="pp-strip">
          <div className="pp-num">
            <span>{pp.toFixed(1)}</span>
            <small>g P / 100 cal left</small>
          </div>
          <div className="pp-scale">
            <div className="pp-segs">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i <= band && pp > 0 ? (band >= 2 ? 'on hot' : 'on') : ''} />
              ))}
            </div>
            <div className="pp-band"><span>cruise</span><span>on track</span><span>lean</span><span>tight</span></div>
          </div>
        </div>
        <p className="pp-read"><b>{read.label}.</b> {read.msg}</p>
      </InfoCard>

      <div className="card">
        <div className="card-head">
          <span className="label">Food diary</span>
          <span className="label num">{eaten.kcal} cal · {eaten.p}P/{eaten.c}C/{eaten.f}F</span>
        </div>
        <div>
          {MEALS.map((m) => {
            const list = state.diary[m];
            const tot = list.reduce((a, x) => a + x.kcal, 0);
            return (
              <div className="meal" key={m}>
                <div className="meal-head">
                  <h3>{m}</h3>
                  <span className="tot num">{tot ? `${tot} cal` : '—'}</span>
                </div>
                {list.length ? list.map((x) => (
                  <div className="entry" key={x.id}>
                    <div className="e-main">
                      <h4>{x.n}</h4>
                      <span>{x.v} · {x.p}P/{x.c}C/{x.f}F</span>
                    </div>
                    <span className="e-kcal num">{x.kcal}</span>
                    <button className="e-del press" aria-label={`Remove ${x.n}`}
                      onClick={() => onDeleteEntry(m, x.id)}>
                      <Icon id="i-x" sm />
                    </button>
                  </div>
                )) : <p className="empty-line">Nothing logged yet.</p>}
                <button className="meal-add press" onClick={() => onOpenEat(m)}>
                  <Icon id="i-fork" sm />See what fits
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
