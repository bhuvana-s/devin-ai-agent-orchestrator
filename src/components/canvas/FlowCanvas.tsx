'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from '@/components/nodes/AgentNode';
import GlowingEdge from '@/components/nodes/GlowingEdge';
import { AgentData, AgentType } from '@/lib/store';
import { cn } from '@/lib/utils';

const nodeTypes = {
  agent: AgentNode,
};

const edgeTypes = {
  glowing: GlowingEdge,
};

interface FlowCanvasProps {
  className?: string;
  onNodesChange?: (nodes: Node<AgentData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  externalNodes?: Node<AgentData>[];
}

export default function FlowCanvas({ className, onNodesChange, onEdgesChange, externalNodes }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<AgentData>([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Expose nodes and edges to parent component
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange]);

  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange]);

  // Sync external nodes with internal state (for status updates during execution)
  useEffect(() => {
    if (externalNodes && externalNodes.length > 0) {
      setNodes(externalNodes);
    }
  }, [externalNodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'glowing',
      animated: true,
      style: { strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as AgentType;
      
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<AgentData> = {
        id: `${type}-${Date.now()}`,
        type: 'agent',
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          type,
          status: 'idle',
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Add some demo nodes on first load
  useEffect(() => {
    if (nodes.length === 0) {
      const demoNodes: Node<AgentData>[] = [
        {
          id: 'analyzer-1',
          type: 'agent',
          position: { x: 250, y: 100 },
          data: {
            label: 'Data Analyzer',
            type: 'analyzer',
            status: 'idle',
            config: { model: 'claude-3-opus', temperature: 0.7 },
          },
        },
        {
          id: 'summarizer-1',
          type: 'agent',
          position: { x: 550, y: 100 },
          data: {
            label: 'Content Summarizer',
            type: 'summarizer',
            status: 'idle',
            config: { maxLength: 500, style: 'professional' },
          },
        },
        {
          id: 'validator-1',
          type: 'agent',
          position: { x: 850, y: 100 },
          data: {
            label: 'Quality Validator',
            type: 'validator',
            status: 'idle',
            config: { strictness: 'high', checkGrammar: true },
          },
        },
      ];

      const demoEdges: Edge[] = [
        {
          id: 'edge-analyzer-1-summarizer-1',
          source: 'analyzer-1',
          target: 'summarizer-1',
          type: 'glowing',
          animated: true,
        },
        {
          id: 'edge-summarizer-1-validator-1',
          source: 'summarizer-1',
          target: 'validator-1',
          type: 'glowing',
          animated: true,
        },
      ];

      setNodes(demoNodes);
      setEdges(demoEdges);
    }
  }, [nodes.length, setNodes, setEdges]);

  return (
    <div 
      className={cn("", className)} 
      style={{ width: '100%', height: '600px' }} 
      onDragOver={handleDragOver} 
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
        style={{ width: '100%', height: '100%' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1a1a2e"
          gap={20}
          variant={BackgroundVariant.Dots}
          size={1}
        />
        <Controls
          className="!bg-gray-900 !border-gray-700 !text-gray-300"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap
          className="!bg-gray-900 !border-gray-700"
          nodeColor="#0ea5e9"
          maskColor="rgba(0, 0, 0, 0.5)"
        />
      </ReactFlow>
    </div>
  );
}