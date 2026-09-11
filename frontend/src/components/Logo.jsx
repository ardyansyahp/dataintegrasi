import React from 'react';
import logoImg from '../assets/logo.png';

export default function Logo({ size = 'medium', className = '' }) {
  const isSmall = size === 'small';

  return (
    <div className={`logo-img-wrapper ${className}`}>
      <img
        src={logoImg}
        alt="Data Integrasi Inovasi Logo"
        style={{
          height: isSmall ? '36px' : '48px',
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
