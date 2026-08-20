import { create } from 'zustand';
import { Node, Edge, Connection } from '@xyflow/react';

export type AgentType = 'analyzer' | 'summarizer' | 'validator' | 'custom';
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface CustomAgentType {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  configFields: ConfigField[];
  executionParams: Record<string, any>;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  defaultValue: any;
  options?: string[];
  required?: boolean;
}

export interface AgentData {
  label: string;
  type: AgentType;
  status: AgentStatus;
  config: Record<string, any>;
  customTypeId?: string;
  [key: string]: any; // Index signature for React Flow compatibility
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  agentId?: string;
}

export interface ReasoningStep {
  id: string;
  agentId: string;
  step: string;
  timestamp: Date;
}

export interface DashboardState {
  // Canvas state
  nodes: Node<AgentData>[];
  edges: Edge[];
  selectedNode: string | null;
  
  // Execution state
  isExecuting: boolean;
  executionLogs: ExecutionLog[];
  reasoningSteps: ReasoningStep[];
  outputPreview: string;
  
  // Custom agents state
  customAgentTypes: CustomAgentType[];
  
  // UI state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'logs' | 'reasoning' | 'output' | 'config';
  showCustomAgentBuilder: boolean;
  showConfigEditor: boolean;
  
  // Actions
  setNodes: (nodes: Node<AgentData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<AgentData>) => void;
  updateNode: (id: string, data: Partial<AgentData>) => void;
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeConfig: (id: string, config: Record<string, any>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  onConnect: (connection: Connection) => void;
  
  // Custom agent actions
  addCustomAgentType: (agentType: CustomAgentType) => void;
  updateCustomAgentType: (id: string, agentType: Partial<CustomAgentType>) => void;
  deleteCustomAgentType: (id: string) => void;
  
  // Execution actions
  setExecuting: (isExecuting: boolean) => void;
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
  addReasoningStep: (step: Omit<ReasoningStep, 'id' | 'timestamp'>) => void;
  setOutputPreview: (output: string) => void;
  clearExecution: () => void;
  
  // UI actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'logs' | 'reasoning' | 'output' | 'config') => void;
  setShowCustomAgentBuilder: (show: boolean) => void;
  setShowConfigEditor: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNode: null,
  isExecuting: false,
  executionLogs: [],
  reasoningSteps: [],
  outputPreview: '',
  customAgentTypes: [],
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelTab: 'logs',
  showCustomAgentBuilder: false,
  showConfigEditor: false,
  
  // Canvas actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),
  
  updateNodeLabel: (id, label) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, label } } : node
    )
  })),
  
  updateNodeConfig: (id, config) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, config } } : node
    )
  })),
  
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id)
  })),
  
  setSelectedNode: (id) => set({ selectedNode: id }),
  
  onConnect: (connection) => set((state) => ({
    edges: [...state.edges, { 
      ...connection, 
      id: `edge-${connection.source}-${connection.target}`,
      type: 'glowing',
      animated: true 
    }]
  })),
  
  // Custom agent actions
  addCustomAgentType: (agentType) => set((state) => ({
    customAgentTypes: [...state.customAgentTypes, agentType]
  })),
  
  updateCustomAgentType: (id, agentType) => set((state) => ({
    customAgentTypes: state.customAgentTypes.map((type) =>
      type.id === id ? { ...type, ...agentType } : type
    )
  })),
  
  deleteCustomAgentType: (id) => set((state) => ({
    customAgentTypes: state.customAgentTypes.filter((type) => type.id !== id)
  })),
  
  // Execution actions
  setExecuting: (isExecuting) => set({ isExecuting }),
  
  addLog: (log) => set((state) => ({
    executionLogs: [...state.executionLogs, {
      ...log,
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }]
  })),
  
  addReasoningStep: (step) => set((state) => ({
    reasoningSteps: [...state.reasoningSteps, {
      ...step,
      id: `step-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }]
  })),
  
  setOutputPreview: (output) => set({ outputPreview: output }),
  
  clearExecution: () => set({
    executionLogs: [],
    reasoningSteps: [],
    outputPreview: '',
    isExecuting: false
  }),
  
  // UI actions
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setShowCustomAgentBuilder: (show) => set({ showCustomAgentBuilder: show }),
  setShowConfigEditor: (show) => set({ showConfigEditor: show })
}));