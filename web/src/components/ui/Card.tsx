'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
}

export function Card({ 
  variant = 'default',
  size = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg transition-colors',
        
        // Variants
        variant === 'default' && 'glass-panel',
        variant === 'elevated' && 'glass-panel-elevated shadow-lg',
        variant === 'outlined' && 'border-2 border-border bg-transparent',
        
        // Sizes
        size === 'sm' && 'p-3',
        size === 'md' && 'p-4',
        size === 'lg' && 'p-6',
        
        // Hover effect
        hover && 'hover:bg-surface-elevated/50 cursor-pointer',
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Title component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ 
  as: Component = 'h3',
  className, 
  children, 
  ...props 
}: CardTitleProps) {
  return (
    <Component
      className={cn('font-semibold leading-none tracking-tight text-text-primary', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card Description component
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Card Content component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}

// Card Footer component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div 
      className={cn('flex items-center pt-4', className)} 
      {...props}
    >
      {children}
    </div>
  );
}