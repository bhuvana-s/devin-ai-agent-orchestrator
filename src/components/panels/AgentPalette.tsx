import { Brain, FileText, CheckCircle, Plus, GripVertical, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentType, CustomAgentType } from '@/lib/store';
import { cn } from '@/lib/utils';
import { getCustomAgentIcon } from '@/lib/custom-agent-icons';

interface AgentBlockProps {
  type: AgentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  onDragStart?: (type: AgentType, customTypeId?: string) => void;
  customTypeId?: string;
  isCustom?: boolean;
  onDelete?: (id: string) => void;
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
  },
  custom: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    icon: 'text-orange-400'
  }
};

function AgentBlock({ type, label, description, icon, onDragStart, customTypeId, isCustom, onDelete }: AgentBlockProps) {
  const colors = isCustom 
    ? { bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: 'text-orange-400' }
    : agentColors[type];

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    if (customTypeId) {
      event.dataTransfer.setData('custom-agent-id', customTypeId);
    }
    event.dataTransfer.effectAllowed = 'move';
    if (onDragStart) {
      onDragStart(type, customTypeId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCustom && customTypeId && onDelete) {
      onDelete(customTypeId);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        className={cn(
          "glass-card cursor-grab active:cursor-grabbing group relative",
          colors.bg, colors.border, "border"
        )}
      >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg bg-gray-900", colors.icon)}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white">{label}</h3>
            <div className="flex items-center gap-1">
              {isCustom && onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 rounded hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              )}
              <GripVertical className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

interface AgentPaletteProps {
  onDragStart?: (type: AgentType, customTypeId?: string) => void;
  onClose?: () => void;
  onOpenBuilder?: () => void;
  customAgentTypes?: CustomAgentType[];
  onDeleteCustomAgent?: (id: string) => void;
}

export default function AgentPalette({ onDragStart, onClose, onOpenBuilder, customAgentTypes = [], onDeleteCustomAgent }: AgentPaletteProps) {
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
        {/* Standard Agents */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Standard Agents</h3>
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

        {/* Custom Agents */}
        {customAgentTypes.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Agents</h3>
            {customAgentTypes.map((customAgent) => {
              const CustomIcon = getCustomAgentIcon(customAgent.icon).icon;
              return (
                <AgentBlock
                  key={customAgent.id}
                  type="custom"
                  label={customAgent.label}
                  description={`Custom agent with ${customAgent.configFields.length} config fields`}
                  icon={<CustomIcon className="w-5 h-5" />}
                  onDragStart={onDragStart}
                  customTypeId={customAgent.id}
                  isCustom={true}
                  onDelete={onDeleteCustomAgent}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with builder button */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        {onOpenBuilder && (
          <button
            onClick={onOpenBuilder}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Create Custom Agent
          </button>
        )}
        <div className="text-xs text-gray-500 text-center">
          💡 Tip: Connect agents to create data pipelines
        </div>
      </div>
    </div>
  );
}