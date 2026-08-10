import { useEffect, useState } from 'react';
import { MEALS } from '../lib/constants';
import { greeting, fmtTime, proteinPressure, pressureBand, PRESSURE_READS } from '../lib/calc';
import { Icon } from './Icon';

const BAND_NAMES = ['Cruise', 'On track', 'Lean', 'Tight'];

export function TodayView({ state, remaining, eaten, onOpenName, onOpenEat, onDeleteEntry, onGoWizard }) {
  const [now, setNow] = useState(() => new Date());
  const [infoOpen, setInfoOpen] = useState(false);
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

  const tallies = [
    { k: 'Protein', c: 'var(--protein)', left: r.p, t: state.targets.p, u: 'g' },
    { k: 'Carbs', c: 'var(--carbs)', left: r.c, t: state.targets.c, u: 'g' },
    { k: 'Fat', c: 'var(--fat)', left: r.f, t: state.targets.f, u: 'g' },
  ];

  return (
    <section className="pad" aria-label="Today">
      <div className="greet-block">
        <p className="greet-line">
          {greeting(now.getHours())},{' '}
          <button className="name-btn press" onClick={onOpenName} aria-label="Change your name">
            <span>{state.name}</span><Icon id="i-pen" />
          </button>
        </p>
        <div className="big-remain">
          <span className="n num">{r.kcal}</span>
          <span className="u">cal left today</span>
        </div>
        <p className="greet-q">
          It's <span className="num" style={{ fontWeight: 900 }}>{fmtTime(now)}</span> — <b>what'll it be?</b>
        </p>
      </div>

      {!state.wizardDone && (
        <div className="card nudge">
          <h3>Running on default targets</h3>
          <p>Answer a few quick questions and we'll calculate yours — showing every step of the maths.</p>
          <button className="btn-light press" onClick={onGoWizard}>Calculate my targets</button>
        </div>
      )}

      {/* THE BOARD — budget, tallies and the pressure verdict in one place */}
      <div className="card">
        <div className="card-head">
          <span className="label">Still on the board</span>
          <span className="board-date num">
            {now.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="tally">
          {tallies.map((m) => {
            const pct = m.t ? Math.min(((m.t - m.left) / m.t) * 100, 100) : 0;
            return (
              <div className="tally-row" key={m.k}>
                <span className="k"><span className="swatch" style={{ background: m.c }} />{m.k}</span>
                <span className="track"><i style={{ width: pct + '%', '--tc': m.c }} /></span>
                <span className="v num">{m.left}<small>{m.u} left</small></span>
              </div>
            );
          })}
        </div>

        <div className="verdict">
          <div className="verdict-head">
            <span className="pp num" aria-label={`Protein pressure ${pp.toFixed(1)} grams per 100 calories`}>
              {pp.toFixed(1)}
            </span>
            <div className="bands" aria-hidden="true">
              {BAND_NAMES.map((b, i) => (
                <span key={b} className={i === band && pp > 0 ? 'on' : ''}>{b}</span>
              ))}
            </div>
          </div>
          <p><b>{read.label}.</b> {read.msg}</p>
        </div>
        <div className="card-head" style={{ margin: '10px 0 0' }}>
          <button className="info-btn press" aria-label="What is this number?" aria-expanded={infoOpen}
            onClick={() => setInfoOpen((o) => !o)}>?</button>
          <span className="label dim">g protein / 100 cal left</span>
        </div>
        {infoOpen && (
          <div className="info-txt">
            The protein you still need, divided by the calories you have left (per 100 cal).
            Low = relaxed, almost anything works. High = your remaining calories must come from
            lean, protein-dense food. Chicken breast is ~19 g/100 cal; hot chips are ~1.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="label">The day so far</span>
          <span className="label dim num">{eaten.kcal} cal · {eaten.p}P/{eaten.c}C/{eaten.f}F</span>
        </div>
        <div>
          {MEALS.map((m) => {
            const list = state.diary[m];
            const tot = list.reduce((a, x) => a + x.kcal, 0);
            return (
              <div className="meal" key={m}>
                <div className="meal-head">
                  <h3>{m}</h3>
                  <span className="tot num">{tot ? `${tot} cal` : <small>—</small>}</span>
                </div>
                {list.map((x) => (
                  <div className="entry" key={x.id}>
                    <div className="e-main">
                      <h4>{x.n}</h4>
                      <span className="num">{x.v} · {x.p}P/{x.c}C/{x.f}F</span>
                    </div>
                    <span className="e-kcal num">{x.kcal}</span>
                    <button className="e-del press" aria-label={`Remove ${x.n}`}
                      onClick={() => onDeleteEntry(m, x.id)}>
                      <Icon id="i-x" sm />
                    </button>
                  </div>
                ))}
                {!list.length && <p className="empty-line">Nothing logged yet.</p>}
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
