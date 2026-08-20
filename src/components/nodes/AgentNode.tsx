import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Brain, FileText, CheckCircle, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentData, AgentType } from '@/lib/store';
import { cn } from '@/lib/utils';

const agentConfig: Record<AgentType, { icon: React.ReactNode; color: string; gradient: string }> = {
  analyzer: {
    icon: <Brain className="w-5 h-5" />,
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-sky-600/10'
  },
  summarizer: {
    icon: <FileText className="w-5 h-5" />,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/10'
  },
  validator: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-green-600/10'
  }
};

const statusConfig = {
  idle: { color: 'bg-gray-500', label: 'Idle' },
  running: { color: 'bg-blue-500 animate-pulse', label: 'Running' },
  completed: { color: 'bg-green-500', label: 'Completed' },
  error: { color: 'bg-red-500', label: 'Error' }
};

function AgentNode({ data, selected }: NodeProps<AgentData>) {
  const config = agentConfig[data.type];
  const status = statusConfig[data.status];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass-node min-w-[220px] rounded-xl border-2 transition-all duration-200",
        selected ? "border-sky-500 shadow-glow-strong" : "border-gray-700 hover:border-sky-400",
        data.status === 'running' && "animate-pulse-slow"
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-sky-500 !border-2 !border-gray-950"
      />

      {/* Node content */}
      <div className={cn(
        "p-4 rounded-lg bg-gradient-to-br",
        config.gradient
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg bg-gray-900", config.color)}>
              {config.icon}
            </div>
            <span className="font-semibold text-white">{data.label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-900/50">
              <div className={cn("w-1.5 h-1.5 rounded-full", status.color)} />
              <span className="text-xs text-gray-400">{status.label}</span>
            </div>
            
            <button className="p-1 rounded hover:bg-gray-900 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Config preview */}
        {Object.keys(data.config).length > 0 && (
          <div className="space-y-2">
            {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 capitalize">{key}:</span>
                <span className="text-gray-300 font-medium truncate max-w-[100px]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-sky-500 !border-2 !border-gray-950"
      />
    </motion.div>
  );
}

export default memo(AgentNode);