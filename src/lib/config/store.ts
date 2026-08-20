import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExecutionConfig, ConfigChangeEvent } from './types';
import { DEFAULT_EXECUTION_CONFIG, CONFIG_PRESETS } from './defaults';
import { validateExecutionConfig, sanitizeConfig } from './validation';

interface ConfigState {
  config: ExecutionConfig;
  isDirty: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  history: ConfigChangeEvent[];
  
  // Actions
  setConfig: (config: Partial<ExecutionConfig>) => void;
  setMode: (mode: 'simulation' | 'real') => void;
  setSimulationConfig: (config: Partial<ExecutionConfig['simulation']>) => void;
  setAWSConfig: (config: Partial<ExecutionConfig['aws']>) => void;
  setRetryConfig: (config: Partial<ExecutionConfig['retry']>) => void;
  setTimeoutConfig: (config: Partial<ExecutionConfig['timeout']>) => void;
  applyPreset: (presetName: keyof typeof CONFIG_PRESETS) => void;
  resetToDefaults: () => void;
  validate: () => boolean;
  getSanitizedConfig: () => Partial<ExecutionConfig>;
  clearHistory: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_EXECUTION_CONFIG,
      isDirty: false,
      validationErrors: [],
      validationWarnings: [],
      history: [],

      setConfig: (partialConfig) => {
        const currentConfig = get().config;
        const newConfig = { ...currentConfig, ...partialConfig };
        
        // Validate new configuration
        const validation = validateExecutionConfig(newConfig);
        
        // Add to history
        const changeEvent: ConfigChangeEvent = {
          type: 'full',
          oldValue: currentConfig,
          newValue: newConfig,
          timestamp: new Date(),
        };
        
        set({
          config: newConfig,
          isDirty: true,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          history: [...get().history, changeEvent].slice(-50), // Keep last 50 changes
        });
      },

      setMode: (mode) => {
        const currentConfig = get().config;
        const newConfig = { ...currentConfig, mode };
        
        const validation = validateExecutionConfig(newConfig);
        
        const changeEvent: ConfigChangeEvent = {
          type: 'mode',
          oldValue: currentConfig.mode,
          newValue: mode,
          timestamp: new Date(),
        };
        
        set({
          config: newConfig,
          isDirty: true,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          history: [...get().history, changeEvent].slice(-50),
        });
      },

      setSimulationConfig: (simConfig) => {
        const currentConfig = get().config;
        const newSimulationConfig = { ...currentConfig.simulation, ...simConfig };
        const newConfig = { ...currentConfig, simulation: newSimulationConfig };
        
        const validation = validateExecutionConfig({ simulation: newSimulationConfig });
        
        const changeEvent: ConfigChangeEvent = {
          type: 'simulation',
          oldValue: currentConfig.simulation,
          newValue: newSimulationConfig,
          timestamp: new Date(),
        };
        
        set({
          config: newConfig,
          isDirty: true,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          history: [...get().history, changeEvent].slice(-50),
        });
      },

      setAWSConfig: (awsConfig) => {
        const currentConfig = get().config;
        const newAWSConfig = { ...currentConfig.aws, ...awsConfig };
        const newConfig = { ...currentConfig, aws: newAWSConfig };
        
        const validation = validateExecutionConfig({ 
          aws: newAWSConfig, 
          mode: newConfig.mode 
        });
        
        const changeEvent: ConfigChangeEvent = {
          type: 'aws',
          oldValue: currentConfig.aws,
          newValue: newAWSConfig,
          timestamp: new Date(),
        };
        
        set({
          config: newConfig,
          isDirty: true,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          history: [...get().history, changeEvent].slice(-50),
        });
      },

      setRetryConfig: (retryConfig) => {
        const currentConfig = get().config;
        const newRetryConfig = { ...currentConfig.retry, ...retryConfig };
        const newConfig = { ...currentConfig, retry: newRetryConfig };
        
        const validation = validateExecutionConfig({ retry: newRetryConfig });
        
        const changeEvent: ConfigChangeEvent = {
          type: 'retry',
          oldValue: currentConfig.retry,
          newValue: newRetryConfig,
          timestamp: new Date(),
        };
        
        set({
          config: newConfig,
          isDirty: true,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          history: [...get().history, changeEvent].slice(-50),
        });
      },

      setTimeoutConfig: (timeoutConfig) => {
        const currentConfig = get().config;
        const newTimeoutConfig = { ...currentConfig.timeout, ...timeoutConfig };
        const newConfig = { ...currentConfig, timeout: newTimeoutConfig };
        
        const validation = validateExecutionConfig({ timeout: newTimeoutConfig });
        
        const changeEvent: ConfigChangeEvent = {
          type: 'timeout',
          oldValue: currentConfig.timeout,
          newValue: newTimeoutConfig,
          timestamp: new Date(),
        };
        
        set({
          config: newConfig,
          isDirty: true,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          history: [...get().history, changeEvent].slice(-50),
        });
      },

      applyPreset: (presetName) => {
        const preset = CONFIG_PRESETS[presetName];
        if (preset) {
          const currentConfig = get().config;
          
          const changeEvent: ConfigChangeEvent = {
            type: 'full',
            oldValue: currentConfig,
            newValue: preset,
            timestamp: new Date(),
          };
          
          set({
            config: preset,
            isDirty: true,
            validationErrors: [],
            validationWarnings: [],
            history: [...get().history, changeEvent].slice(-50),
          });
        }
      },

      resetToDefaults: () => {
        const currentConfig = get().config;
        
        const changeEvent: ConfigChangeEvent = {
          type: 'full',
          oldValue: currentConfig,
          newValue: DEFAULT_EXECUTION_CONFIG,
          timestamp: new Date(),
        };
        
        set({
          config: DEFAULT_EXECUTION_CONFIG,
          isDirty: false,
          validationErrors: [],
          validationWarnings: [],
          history: [...get().history, changeEvent].slice(-50),
        });
      },

      validate: () => {
        const validation = validateExecutionConfig(get().config);
        set({
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
        });
        return validation.isValid;
      },

      getSanitizedConfig: () => {
        return sanitizeConfig(get().config);
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'execution-config-storage',
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);