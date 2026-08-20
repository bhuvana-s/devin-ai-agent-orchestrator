import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Brain, FileText, CheckCircle, MoreVertical, Edit2, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentData, AgentType, CustomAgentType } from '@/lib/store';
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
  },
  custom: {
    icon: <Brain className="w-5 h-5" />,
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-orange-600/10'
  }
};

const statusConfig = {
  idle: { color: 'bg-gray-500', label: 'Idle' },
  running: { color: 'bg-blue-500 animate-pulse', label: 'Running' },
  completed: { color: 'bg-green-500', label: 'Completed' },
  error: { color: 'bg-red-500', label: 'Error' }
};

interface AgentNodeProps extends NodeProps<AgentData> {
  onRename?: (id: string, newLabel: string) => void;
  onDelete?: (id: string) => void;
  onEditConfig?: (id: string) => void;
  customAgentTypes?: CustomAgentType[];
}

function AgentNode({ data, selected, id, onRename, onDelete, onEditConfig, customAgentTypes }: AgentNodeProps) {
  const config = agentConfig[data.type];
  const status = statusConfig[data.status];
  
  // Handle custom agent config
  const customAgentConfig = data.type === 'custom' && data.customTypeId 
    ? customAgentTypes?.find(type => type.id === data.customTypeId)
    : null;
  
  const effectiveConfig = customAgentConfig || config;
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update edit label when data.label changes
  useEffect(() => {
    setEditLabel(data.label);
  }, [data.label]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleLabelSubmit = () => {
    if (editLabel.trim() && editLabel !== data.label && onRename) {
      onRename(id, editLabel.trim());
    }
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setEditLabel(data.label);
      setIsEditing(false);
    }
  };

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
      onDoubleClick={handleDoubleClick}
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
        effectiveConfig.gradient
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg bg-gray-900", effectiveConfig.color)}>
              {effectiveConfig.icon}
            </div>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={handleLabelKeyDown}
                onBlur={handleLabelSubmit}
                className="font-semibold text-white bg-gray-900 border border-sky-500 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="font-semibold text-white">{data.label}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 relative">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-900/50">
              <div className={cn("w-1.5 h-1.5 rounded-full", status.color)} />
              <span className="text-xs text-gray-400">{status.label}</span>
            </div>
            
            <button 
              className="p-1 rounded hover:bg-gray-900 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-8 w-40 glass-card rounded-lg shadow-xl z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Rename</span>
                    </button>
                    
                    {onEditConfig && (
                      <button
                        onClick={() => {
                          onEditConfig(id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Config</span>
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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