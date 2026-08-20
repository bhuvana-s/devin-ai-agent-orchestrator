'use client';

import { Database, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfigStore } from '@/lib/config/store';
import { cn } from '@/lib/utils';

interface ExecutionModeToggleProps {
  className?: string;
}

export default function ExecutionModeToggle({ className }: ExecutionModeToggleProps) {
  const { config, setMode } = useConfigStore();
  const isSimulation = config.mode === 'simulation';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-gray-400">Mode:</span>
      <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-1">
        <button
          onClick={() => setMode('simulation')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            isSimulation
              ? 'bg-sky-500/20 text-sky-400'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <Database className="w-4 h-4" />
          Simulation
        </button>
        <button
          onClick={() => setMode('real')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            !isSimulation
              ? 'bg-purple-500/20 text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <Cloud className="w-4 h-4" />
          Real AWS
        </button>
      </div>
    </div>
  );
}