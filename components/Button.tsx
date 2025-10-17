
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
  const baseClasses = 'px-6 py-3 font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
