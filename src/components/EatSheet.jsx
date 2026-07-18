import { useEffect, useMemo, useRef, useState } from 'react';
import { CATS } from '../lib/constants';
import { evaluateFood, macroCals, num, n0 } from '../lib/calc';
import { Icon } from './Icon';

// The flagship: "Let's see what you can eat" — filters the food database
// against what's left of the day, ranks protein-pace picks first, and logs
// straight to the diary on tap.
export function EatSheet({ open, meal, foods, foodsSource, remaining, onLog, onClose }) {
  const [search, setSearch] = useState('');
  const [venue, setVenue] = useState('All');
  const [cat, setCat] = useState('all');
  const [wiggle, setWiggle] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const searchRef = useRef(null);

  const venues = useMemo(
    () => ['All', ...new Set(foods.map((f) => f.venue))],
    [foods]
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 250);
    } else {
      setShowCustom(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const r = remaining;
  const need = r.kcal > 0 && r.p > 0 ? (r.p / r.kcal) * 100 : 0;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods
      .filter((f) =>
        (venue === 'All' || f.venue === venue) &&
        (cat === 'all' || f.cat === cat) &&
        (!q || (f.name + ' ' + f.venue).toLowerCase().includes(q)))
      .map((f) => ({ f, ...evaluateFood(f, r, need, wiggle) }))
      .sort((a, b) => (b.pace - a.pace) || (b.fits - a.fits) || (b.f.p - a.f.p));
  }, [foods, venue, cat, search, r, need, wiggle]);

  const fitCount = rows.filter((x) => x.fits).length;

  return (
    <div className={`sheet${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="eat-title"
      style={{ pointerEvents: open ? 'auto' : 'none' }}>
      <div className="scrim" onClick={onClose} />
      <div className="sheet-in">
        <div className="sheet-head">
          <div className="sheet-grab" aria-hidden="true" />
          <div className="sheet-title-row">
            <h2 id="eat-title">Let's see what you can eat</h2>
            <button className="sheet-close press" aria-label="Close" onClick={onClose}>
              <Icon id="i-x" />
            </button>
          </div>
          <p className="sheet-sub num">
            <span className="hl">{r.kcal} cal</span> · <span className="hl">{r.p} g protein</span> left · logging to {meal}
          </p>
          <div className="search-row">
            <Icon id="i-search" />
            <label htmlFor="eat-search" style={{ position: 'absolute', left: -9999 }}>Search foods or venues</label>
            <input id="eat-search" ref={searchRef} type="search" placeholder="Search foods or venues…"
              autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="chips" role="group" aria-label="Filter by category">
          {CATS.map((c) => (
            <button key={c.key} type="button" className="chip mini press" aria-pressed={cat === c.key}
              onClick={() => setCat(c.key)}>{c.label}</button>
          ))}
        </div>
        <div className="chips tight" role="group" aria-label="Filter by venue">
          {venues.map((v) => (
            <button key={v} type="button" className="chip press" aria-pressed={venue === v}
              onClick={() => setVenue(v)}>{v}</button>
          ))}
        </div>
        <div className="sheet-tools">
          <label className="wiggle">
            <input type="checkbox" checked={wiggle} onChange={(e) => setWiggle(e.target.checked)} />
            10% wiggle room
          </label>
          <span className="fit-count num">{fitCount} fit</span>
        </div>

        <div className="sheet-list">
          {fitCount === 0 && (
            <div className="no-fit">
              Nothing fits what's left today{venue !== 'All' ? ` at ${venue}` : ''}.
              Try the 10% wiggle, another venue — or that's the day done, legend.
            </div>
          )}
          {rows.map((x, i) => {
            const cls = x.pace ? 'food pace' : x.fits ? 'food fits' : 'food over';
            const icon = x.pace ? 'i-bolt' : x.fits ? 'i-check' : 'i-x';
            const sub = x.fits ? "Fits what's left" : 'Over by ' + x.over.join(', ');
            return (
              <button key={x.f.id ?? i} type="button" className={`${cls} press`} disabled={!x.fits}
                aria-label={`${x.f.name}, ${x.f.kcal} calories, ${x.f.p} grams protein. ${sub}${x.fits ? `. Tap to log to ${meal}.` : ''}`}
                onClick={() => onLog(x.f)}>
                <span className="f-state"><Icon id={icon} sm /></span>
                <span className="f-main">
                  <h4>{x.f.name}</h4>
                  <span className="num">
                    {x.pace && <span className="pace-tag">Pace</span>}
                    {x.f.venue}{x.f.serving ? ` · ${x.f.serving}` : ''} · {sub}
                  </span>
                </span>
                <span className="f-nums num"><b>{x.f.kcal}</b>{x.f.p} g P</span>
              </button>
            );
          })}

          <CustomAdd open={showCustom} onToggle={() => setShowCustom((s) => !s)} onLog={onLog} />

          <p className="list-note">
            Ranked by protein pace, then fit · {foodsSource === 'supabase'
              ? 'live database · AFCD (FSANZ) + published AU nutrition info'
              : 'values approximate published AU nutrition info'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Quick-add a custom food. Macro maths integrity rule: we cross-check stated
// calories against 4/4/9 and flag mismatches — never silently fix them.
function CustomAdd({ open, onToggle, onLog }) {
  const [c, setC] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const set = (k) => (e) =>
    setC((s) => ({ ...s, [k]: k === 'name' ? e.target.value : e.target.value.replace(/\D/g, '') }));

  const fromMacros = macroCals(n0(c.p), n0(c.c), n0(c.f));
  const stated = num(c.kcal);
  const mismatch = stated !== null && fromMacros > 0 &&
    Math.abs(stated - fromMacros) > Math.max(fromMacros * 0.15, 20);
  const canLog = c.name.trim() && (stated !== null || fromMacros > 0);

  const log = () => {
    onLog({ name: c.name.trim(), venue: 'Custom', kcal: stated ?? fromMacros, p: n0(c.p), c: n0(c.c), f: n0(c.f) });
    setC({ name: '', kcal: '', p: '', c: '', f: '' });
  };

  return (
    <div className="custom-add">
      <button type="button" className="toggle press" onClick={onToggle} aria-expanded={open}>
        {open ? '− Hide custom food' : "+ Can't find it? Quick add a custom food"}
      </button>
      {open && (
        <div>
          <div className="custom-grid">
            <input className="full" placeholder="Food name" value={c.name} onChange={set('name')} />
            <input className="num-in" placeholder="Calories (or leave blank)" inputMode="numeric" value={c.kcal} onChange={set('kcal')} />
            <input className="num-in" placeholder="Protein g" inputMode="numeric" value={c.p} onChange={set('p')} />
            <input className="num-in" placeholder="Carbs g" inputMode="numeric" value={c.c} onChange={set('c')} />
            <input className="num-in" placeholder="Fat g" inputMode="numeric" value={c.f} onChange={set('f')} />
          </div>
          {mismatch ? (
            <div className="custom-note warn">
              Heads up: {c.p || 0}P + {c.c || 0}C + {c.f || 0}F works out to ~{fromMacros} cal, not {stated}.
              Leave calories blank to auto-calculate from the macros.
            </div>
          ) : fromMacros > 0 && stated === null ? (
            <div className="custom-note ok">
              Calories auto-calculated: {n0(c.p)}×4 + {n0(c.c)}×4 + {n0(c.f)}×9 = {fromMacros} cal.
            </div>
          ) : null}
          <button type="button" className="custom-log press" disabled={!canLog} onClick={log}>
            Log it
          </button>
        </div>
      )}
    </div>
  );
}
