'use client';

import { Database, Cloud, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useExecutionConfig } from '@/lib/config/hooks';
import { cn } from '@/lib/utils';

interface ConfigStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export default function ConfigStatusIndicator({ 
  className, 
  showLabel = true,
  compact = false 
}: ConfigStatusIndicatorProps) {
  const { mode, isValid, errors, warnings, isDirty } = useExecutionConfig();

  const getStatusColor = () => {
    if (!isValid) return 'text-red-400';
    if (warnings.length > 0) return 'text-yellow-400';
    if (isDirty) return 'text-blue-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (!isValid) return <AlertTriangle className="w-4 h-4" />;
    if (warnings.length > 0) return <AlertTriangle className="w-4 h-4" />;
    if (isDirty) return <Settings className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isValid) return 'Invalid Config';
    if (warnings.length > 0) return 'Config Warnings';
    if (isDirty) return 'Unsaved Changes';
    return 'Config Valid';
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {mode === 'simulation' ? (
          <Database className={cn('w-4 h-4', getStatusColor())} />
        ) : (
          <Cloud className={cn('w-4 h-4', getStatusColor())} />
        )}
        {getStatusIcon()}
      </div>
    );
  }

  return (
    <motion.div 
      className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700', className)}
      whileHover={{ scale: 1.02 }}
    >
      {mode === 'simulation' ? (
        <Database className="w-4 h-4 text-sky-400" />
      ) : (
        <Cloud className="w-4 h-4 text-purple-400" />
      )}
      
      {showLabel && (
        <span className="text-sm text-gray-300 capitalize">{mode}</span>
      )}
      
      <div className="h-4 w-px bg-gray-700" />
      
      <div className={cn('flex items-center gap-1.5', getStatusColor())}>
        {getStatusIcon()}
        {showLabel && (
          <span className="text-xs font-medium">{getStatusText()}</span>
        )}
      </div>
      
      {errors.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
      )}
    </motion.div>
  );
}