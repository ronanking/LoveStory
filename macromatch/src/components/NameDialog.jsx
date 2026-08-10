import { useEffect, useRef, useState } from 'react';

export function NameDialog({ open, name, onSave, onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(name === 'mate' ? '' : name);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, name]);

  if (!open) return null;
  const save = () => onSave(value.trim() || 'mate');

  return (
    <div className="mini-dialog open" role="dialog" aria-modal="true" aria-labelledby="nd-title">
      <div className="scrim" onClick={onClose} />
      <div className="mini-sheet">
        <h3 id="nd-title">What should we call you?</h3>
        <p>Kept on this device only — never sent anywhere.</p>
        <label htmlFor="name-input" style={{ position: 'absolute', left: -9999 }}>Your name</label>
        <input id="name-input" ref={inputRef} type="text" maxLength={20} autoComplete="given-name"
          placeholder="e.g. Ronan" value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()} />
        <div className="row">
          <button className="btn cancel press" type="button" onClick={onClose}>Cancel</button>
          <button className="btn save press" type="button" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
