'use client';

import { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import AgentPalette from '@/components/panels/AgentPalette';
import FlowCanvas from '@/components/canvas/FlowCanvas';
import RightPanel from '@/components/panels/RightPanel';
import CustomAgentBuilder from '@/components/panels/CustomAgentBuilder';
import ConfigurationEditor from '@/components/panels/ConfigurationEditor';
import SettingsModal from '@/components/settings/SettingsModal';
import ConfigQuickPanel from '@/components/settings/ConfigQuickPanel';
import { useDashboardStore } from '@/lib/store';
import { useConfigStore } from '@/lib/config/store';
import { ExecutionService } from '@/lib/config/execution-service';

export default function Home() {
  const {
    isExecuting,
    executionLogs,
    reasoningSteps,
    outputPreview,
    leftPanelOpen,
    rightPanelOpen,
    rightPanelTab,
    customAgentTypes,
    setExecuting,
    addLog,
    addReasoningStep,
    setOutputPreview,
    toggleLeftPanel,
    toggleRightPanel,
    setRightPanelTab,
    clearExecution,
    addCustomAgentType,
    deleteCustomAgentType,
    updateNodeLabel,
    deleteNode,
    updateNodeConfig,
  } = useDashboardStore();

  const config = useConfigStore();
  const [currentNodes, setCurrentNodes] = useState<any[]>([]);
  const [currentEdges, setCurrentEdges] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showCustomAgentBuilder, setShowCustomAgentBuilder] = useState(false);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<any>(null);
  const [executionService, setExecutionService] = useState<ExecutionService | null>(null);

  // Initialize execution service when config changes
  useEffect(() => {
    setExecutionService(new ExecutionService(config.config));
  }, [config.config]);

  // Handle custom event to open settings from ConfigQuickPanel
  useEffect(() => {
    const handleOpenSettings = () => setSettingsOpen(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  const handleRun = useCallback(async () => {
    if (isExecuting) return;
    if (currentNodes.length === 0) {
      addLog({ level: 'warning', message: 'No agents to execute. Add some agents to the canvas first.' });
      return;
    }

    // Validate configuration before execution
    if (!config.validate()) {
      addLog({ level: 'error', message: 'Configuration validation failed. Please check your settings.' });
      return;
    }

    setExecuting(true);
    clearExecution();

    // Use execution service for workflow execution
    if (!executionService) {
      addLog({ level: 'error', message: 'Execution service not initialized' });
      setExecuting(false);
      return;
    }

    const handleProgress = (nodeId: string, status: 'running' | 'completed' | 'error') => {
      setCurrentNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, status } } : n
      ));
    };

    // Adapter function to match execution service log signature with store log signature
    const logAdapter = (level: 'info' | 'warning' | 'error' | 'success', message: string, agentId?: string) => {
      addLog({ level, message, agentId });
    };

    // Adapter function to match execution service reasoning signature with store reasoning signature
    const reasoningAdapter = (agentId: string, step: string) => {
      addReasoningStep({ agentId, step });
    };

    const result = await executionService.executeWorkflow(
      currentNodes,
      currentEdges,
      handleProgress,
      logAdapter,
      reasoningAdapter
    );

    // Set final output
    const totalExecutionTime = (result.totalExecutionTime / 1000).toFixed(1);
    
    setOutputPreview(`Workflow Execution ${result.success ? 'Complete' : 'Failed'}
===========================
Mode: ${config.config.mode.toUpperCase()}
Summary: ${result.success ? 'Successfully' : 'Failed to'} process ${currentNodes.length} agent(s)
${result.results.map(r => `- ${r.label} (${r.type}): ${r.success ? r.result : 'ERROR: ' + (r.error || 'Unknown error')}`).join('\n')}

Connections: ${currentEdges.length} active connections
Execution Time: ${totalExecutionTime}s
Status: ${result.success ? 'SUCCESS' : 'FAILED'}
Timestamp: ${new Date().toISOString()}`);

    setExecuting(false);
  }, [isExecuting, currentNodes, currentEdges, setExecuting, addLog, addReasoningStep, setOutputPreview, clearExecution, config, executionService]);

  const handleStop = useCallback(() => {
    setExecuting(false);
    addLog({ level: 'warning', message: 'Workflow execution stopped by user' });
  }, [setExecuting, addLog]);

  // Custom Agent Builder callbacks
  const handleOpenCustomAgentBuilder = useCallback(() => {
    setShowCustomAgentBuilder(true);
  }, []);

  const handleCloseCustomAgentBuilder = useCallback(() => {
    setShowCustomAgentBuilder(false);
  }, []);

  const handleSaveCustomAgent = useCallback((agentType: any) => {
    addCustomAgentType(agentType);
    addLog({ level: 'success', message: `Custom agent "${agentType.label}" created successfully` });
  }, [addCustomAgentType, addLog]);

  const handleDeleteCustomAgent = useCallback((id: string) => {
    deleteCustomAgentType(id);
    addLog({ level: 'info', message: 'Custom agent deleted' });
  }, [deleteCustomAgentType, addLog]);

  // Node operation callbacks
  const handleNodeRename = useCallback((nodeId: string, newLabel: string) => {
    updateNodeLabel(nodeId, newLabel);
    addLog({ level: 'info', message: `Node renamed to "${newLabel}"` });
  }, [updateNodeLabel, addLog]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    deleteNode(nodeId);
    addLog({ level: 'info', message: 'Node deleted' });
  }, [deleteNode, addLog]);

  const handleNodeEditConfig = useCallback((nodeId: string) => {
    const node = currentNodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNodeForConfig(node);
      setShowConfigEditor(true);
    }
  }, [currentNodes]);

  const handleSaveNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    updateNodeConfig(nodeId, config);
    addLog({ level: 'success', message: 'Node configuration updated' });
    setShowConfigEditor(false);
    setSelectedNodeForConfig(null);
  }, [updateNodeConfig, addLog]);

  const handleCloseConfigEditor = useCallback(() => {
    setShowConfigEditor(false);
    setSelectedNodeForConfig(null);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden" style={{ height: '100vh' }}>
      {/* Top Navbar */}
      <Navbar
        isExecuting={isExecuting}
        onRun={handleRun}
        onStop={handleStop}
        projectName="My AI Workflow"
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left Panel - Agent Palette */}
        {leftPanelOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <AgentPalette 
              onClose={toggleLeftPanel}
              onOpenBuilder={handleOpenCustomAgentBuilder}
              customAgentTypes={customAgentTypes}
              onDeleteCustomAgent={handleDeleteCustomAgent}
            />
          </motion.div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 relative" style={{ minHeight: 0, height: '100%' }}>
          <FlowCanvas 
            onNodesChange={setCurrentNodes}
            onEdgesChange={setCurrentEdges}
            externalNodes={currentNodes}
            onNodeRename={handleNodeRename}
            onNodeDelete={handleNodeDelete}
            onNodeEditConfig={handleNodeEditConfig}
            customAgentTypes={customAgentTypes}
          />
          
          {/* Floating toggle button for left panel */}
          {!leftPanelOpen && (
            <motion.button
              onClick={toggleLeftPanel}
              className="absolute left-4 top-4 p-2 bg-gray-900 border border-gray-700 rounded-lg glass"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Right Panel - Execution Details */}
        {rightPanelOpen && (
          <RightPanel
            isOpen={rightPanelOpen}
            onClose={toggleRightPanel}
            logs={executionLogs}
            reasoningSteps={reasoningSteps}
            outputPreview={outputPreview}
          />
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Custom Agent Builder Modal */}
      <CustomAgentBuilder
        isOpen={showCustomAgentBuilder}
        onClose={handleCloseCustomAgentBuilder}
        onSave={handleSaveCustomAgent}
      />

      {/* Configuration Editor Modal */}
      <ConfigurationEditor
        isOpen={showConfigEditor}
        onClose={handleCloseConfigEditor}
        nodeData={selectedNodeForConfig}
        customAgentTypes={customAgentTypes}
        onSave={handleSaveNodeConfig}
      />

      {/* Configuration Quick Panel */}
      <ConfigQuickPanel />
    </div>
  );
}