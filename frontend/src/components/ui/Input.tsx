import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm 
          placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 
          focus:border-zinc-900 transition-all
          ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};
