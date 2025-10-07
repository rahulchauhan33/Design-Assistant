import React from 'react';

export const MagicIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" />
    <path d="M5 3L6 5" />
    <path d="M19 3L18 5" />
    <path d="M5 21L6 19" />
    <path d="M19 21L18 19" />
  </svg>
);
