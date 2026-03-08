'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  position = 'top',
  trigger = 'hover',
  delay = 300,
  children,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate optimal position based on viewport
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let optimalPosition = position;

    // Check if tooltip would overflow and adjust position
    switch (position) {
      case 'top':
        if (triggerRect.top - tooltipRect.height < 10) {
          optimalPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (triggerRect.bottom + tooltipRect.height > viewportHeight - 10) {
          optimalPosition = 'top';
        }
        break;
      case 'left':
        if (triggerRect.left - tooltipRect.width < 10) {
          optimalPosition = 'right';
        }
        break;
      case 'right':
        if (triggerRect.right + tooltipRect.width > viewportWidth - 10) {
          optimalPosition = 'left';
        }
        break;
    }

    setActualPosition(optimalPosition);
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  const getTooltipClasses = () => {
    const baseClasses = [
      'absolute z-50 px-3 py-2 text-sm',
      'bg-surface-elevated border border-border rounded-lg shadow-lg',
      'text-text-primary backdrop-blur-sm',
      'animate-fade-in',
      'max-w-xs break-words',
    ];

    const positionClasses = {
      top: [
        'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        'before:content-[""] before:absolute before:top-full before:left-1/2 before:transform before:-translate-x-1/2',
        'before:border-4 before:border-transparent before:border-t-surface-elevated',
      ],
      bottom: [
        'top-full left-1/2 transform -translate-x-1/2 mt-2',
        'before:content-[""] before:absolute before:bottom-full before:left-1/2 before:transform before:-translate-x-1/2',
        'before:border-4 before:border-transparent before:border-b-surface-elevated',
      ],
      left: [
        'right-full top-1/2 transform -translate-y-1/2 mr-2',
        'before:content-[""] before:absolute before:left-full before:top-1/2 before:transform before:-translate-y-1/2',
        'before:border-4 before:border-transparent before:border-l-surface-elevated',
      ],
      right: [
        'left-full top-1/2 transform -translate-y-1/2 ml-2',
        'before:content-[""] before:absolute before:right-full before:top-1/2 before:transform before:-translate-y-1/2',
        'before:border-4 before:border-transparent before:border-r-surface-elevated',
      ],
    };

    return cn(
      baseClasses,
      positionClasses[actualPosition],
      className
    );
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click-away on click trigger */}
          {trigger === 'click' && (
            <div
              className="fixed inset-0 z-40"
              onClick={hideTooltip}
            />
          )}
          
          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={getTooltipClasses()}
            role="tooltip"
          >
            {content}
          </div>
        </>
      )}
    </div>
  );
}

// Specialized tooltip variants

interface InfoTooltipProps {
  info: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoTooltip({ info, children, position = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip 
      content={info} 
      position={position}
      className="text-text-primary bg-surface border-border"
    >
      {children}
    </Tooltip>
  );
}

interface ErrorTooltipProps {
  error: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function ErrorTooltip({ error, children, position = 'top' }: ErrorTooltipProps) {
  return (
    <Tooltip 
      content={error} 
      position={position}
      className="text-red-300 bg-red-900/90 border-red-700"
    >
      {children}
    </Tooltip>
  );
}

interface WarningTooltipProps {
  warning: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function WarningTooltip({ warning, children, position = 'top' }: WarningTooltipProps) {
  return (
    <Tooltip 
      content={warning} 
      position={position}
      className="text-yellow-300 bg-yellow-900/90 border-yellow-700"
    >
      {children}
    </Tooltip>
  );
}

interface SuccessTooltipProps {
  success: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function SuccessTooltip({ success, children, position = 'top' }: SuccessTooltipProps) {
  return (
    <Tooltip 
      content={success} 
      position={position}
      className="text-green-300 bg-green-900/90 border-green-700"
    >
      {children}
    </Tooltip>
  );
}

interface DataTooltipProps {
  title?: string;
  data: Array<{ label: string; value: string | number }>;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function DataTooltip({ 
  title, 
  data, 
  children, 
  position = 'top' 
}: DataTooltipProps) {
  const content = (
    <div className="space-y-2">
      {title && (
        <div className="font-semibold text-text-primary border-b border-border pb-1">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between space-x-4">
            <span className="text-text-secondary">{item.label}:</span>
            <span className="text-text-primary font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Tooltip 
      content={content} 
      position={position}
      delay={500}
      className="min-w-32"
    >
      {children}
    </Tooltip>
  );
}