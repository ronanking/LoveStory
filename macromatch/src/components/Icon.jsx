// Inline SVG symbol sprite — no emoji-as-icons, per the design system.

export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5" /></symbol>
        <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4.5 4.5" /></symbol>
        <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3V4z" /><path d="M16 20h4V7a3 3 0 0 0-3-3" /></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></symbol>
        <symbol id="i-fork" viewBox="0 0 24 24"><path d="M7 2v8m-3-8v6a3 3 0 0 0 6 0V2M7 10v12" /><path d="M17 2c-2 2.5-2.5 6-2.5 8.5h5C19.5 8 19 4.5 17 2zM17 10.5V22" /></symbol>
        <symbol id="i-pen" viewBox="0 0 24 24"><path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5z" /></symbol>
        <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.6 1 2.5h6c0-.9.2-1.8 1-2.5A6 6 0 0 0 12 3z" /></symbol>
        <symbol id="i-calc" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" /></symbol>
      </defs>
    </svg>
  );
}

export function Icon({ id, sm, className = '', ...rest }) {
  return (
    <svg className={`icon${sm ? ' sm' : ''} ${className}`.trim()} aria-hidden="true" {...rest}>
      <use href={`#${id}`} />
    </svg>
  );
}
