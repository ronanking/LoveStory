import { Icon } from './Icon';

export function Toast({ toast }) {
  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      {toast && (
        <>
          <Icon id="i-check" sm />
          <span>{toast}</span>
        </>
      )}
    </div>
  );
}
