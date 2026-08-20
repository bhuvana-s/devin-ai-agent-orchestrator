'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentData, CustomAgentType, ConfigField } from '@/lib/store';

interface ConfigurationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: AgentData | null;
  customAgentTypes?: CustomAgentType[];
  onSave: (nodeId: string, config: Record<string, any>) => void;
}

export default function ConfigurationEditor({ 
  isOpen, 
  onClose, 
  nodeData, 
  customAgentTypes = [], 
  onSave 
}: ConfigurationEditorProps) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [customFields, setCustomFields] = useState<ConfigField[]>([]);

  // Update config when nodeData changes
  useEffect(() => {
    if (nodeData) {
      setConfig({ ...nodeData.config });
      
      // If it's a custom agent, load its config fields
      if (nodeData.type === 'custom' && nodeData.customTypeId) {
        const customAgent = customAgentTypes.find(type => type.id === nodeData.customTypeId);
        if (customAgent) {
          setCustomFields(customAgent.configFields);
        }
      } else {
        setCustomFields([]);
      }
    }
  }, [nodeData, customAgentTypes]);

  if (!isOpen || !nodeData) return null;

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddCustomField = () => {
    const key = `custom_field_${Object.keys(config).length + 1}`;
    setConfig(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleRemoveField = (key: string) => {
    const newConfig = { ...config };
    delete newConfig[key];
    setConfig(newConfig);
  };

  const handleSave = () => {
    if (nodeData) {
      onSave(nodeData.id || '', config);
    }
    onClose();
  };

  const renderFieldInput = (key: string, value: any, fieldDef?: ConfigField) => {
    if (fieldDef) {
      // Render based on field definition from custom agent
      switch (fieldDef.type) {
        case 'boolean':
          return (
            <select
              value={String(value)}
              onChange={(e) => handleConfigChange(key, e.target.value === 'true')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          );
        case 'select':
          return (
            <select
              value={String(value)}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
            >
              {fieldDef.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        case 'number':
          return (
            <input
              type="number"
              value={String(value)}
              onChange={(e) => handleConfigChange(key, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
            />
          );
        default:
          return (
            <input
              type="text"
              value={String(value)}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
            />
          );
      }
    }

    // Auto-detect type for standard agents
    const valueType = typeof value;
    if (valueType === 'boolean') {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleConfigChange(key, e.target.value === 'true')}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    } else if (valueType === 'number') {
      return (
        <input
          type="number"
          value={String(value)}
          onChange={(e) => handleConfigChange(key, parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
        />
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Configuration Editor</h2>
              <p className="text-gray-400 text-sm">
                Editing: <span className="text-sky-400 font-medium">{nodeData.label}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Agent Type Info */}
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Agent Type</span>
                <p className="text-white font-medium capitalize">{nodeData.type}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                <p className="text-white font-medium capitalize">{nodeData.status}</p>
              </div>
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Configuration</h3>
            
            {Object.keys(config).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No configuration fields</p>
                <p className="text-sm mt-1">Add custom fields to configure this agent</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(config).map(([key, value]) => {
                  const fieldDef = customFields.find(f => f.key === key);
                  return (
                    <div
                      key={key}
                      className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">
                          {fieldDef?.label || key}
                          {fieldDef?.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        <button
                          onClick={() => handleRemoveField(key)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                      {renderFieldInput(key, value, fieldDef)}
                      {fieldDef && (
                        <p className="text-xs text-gray-500">
                          Type: {fieldDef.type} {fieldDef.required && '• Required'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Custom Field Button */}
            <button
              onClick={handleAddCustomField}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-700 hover:border-sky-500 rounded-lg transition-colors text-gray-400 hover:text-sky-400 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Custom Field
            </button>
          </div>

          {/* JSON Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">JSON Preview</h3>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-lg transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}