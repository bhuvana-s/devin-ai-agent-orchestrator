import { Play, Square, Rocket, Settings, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ExecutionModeToggle from '@/components/settings/ExecutionModeToggle';
import ConfigStatusIndicator from '@/components/settings/ConfigStatusIndicator';

interface NavbarProps {
  isExecuting: boolean;
  onRun: () => void;
  onStop: () => void;
  projectName?: string;
  onSettingsClick?: () => void;
}

export default function Navbar({ isExecuting, onRun, onStop, projectName = "My Agent Workflow", onSettingsClick }: NavbarProps) {
  return (
    <nav className="h-16 glass border-b border-glass-border flex items-center justify-between px-6 z-50">
      {/* Left section - Logo and project name */}
      <div className="flex items-center gap-4">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">AgentFlow</span>
        </motion.div>
        
        <div className="h-6 w-px bg-glass-border mx-2" />
        
        <motion.h1 
          className="text-lg font-medium text-gray-300"
          whileHover={{ color: '#fff' }}
        >
          {projectName}
        </motion.h1>
      </div>

      {/* Center section - Run controls */}
      <div className="flex items-center gap-4">
        <ExecutionModeToggle />
        
        <motion.button
          onClick={isExecuting ? onStop : onRun}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200",
            isExecuting 
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30" 
              : "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90 shadow-glow"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExecuting ? (
            <>
              <Square className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Workflow
            </>
          )}
        </motion.button>

        <motion.button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Rocket className="w-4 h-4" />
          Deploy
        </motion.button>
      </div>

      {/* Right section - Status and user */}
      <div className="flex items-center gap-4">
        {/* Configuration status */}
        <ConfigStatusIndicator />
        
        {/* Deployment status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-400">System Ready</span>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Settings */}
        <motion.button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-gray-900 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </motion.button>

        {/* User */}
        <motion.button
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-900 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </motion.button>
      </div>
    </nav>
  );
}