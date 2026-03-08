'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  actions?: React.ReactNode;
}

export function Panel({
  title,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
  onCollapse,
  actions
}: PanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  return (
    <div className={cn(
      'bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface/60">
        <div className="flex items-center space-x-2">
          {collapsible && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary"
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          )}
          <h3 className="text-text-primary font-medium text-sm uppercase tracking-wider">
            {title}
          </h3>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}