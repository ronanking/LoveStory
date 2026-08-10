import { useState } from 'react';

// "?" toggle that reveals an explanation — the no-black-boxes rule in UI form.
export function InfoCard({ label, info, right, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <div className="card-head">
        <span className="label">{label}</span>
        {info ? (
          <button className="info-btn press" aria-label={`About ${label}`} aria-expanded={open}
            onClick={() => setOpen((o) => !o)}>?</button>
        ) : right}
      </div>
      {open && info && <div className="info-txt">{info}</div>}
      {children}
    </div>
  );
}
