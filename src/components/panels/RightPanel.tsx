'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Brain, FileText, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExecutionLog, ReasoningStep } from '@/lib/store';

interface RightPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  logs?: ExecutionLog[];
  reasoningSteps?: ReasoningStep[];
  outputPreview?: string;
}

const tabConfig = [
  { id: 'logs' as const, label: 'Logs', icon: Terminal },
  { id: 'reasoning' as const, label: 'Reasoning', icon: Brain },
  { id: 'output' as const, label: 'Output', icon: FileText },
];

type TabType = 'logs' | 'reasoning' | 'output';

export default function RightPanel({
  isOpen = true,
  onClose,
  logs = [],
  reasoningSteps = [],
  outputPreview = '',
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('logs');

  if (!isOpen) {
    return (
      <motion.button
        onClick={onClose}
        className="fixed right-0 top-1/2 -translate-y-1/2 p-2 bg-background-tertiary border border-glass-border rounded-l-lg glass"
        whileHover={{ x: -4 }}
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-96 h-full glass border-l border-glass-border flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Execution Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-900 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-lg">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1",
                  activeTab === tab.id
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto custom-scrollbar p-4 space-y-2"
            >
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No execution logs yet</p>
                  <p className="text-sm mt-1">Run the workflow to see logs</p>
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      log.level === 'error' && "bg-red-500/10 border-red-500/20 text-red-400",
                      log.level === 'warning' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                      log.level === 'success' && "bg-green-500/10 border-green-500/20 text-green-400",
                      log.level === 'info' && "bg-sky-500/10 border-sky-500/20 text-sky-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{log.level}</span>
                      <span className="text-xs opacity-70">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{log.message}</p>
                    {log.agentId && (
                      <span className="text-xs opacity-60 mt-1 block">
                        Agent: {log.agentId}
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'reasoning' && (
            <motion.div
              key="reasoning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto custom-scrollbar p-4 space-y-3"
            >
              {reasoningSteps.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reasoning steps yet</p>
                  <p className="text-sm mt-1">Agent reasoning will appear here</p>
                </div>
              ) : (
                reasoningSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6 pb-4 border-l-2 border-sky-500/30"
                  >
                    <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-sky-500 -translate-x-[7px]" />
                    <div className="text-xs text-gray-500 mb-1">
                      {step.timestamp.toLocaleTimeString()}
                    </div>
                    <p className="text-sm text-gray-300">{step.step}</p>
                    <span className="text-xs text-sky-400 mt-1 block">
                      {step.agentId}
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'output' && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto custom-scrollbar p-4"
            >
              {outputPreview ? (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {outputPreview}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No output yet</p>
                  <p className="text-sm mt-1">Final output will appear here</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}