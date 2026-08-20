import { create } from 'zustand';
import { Node, Edge, Connection } from '@xyflow/react';

export type AgentType = 'analyzer' | 'summarizer' | 'validator';
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentData {
  label: string;
  type: AgentType;
  status: AgentStatus;
  config: Record<string, any>;
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
  
  // UI state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'logs' | 'reasoning' | 'output';
  
  // Actions
  setNodes: (nodes: Node<AgentData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<AgentData>) => void;
  updateNode: (id: string, data: Partial<AgentData>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  onConnect: (connection: Connection) => void;
  
  // Execution actions
  setExecuting: (isExecuting: boolean) => void;
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
  addReasoningStep: (step: Omit<ReasoningStep, 'id' | 'timestamp'>) => void;
  setOutputPreview: (output: string) => void;
  clearExecution: () => void;
  
  // UI actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'logs' | 'reasoning' | 'output') => void;
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
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelTab: 'logs',
  
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
  setRightPanelTab: (tab) => set({ rightPanelTab: tab })
}));