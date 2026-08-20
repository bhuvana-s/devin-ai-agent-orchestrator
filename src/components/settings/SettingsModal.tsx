'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, Check, AlertCircle, Settings2, Database, Cloud, Clock, RefreshCw, Download, Upload } from 'lucide-react';
import { useConfigStore } from '@/lib/config/store';
import { ExecutionMode } from '@/lib/config/types';
import { downloadConfig, readConfigFromFile } from '@/lib/config/utils';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    config,
    isDirty,
    validationErrors,
    validationWarnings,
    setMode,
    setSimulationConfig,
    setAWSConfig,
    setRetryConfig,
    setTimeoutConfig,
    resetToDefaults,
    validate,
    setConfig,
  } = useConfigStore();

  const [activeTab, setActiveTab] = useState<'general' | 'simulation' | 'aws' | 'advanced'>('general');
  const [localConfig, setLocalConfig] = useState(config);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const handleSave = () => {
    setMode(localConfig.mode);
    setSimulationConfig(localConfig.simulation);
    setAWSConfig(localConfig.aws);
    setRetryConfig(localConfig.retry);
    setTimeoutConfig(localConfig.timeout);
    validate();
    onClose();
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalConfig(config);
  };

  const handleExport = () => {
    downloadConfig(localConfig, `agent-config-${Date.now()}.json`);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedConfig = await readConfigFromFile(file);
        setLocalConfig(importedConfig);
      } catch (error) {
        console.error('Failed to import configuration:', error);
        alert('Failed to import configuration. Please check the file format.');
      }
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings2 },
    { id: 'simulation' as const, label: 'Simulation', icon: Database },
    { id: 'aws' as const, label: 'AWS Config', icon: Cloud },
    { id: 'advanced' as const, label: 'Advanced', icon: RefreshCw },
  ];

  if (!isOpen) return null;

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Execution Configuration</h2>
                <p className="text-sm text-gray-400">Configure execution settings and preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'text-white border-sky-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Validation Errors */}
            {(validationErrors.length > 0 || validationWarnings.length > 0) && (
              <div className="mb-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                {validationErrors.length > 0 && (
                  <div className="flex items-start gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Errors:</strong>
                      <ul className="mt-1 space-y-1">
                        {validationErrors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {validationWarnings.length > 0 && (
                  <div className="flex items-start gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Warnings:</strong>
                      <ul className="mt-1 space-y-1">
                        {validationWarnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'general' && <GeneralTab config={localConfig} onChange={setLocalConfig} />}
            {activeTab === 'simulation' && <SimulationTab config={localConfig} onChange={setLocalConfig} />}
            {activeTab === 'aws' && <AWSTab config={localConfig} onChange={setLocalConfig} />}
            {activeTab === 'advanced' && <AdvancedTab config={localConfig} onChange={setLocalConfig} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              <div className="h-6 w-px bg-gray-700" />
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={validationErrors.length > 0}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all',
                  validationErrors.length > 0
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90'
                )}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// General Tab Component
function GeneralTab({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Execution Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          {(['simulation', 'real'] as ExecutionMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onChange({ ...config, mode })}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                config.mode === mode
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                {mode === 'simulation' ? (
                  <Database className="w-5 h-5 text-sky-400" />
                ) : (
                  <Cloud className="w-5 h-5 text-purple-400" />
                )}
                <span className="font-medium text-white capitalize">{mode}</span>
              </div>
              <p className="text-sm text-gray-400">
                {mode === 'simulation'
                  ? 'Run workflow locally with simulated results'
                  : 'Execute workflow on real AWS infrastructure'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simulation Tab Component
function SimulationTab({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Execution Times (ms)</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(config.simulation.executionTimes).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                {key}
              </label>
              <input
                type="number"
                value={value as number}
                onChange={(e) => onChange({
                  ...config,
                  simulation: {
                    ...config.simulation,
                    executionTimes: {
                      ...config.simulation.executionTimes,
                      [key]: parseInt(e.target.value) || 0
                    }
                  }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Result Generation</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.simulation.resultGeneration.randomizeResults}
              onChange={(e) => onChange({
                ...config,
                simulation: {
                  ...config.simulation,
                  resultGeneration: {
                    ...config.simulation.resultGeneration,
                    randomizeResults: e.target.checked
                  }
                }
              })}
              className="w-4 h-4 rounded border-gray-600 text-sky-500 focus:ring-sky-500 bg-gray-800"
            />
            <span className="text-sm text-gray-300">Randomize Results</span>
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Patterns
              </label>
              <input
                type="number"
                value={config.simulation.resultGeneration.minPatterns}
                onChange={(e) => onChange({
                  ...config,
                  simulation: {
                    ...config.simulation,
                    resultGeneration: {
                      ...config.simulation.resultGeneration,
                      minPatterns: parseInt(e.target.value) || 0
                    }
                  }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Patterns
              </label>
              <input
                type="number"
                value={config.simulation.resultGeneration.maxPatterns}
                onChange={(e) => onChange({
                  ...config,
                  simulation: {
                    ...config.simulation,
                    resultGeneration: {
                      ...config.simulation.resultGeneration,
                      maxPatterns: parseInt(e.target.value) || 0
                    }
                  }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Error Simulation</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.simulation.errorSimulation.enabled}
              onChange={(e) => onChange({
                ...config,
                simulation: {
                  ...config.simulation,
                  errorSimulation: {
                    ...config.simulation.errorSimulation,
                    enabled: e.target.checked
                  }
                }
              })}
              className="w-4 h-4 rounded border-gray-600 text-sky-500 focus:ring-sky-500 bg-gray-800"
            />
            <span className="text-sm text-gray-300">Enable Error Simulation</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Error Rate (0-1)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={config.simulation.errorSimulation.errorRate}
              onChange={(e) => onChange({
                ...config,
                simulation: {
                  ...config.simulation,
                  errorSimulation: {
                    ...config.simulation.errorSimulation,
                    errorRate: parseFloat(e.target.value) || 0
                  }
                }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// AWS Tab Component
function AWSTab({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-sm text-yellow-400">
          <strong>Warning:</strong> AWS credentials will be stored locally in your browser. 
          In production, use secure credential management.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">AWS Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Region
            </label>
            <select
              value={config.aws.region}
              onChange={(e) => onChange({
                ...config,
                aws: { ...config.aws, region: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            >
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="us-east-2">us-east-2 (Ohio)</option>
              <option value="us-west-1">us-west-1 (N. California)</option>
              <option value="us-west-2">us-west-2 (Oregon)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
              <option value="ap-northeast-1">ap-northeast-1 (Tokyo)</option>
              <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Access Key ID
            </label>
            <input
              type="password"
              value={config.aws.accessKeyId}
              onChange={(e) => onChange({
                ...config,
                aws: { ...config.aws, accessKeyId: e.target.value }
              })}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Secret Access Key
            </label>
            <input
              type="password"
              value={config.aws.secretAccessKey}
              onChange={(e) => onChange({
                ...config,
                aws: { ...config.aws, secretAccessKey: e.target.value }
              })}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lambda Function Name (optional)
            </label>
            <input
              type="text"
              value={config.aws.lambdaFunctionName}
              onChange={(e) => onChange({
                ...config,
                aws: { ...config.aws, lambdaFunctionName: e.target.value }
              })}
              placeholder="my-agent-function"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Step Function ARN (optional)
            </label>
            <input
              type="text"
              value={config.aws.stepFunctionArn}
              onChange={(e) => onChange({
                ...config,
                aws: { ...config.aws, stepFunctionArn: e.target.value }
              })}
              placeholder="arn:aws:states:us-east-1:123456789012:stateMachine:MyWorkflow"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API URL (optional)
            </label>
            <input
              type="text"
              value={config.aws.apiUrl || ''}
              onChange={(e) => onChange({
                ...config,
                aws: { ...config.aws, apiUrl: e.target.value }
              })}
              placeholder="https://api.example.com/production/"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Advanced Tab Component
function AdvancedTab({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Retry Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Retries
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={config.retry.maxRetries}
              onChange={(e) => onChange({
                ...config,
                retry: { ...config.retry, maxRetries: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Retry Delay (ms)
            </label>
            <input
              type="number"
              min="0"
              value={config.retry.retryDelay}
              onChange={(e) => onChange({
                ...config,
                retry: { ...config.retry, retryDelay: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.retry.exponentialBackoff}
              onChange={(e) => onChange({
                ...config,
                retry: { ...config.retry, exponentialBackoff: e.target.checked }
              })}
              className="w-4 h-4 rounded border-gray-600 text-sky-500 focus:ring-sky-500 bg-gray-800"
            />
            <span className="text-sm text-gray-300">Exponential Backoff</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Backoff Multiplier
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={config.retry.backoffMultiplier}
              onChange={(e) => onChange({
                ...config,
                retry: { ...config.retry, backoffMultiplier: parseFloat(e.target.value) || 1 }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timeout Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Node Execution Timeout (ms)
            </label>
            <input
              type="number"
              min="1000"
              value={config.timeout.nodeExecution}
              onChange={(e) => onChange({
                ...config,
                timeout: { ...config.timeout, nodeExecution: parseInt(e.target.value) || 1000 }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Workflow Timeout (ms)
            </label>
            <input
              type="number"
              min="1000"
              value={config.timeout.totalWorkflow}
              onChange={(e) => onChange({
                ...config,
                timeout: { ...config.timeout, totalWorkflow: parseInt(e.target.value) || 1000 }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Request Timeout (ms)
            </label>
            <input
              type="number"
              min="1000"
              value={config.timeout.apiRequest}
              onChange={(e) => onChange({
                ...config,
                timeout: { ...config.timeout, apiRequest: parseInt(e.target.value) || 1000 }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}