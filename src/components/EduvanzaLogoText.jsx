import React from 'react';

/**
 * EduvanzaLogoText renders the official stylized EDUVANZA wordmark
 * featuring the magenta play button E and teal triangle A.
 */
export default function EduvanzaLogoText({ height = 24, style = {}, className = '' }) {
  return (
    <img
      src="/logo-text.png"
      alt="EDUVANZA"
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: 'auto',
        objectFit: 'contain',
        verticalAlign: 'middle',
        ...style
      }}
    />
  );
}
