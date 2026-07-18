import { useState } from 'react';
import { LEARN } from '../data/learn';

export function LearnView() {
  const [open, setOpen] = useState(null);
  return (
    <section className="pad" aria-label="Learn">
      <div className="learn-head">
        <h2>The macro handbook</h2>
        <p>Everything the setup wizard assumes, explained properly. Six short reads — no fads, no fear-mongering, just the mechanics.</p>
      </div>
      {LEARN.map((sec, i) => (
        <div className="card learn-card" key={sec.title} data-open={open === i}>
          <button className="learn-toggle press" aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}>
            <span className="no num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3>{sec.title}</h3>
            <span className="pm" aria-hidden="true">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="learn-body">
              {sec.body.map((para, j) => <p key={j}>{para}</p>)}
            </div>
          )}
        </div>
      ))}
      <p className="fine">
        These are general principles from mainstream sports-nutrition research. Individual circumstances
        (medical conditions, medications, pregnancy, history with food) change the picture — an accredited
        practising dietitian is the right call for personalised advice.
      </p>
    </section>
  );
}
