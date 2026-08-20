import { Brain, FileText, CheckCircle, Plus, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentType } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AgentBlockProps {
  type: AgentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  onDragStart?: (type: AgentType) => void;
}

const agentColors: Record<AgentType, { bg: string; border: string; icon: string }> = {
  analyzer: {
    bg: 'bg-sky-500/20',
    border: 'border-sky-500/30',
    icon: 'text-sky-400'
  },
  summarizer: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400'
  },
  validator: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400'
  }
};

function AgentBlock({ type, label, description, icon, onDragStart }: AgentBlockProps) {
  const colors = agentColors[type];

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
    if (onDragStart) {
      onDragStart(type);
    }
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "glass-card cursor-grab active:cursor-grabbing group",
        colors.bg, colors.border, "border"
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg bg-gray-900", colors.icon)}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white">{label}</h3>
            <GripVertical className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface AgentPaletteProps {
  onDragStart?: (type: AgentType) => void;
  onClose?: () => void;
}

export default function AgentPalette({ onDragStart, onClose }: AgentPaletteProps) {
  return (
    <div className="w-80 h-full glass border-r border-glass-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Agent Blocks</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-400 rotate-45" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Drag agents to the canvas to build your workflow
        </p>
      </div>

      {/* Agent blocks */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <AgentBlock
          type="analyzer"
          label="Analyzer"
          description="Analyze input data, extract patterns, and provide insights"
          icon={<Brain className="w-5 h-5" />}
          onDragStart={onDragStart}
        />
        
        <AgentBlock
          type="summarizer"
          label="Summarizer"
          description="Condense complex information into clear, concise summaries"
          icon={<FileText className="w-5 h-5" />}
          onDragStart={onDragStart}
        />
        
        <AgentBlock
          type="validator"
          label="Validator"
          description="Validate outputs against rules and quality standards"
          icon={<CheckCircle className="w-5 h-5" />}
          onDragStart={onDragStart}
        />
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          💡 Tip: Connect agents to create data pipelines
        </div>
      </div>
    </div>
  );
}