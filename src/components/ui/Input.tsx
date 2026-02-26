import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "input-premium flex h-11 w-full text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:ring-error/50 focus:border-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-xs text-error mt-1.5 ml-1 block animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
