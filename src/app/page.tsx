'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import AgentPalette from '@/components/panels/AgentPalette';
import FlowCanvas from '@/components/canvas/FlowCanvas';
import RightPanel from '@/components/panels/RightPanel';
import { useDashboardStore } from '@/lib/store';

export default function Home() {
  const {
    isExecuting,
    executionLogs,
    reasoningSteps,
    outputPreview,
    leftPanelOpen,
    rightPanelOpen,
    rightPanelTab,
    setExecuting,
    addLog,
    addReasoningStep,
    setOutputPreview,
    toggleLeftPanel,
    toggleRightPanel,
    setRightPanelTab,
    clearExecution,
  } = useDashboardStore();

  const [currentNodes, setCurrentNodes] = useState<any[]>([]);
  const [currentEdges, setCurrentEdges] = useState<any[]>([]);

  const handleRun = useCallback(async () => {
    if (isExecuting) return;
    if (currentNodes.length === 0) {
      addLog({ level: 'warning', message: 'No agents to execute. Add some agents to the canvas first.' });
      return;
    }

    setExecuting(true);
    clearExecution();

    // Simulate workflow execution
    addLog({ level: 'info', message: `Starting workflow execution with ${currentNodes.length} agent(s)...` });

    const executionResults: any[] = [];

    // Execute each node
    for (let i = 0; i < currentNodes.length; i++) {
      const node = currentNodes[i];
      const nodeType = node.data.type;
      const nodeId = node.id;
      const nodeLabel = node.data.label;

      // Update node status to running
      setCurrentNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' as const } } : n
      ));

      addLog({ level: 'info', message: `${nodeLabel}: Starting execution...`, agentId: nodeId });

      // Simulate different execution times based on agent type
      const executionTime = nodeType === 'analyzer' ? 1500 : nodeType === 'summarizer' ? 1200 : 1000;
      
      // Add reasoning step based on agent type
      switch (nodeType) {
        case 'analyzer':
          addReasoningStep({ agentId: nodeId, step: 'Analyzing input patterns and extracting key features...' });
          break;
        case 'summarizer':
          addReasoningStep({ agentId: nodeId, step: 'Condensing analyzed data into concise format...' });
          break;
        case 'validator':
          addReasoningStep({ agentId: nodeId, step: 'Checking against quality standards and validation rules...' });
          break;
      }

      await new Promise(resolve => setTimeout(resolve, executionTime));

      // Add result based on agent type
      let result = '';
      switch (nodeType) {
        case 'analyzer':
          result = `Extracted ${Math.floor(Math.random() * 20) + 5} key patterns from input data`;
          break;
        case 'summarizer':
          result = `Generated ${Math.floor(Math.random() * 300) + 200}-character summary`;
          break;
        case 'validator':
          result = `All quality checks passed (strictness: ${node.data.config.strictness || 'medium'})`;
          break;
      }

      executionResults.push({
        nodeId,
        label: nodeLabel,
        type: nodeType,
        result
      });

      addLog({ level: 'success', message: `${nodeLabel}: ${result}`, agentId: nodeId });

      // Update node status to completed
      setCurrentNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, status: 'completed' as const } } : n
      ));
    }

    // Set final output
    const totalExecutionTime = executionResults.reduce((acc, _) => acc + 1.2, 0).toFixed(1);
    
    setOutputPreview(`Workflow Execution Complete
===========================
Summary: Successfully processed ${currentNodes.length} agent(s)
${executionResults.map(r => `- ${r.label} (${r.type}): ${r.result}`).join('\n')}

Connections: ${currentEdges.length} active connections
Execution Time: ${totalExecutionTime}s
Status: SUCCESS
Timestamp: ${new Date().toISOString()}`);

    addLog({ level: 'success', message: 'Workflow execution completed successfully!' });
    setExecuting(false);
  }, [isExecuting, currentNodes, currentEdges, setExecuting, addLog, addReasoningStep, setOutputPreview, clearExecution]);

  const handleStop = useCallback(() => {
    setExecuting(false);
    addLog({ level: 'warning', message: 'Workflow execution stopped by user' });
  }, [setExecuting, addLog]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden" style={{ height: '100vh' }}>
      {/* Top Navbar */}
      <Navbar
        isExecuting={isExecuting}
        onRun={handleRun}
        onStop={handleStop}
        projectName="My AI Workflow"
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
            <AgentPalette onClose={toggleLeftPanel} />
          </motion.div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 relative" style={{ minHeight: 0, height: '100%' }}>
          <FlowCanvas 
            onNodesChange={setCurrentNodes}
            onEdgesChange={setCurrentEdges}
            externalNodes={currentNodes}
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
    </div>
  );
}