import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl shadow-card p-6 border border-muted/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
