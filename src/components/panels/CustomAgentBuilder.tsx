'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Brain, Cpu, Zap, Database, Globe, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomAgentType, ConfigField } from '@/lib/store';

interface CustomAgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentType: CustomAgentType) => void;
}

const iconOptions = [
  { name: 'Brain', icon: Brain, color: 'text-sky-400', gradient: 'from-sky-500/20 to-sky-600/10' },
  { name: 'Cpu', icon: Cpu, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10' },
  { name: 'Zap', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/10' },
  { name: 'Database', icon: Database, color: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10' },
  { name: 'Globe', icon: Globe, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Code', icon: Code, color: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10' },
  { name: 'Sparkles', icon: Sparkles, color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10' },
];

const colorOptions = [
  { name: 'Sky', color: 'text-sky-400', gradient: 'from-sky-500/20 to-sky-600/10' },
  { name: 'Purple', color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10' },
  { name: 'Green', color: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10' },
  { name: 'Orange', color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10' },
  { name: 'Pink', color: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10' },
  { name: 'Yellow', color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/10' },
];

const fieldTypes = ['text', 'number', 'boolean', 'select'] as const;

export default function CustomAgentBuilder({ isOpen, onClose, onSave }: CustomAgentBuilderProps) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [configFields, setConfigFields] = useState<ConfigField[]>([]);
  const [executionParams, setExecutionParams] = useState<Record<string, any>>({});

  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<typeof fieldTypes[number]>('text');
  const [newFieldDefaultValue, setNewFieldDefaultValue] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  const resetForm = () => {
    setName('');
    setLabel('');
    setSelectedIcon(iconOptions[0]);
    setSelectedColor(colorOptions[0]);
    setConfigFields([]);
    setExecutionParams({});
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldDefaultValue('');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setNewParamKey('');
    setNewParamValue('');
  };

  const handleAddConfigField = () => {
    if (!newFieldKey || !newFieldLabel) return;

    const field: ConfigField = {
      key: newFieldKey,
      label: newFieldLabel,
      type: newFieldType,
      defaultValue: newFieldType === 'boolean' ? newFieldRequired : newFieldDefaultValue,
      required: newFieldRequired,
      options: newFieldType === 'select' ? newFieldOptions.split(',').map(o => o.trim()) : undefined,
    };

    setConfigFields([...configFields, field]);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldDefaultValue('');
    setNewFieldRequired(false);
    setNewFieldOptions('');
  };

  const handleRemoveConfigField = (index: number) => {
    setConfigFields(configFields.filter((_, i) => i !== index));
  };

  const handleAddExecutionParam = () => {
    if (!newParamKey || !newParamValue) return;

    setExecutionParams({
      ...executionParams,
      [newParamKey]: newParamValue
    });
    setNewParamKey('');
    setNewParamValue('');
  };

  const handleRemoveExecutionParam = (key: string) => {
    const newParams = { ...executionParams };
    delete newParams[key];
    setExecutionParams(newParams);
  };

  const handleSave = () => {
    if (!name || !label) return;

    const customAgent: CustomAgentType = {
      id: `custom-${Date.now()}`,
      name,
      label,
      icon: selectedIcon.name,
      color: selectedColor.color,
      gradient: selectedColor.gradient,
      configFields,
      executionParams,
    };

    onSave(customAgent);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = selectedIcon.icon;

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
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Create Custom Agent</h2>
              <p className="text-gray-400 text-sm">Define a new agent type with custom configuration</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MyCustomAnalyzer"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., My Custom Analyzer"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Icon
              </label>
              <div className="grid grid-cols-7 gap-2">
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.name}
                      onClick={() => setSelectedIcon(option)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all",
                        selectedIcon.name === option.name
                          ? "border-sky-500 bg-sky-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", option.color)} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Color Theme
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => setSelectedColor(option)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      selectedColor.name === option.name
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className={cn("w-6 h-6 rounded-full bg-gradient-to-br", option.gradient)} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Configuration Fields</h3>
              <span className="text-sm text-gray-400">{configFields.length} fields</span>
            </div>

            <div className="space-y-2 mb-3">
              {configFields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{field.label}</span>
                      <span className="text-xs text-gray-500">({field.key})</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          required
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Default: {String(field.defaultValue)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveConfigField(index)}
                    className="p-1 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder="Field key (e.g., model)"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field label (e.g., AI Model)"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as typeof fieldTypes[number])}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={newFieldDefaultValue}
                  onChange={(e) => setNewFieldDefaultValue(e.target.value)}
                  placeholder="Default value"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              {newFieldType === 'select' && (
                <input
                  type="text"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Options (comma-separated)"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500"
                />
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="required" className="text-sm text-gray-300">
                  Required field
                </label>
              </div>

              <button
                onClick={handleAddConfigField}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Configuration Field
              </button>
            </div>
          </div>

          {/* Execution Parameters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Execution Parameters</h3>
              <span className="text-sm text-gray-400">{Object.keys(executionParams).length} params</span>
            </div>

            <div className="space-y-2 mb-3">
              {Object.entries(executionParams).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                >
                  <div>
                    <span className="font-medium text-white">{key}</span>
                    <span className="text-gray-500 ml-2">: {String(value)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveExecutionParam(key)}
                    className="p-1 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newParamKey}
                  onChange={(e) => setNewParamKey(e.target.value)}
                  placeholder="Parameter key (e.g., timeout)"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={newParamValue}
                  onChange={(e) => setNewParamValue(e.target.value)}
                  placeholder="Parameter value (e.g., 30)"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              
              <button
                onClick={handleAddExecutionParam}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Execution Parameter
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
            <div className="glass-node p-4 rounded-xl border-2 border-gray-700 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-lg bg-gray-900", selectedColor.color)}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-semibold text-white">{label || 'Agent Label'}</span>
              </div>
              <div className="text-xs text-gray-400">
                {configFields.length} configuration fields • {Object.keys(executionParams).length} execution params
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name || !label}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                !name || !label
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:from-sky-600 hover:to-purple-600"
              )}
            >
              Create Custom Agent
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}