import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { motion } from 'framer-motion';

function GlowingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <motion.path
          id={id}
          d={edgePath}
          stroke={selected ? '#0ea5e9' : 'rgba(14, 165, 233, 0.6)'}
          strokeWidth={selected ? 3 : 2}
          fill="none"
          strokeDasharray={animated ? '5,5' : '0'}
          className={animated ? 'animate-flow' : ''}
          style={{
            filter: selected 
              ? 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.8))' 
              : 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.4))',
            ...style,
          }}
          markerEnd={markerEnd}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      
      {/* Optional label for data flow indicator */}
      {animated && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-background-tertiary border border-primary-500/30 text-xs text-primary-400"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary-400"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            Flow
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(GlowingEdge);