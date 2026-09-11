import React from 'react';

export default function Logo({ size = 'medium', dark = false }) {
  const isSmall = size === 'small';

  return (
    <div className={`logo-container ${isSmall ? 'logo-sm' : ''}`}>
      {/* SVG Icon 'dI' */}
      <svg
        width={isSmall ? '32' : '44'}
        height={isSmall ? '32' : '44'}
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-mark"
      >
        {/* Left cyan swoosh */}
        <path
          d="M10 24C10 16.268 16.268 10 24 10V28C24 35.732 17.732 42 10 42H8C8 32.059 10 24 10 24Z"
          fill="#00D2B4"
        />
        {/* Left vertical bar */}
        <path
          d="M24 6V36C24 40.418 20.418 44 16 44C11.582 44 8 40.418 8 36V26"
          stroke="#00D2B4"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Right green vertical bar */}
        <path
          d="M38 10V38C38 42.418 34.418 46 30 46C25.582 46 22 42.418 22 38V18"
          stroke="#005B48"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Text */}
      <div className={`logo-text ${dark ? 'text-white' : ''}`}>
        <span className="brand-line">DATA</span>
        <span className="brand-line">INTEGRASI</span>
        <span className="brand-line">INOVASI</span>
      </div>
    </div>
  );
}
