import React from 'react';

const Button = ({ children, className, onClick, type = 'button', href, variant = 'primary' }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-outline';
  const combinedClass = `${baseClass} ${className || ''}`;

  if (href) {
    return (
      <a href={href} className={combinedClass} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
