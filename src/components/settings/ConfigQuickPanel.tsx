'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Settings, ChevronDown } from 'lucide-react';
import { useExecutionConfig } from '@/lib/config/hooks';
import { cn } from '@/lib/utils';

interface ConfigQuickPanelProps {
  className?: string;
}

export default function ConfigQuickPanel({ className }: ConfigQuickPanelProps) {
  const { errors, warnings, isDirty, isValid } = useExecutionConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification when there are errors or warnings
    if (errors.length > 0 || warnings.length > 0) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors, warnings]);

  if (errors.length === 0 && warnings.length === 0 && !isDirty) {
    return null;
  }

  return (
    <>
      {/* Notification */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={cn(
              'fixed top-20 right-6 z-40 p-4 rounded-lg shadow-lg max-w-md',
              errors.length > 0 
                ? 'bg-red-500/10 border border-red-500/30' 
                : 'bg-yellow-500/10 border border-yellow-500/30',
              className
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn(
                'w-5 h-5 mt-0.5 flex-shrink-0',
                errors.length > 0 ? 'text-red-400' : 'text-yellow-400'
              )} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  {errors.length > 0 ? 'Configuration Errors' : 'Configuration Warnings'}
                </p>
                <p className="text-xs text-gray-400">
                  {errors.length > 0 
                    ? `${errors.length} error(s) need your attention`
                    : `${warnings.length} warning(s) may affect execution`}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Panel */}
      <motion.div
        className={cn(
          'fixed top-20 right-6 z-30 w-80 rounded-lg shadow-xl overflow-hidden',
          isOpen ? 'bg-gray-900 border border-gray-700' : '',
          className
        )}
        animate={{ height: isOpen ? 'auto' : 40 }}
      >
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-gray-900/90 hover:bg-gray-800 transition-colors border border-gray-700"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Configuration Status</span>
          </div>
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                {errors.length} Error{errors.length !== 1 ? 's' : ''}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </span>
            )}
            <ChevronDown 
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )} 
            />
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-700 bg-gray-900/95"
            >
              <div className="p-4 space-y-3">
                {/* Errors */}
                {errors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Errors
                    </h4>
                    <ul className="space-y-2">
                      {errors.map((error, i) => (
                        <li key={i} className="text-xs text-gray-300 bg-red-500/10 p-2 rounded border border-red-500/20">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Warnings
                    </h4>
                    <ul className="space-y-2">
                      {warnings.map((warning, i) => (
                        <li key={i} className="text-xs text-gray-300 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Configuration Status:</span>
                    <span className={cn(
                      'font-medium',
                      isValid ? 'text-green-400' : 'text-red-400'
                    )}>
                      {isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {isDirty && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-400">Changes:</span>
                      <span className="text-blue-400 font-medium">Unsaved</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <button
                  onClick={() => {
                    // This would trigger opening the settings modal
                    const event = new CustomEvent('open-settings');
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-2 px-4 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Open Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}