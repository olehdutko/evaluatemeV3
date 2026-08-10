import React from 'react';

interface CardProps {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function Card({ children, accent = false, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`panel panel-hover ${className}`}>
      {accent && <div className="h-1 w-full bg-accent" />}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
