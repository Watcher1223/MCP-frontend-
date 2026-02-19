import { useEffect, useRef, useState, useCallback } from 'react';
import type { Agent, Intent, Lock, FileState, Event } from '../types';

interface Node {
  id: string;
  type: 'agent' | 'file' | 'intent';
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  data: any;
  pulse?: boolean;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'lock' | 'intent' | 'modify';
  color: string;
  animated?: boolean;
  label?: string;
}

interface CollaborationGraphProps {
  agents: Agent[];
  intents: Intent[];
  locks: Lock[];
  files: Record<string, FileState>;
  events: Event[];
  compact?: boolean;
}

const COLORS = {
  agent: {
    coder: '#3b82f6',    // blue
    planner: '#8b5cf6',  // purple
    tester: '#10b981',   // green
    executor: '#f59e0b', // amber
    observer: '#6b7280', // gray
  },
  file: '#64748b',
  intent: '#ec4899',
  lock: '#ef4444',
  modify: '#22c55e',
};

export default function CollaborationGraph({
  agents,
  intents,
  locks,
  files,
  events,
  compact = false,
}: CollaborationGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Map<string, Node>>(new Map());
  const edgesRef = useRef<Edge[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const recentEventsRef = useRef<Set<string>>(new Set());

  // Track recent events for pulse animation
  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      const key = `${latest.type}-${latest.data?.agentId || latest.data?.path || ''}`;
      recentEventsRef.current.add(key);

      setTimeout(() => {
        recentEventsRef.current.delete(key);
      }, 2000);
    }
  }, [events]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Build graph nodes and edges
  useEffect(() => {
    const nodes = nodesRef.current;
    const existingIds = new Set(nodes.keys());
    const newIds = new Set<string>();

    // Add agent nodes
    agents.forEach((agent, i) => {
      const id = `agent-${agent.id}`;
      newIds.add(id);

      if (!nodes.has(id)) {
        const angle = (i / Math.max(agents.length, 1)) * Math.PI * 2;
        const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
        nodes.set(id, {
          id,
          type: 'agent',
          label: agent.name,
          x: dimensions.width / 2 + Math.cos(angle) * radius,
          y: dimensions.height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          color: COLORS.agent[agent.role as keyof typeof COLORS.agent] || COLORS.agent.coder,
          size: compact ? 20 : 30,
          data: agent,
          pulse: agent.isOnline,
        });
      } else {
        const node = nodes.get(id)!;
        node.label = agent.name;
        node.data = agent;
        node.pulse = agent.isOnline;
      }
    });

    // Add file nodes (only files with recent activity)
    const activeFiles = new Set<string>();
    locks.forEach(lock => {
      if (lock.targetPath) activeFiles.add(lock.targetPath);
    });
    events.slice(-20).forEach(event => {
      if (event.data?.path) activeFiles.add(event.data.path);
    });

    Array.from(activeFiles).forEach((filePath, idx) => {
      const id = `file-${filePath}`;
      newIds.add(id);

      if (!nodes.has(id)) {
        const angle = (idx / Math.max(activeFiles.size, 1)) * Math.PI * 2 + Math.PI / 4;
        const radius = Math.min(dimensions.width, dimensions.height) * 0.15;
        const fileData = files[filePath] || { path: filePath };
        nodes.set(id, {
          id,
          type: 'file',
          label: filePath.split('/').pop() || filePath,
          x: dimensions.width / 2 + Math.cos(angle) * radius,
          y: dimensions.height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          color: COLORS.file,
          size: compact ? 12 : 18,
          data: fileData,
        });
      }
    });

    // Add intent nodes
    intents.filter(item => item.status === 'active' || item.status === 'pending').forEach((intent) => {
      const id = `intent-${intent.id}`;
      newIds.add(id);

      if (!nodes.has(id)) {
        const agentNode = nodes.get(`agent-${intent.agentId}`);
        const baseX = agentNode?.x || dimensions.width / 2;
        const baseY = agentNode?.y || dimensions.height / 2;
        nodes.set(id, {
          id,
          type: 'intent',
          label: intent.action.slice(0, 20),
          x: baseX + (Math.random() - 0.5) * 50,
          y: baseY + (Math.random() - 0.5) * 50,
          vx: 0,
          vy: 0,
          color: COLORS.intent,
          size: compact ? 8 : 12,
          data: intent,
          pulse: true,
        });
      }
    });

    // Remove old nodes
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        nodes.delete(id);
      }
    });

    // Build edges
    const edges: Edge[] = [];

    // Lock edges
    locks.forEach(lock => {
      const sourceId = `agent-${lock.agentId}`;
      const targetId = `file-${lock.targetPath}`;
      if (nodes.has(sourceId) && nodes.has(targetId)) {
        edges.push({
          id: `lock-${lock.id}`,
          source: sourceId,
          target: targetId,
          type: 'lock',
          color: COLORS.lock,
          animated: true,
          label: '🔒',
        });
      }
    });

    // Intent edges
    intents.filter(i => i.status === 'active').forEach(intent => {
      const sourceId = `agent-${intent.agentId}`;
      const targetId = `intent-${intent.id}`;
      if (nodes.has(sourceId) && nodes.has(targetId)) {
        edges.push({
          id: `intent-edge-${intent.id}`,
          source: sourceId,
          target: targetId,
          type: 'intent',
          color: COLORS.intent,
          animated: true,
        });
      }

      // Connect intent to target files
      intent.targets?.forEach(target => {
        const fileId = `file-${target}`;
        if (nodes.has(fileId)) {
          edges.push({
            id: `intent-target-${intent.id}-${target}`,
            source: targetId,
            target: fileId,
            type: 'intent',
            color: COLORS.intent,
            animated: true,
          });
        }
      });
    });

    // Recent modification edges
    events.slice(-10).forEach(event => {
      if (event.type === 'file_modified' && event.data?.agentId && event.data?.path) {
        const sourceId = `agent-${event.data.agentId}`;
        const targetId = `file-${event.data.path}`;
        if (nodes.has(sourceId) && nodes.has(targetId)) {
          edges.push({
            id: `modify-${event.id}`,
            source: sourceId,
            target: targetId,
            type: 'modify',
            color: COLORS.modify,
            animated: true,
          });
        }
      }
    });

    edgesRef.current = edges;
  }, [agents, intents, locks, files, events, dimensions, compact]);

  // Physics simulation
  const simulate = useCallback(() => {
    const nodes = Array.from(nodesRef.current.values());
    const edges = edgesRef.current;

    // Apply forces
    nodes.forEach(node => {
      // Center gravity
      const dx = dimensions.width / 2 - node.x;
      const dy = dimensions.height / 2 - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        node.vx += (dx / dist) * 0.1;
        node.vy += (dy / dist) * 0.1;
      }

      // Repulsion from other nodes
      nodes.forEach(other => {
        if (node.id === other.id) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = 500 / (dist * dist);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      });
    });

    // Edge attraction
    edges.forEach(edge => {
      const source = nodesRef.current.get(edge.source);
      const target = nodesRef.current.get(edge.target);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = (dist - 100) * 0.01;

      source.vx += (dx / dist) * force;
      source.vy += (dy / dist) * force;
      target.vx -= (dx / dist) * force;
      target.vy -= (dy / dist) * force;
    });

    // Apply velocity with damping
    nodes.forEach(node => {
      node.vx *= 0.9;
      node.vy *= 0.9;
      node.x += node.vx;
      node.y += node.vy;

      // Keep in bounds
      const margin = 50;
      node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x));
      node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y));
    });
  }, [dimensions]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let frame = 0;

    const render = () => {
      simulate();
      frame++;

      // Clear
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw grid
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < dimensions.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();
      }
      for (let y = 0; y < dimensions.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();
      }

      // Draw edges
      edgesRef.current.forEach(edge => {
        const source = nodesRef.current.get(edge.source);
        const target = nodesRef.current.get(edge.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = 2;

        if (edge.animated) {
          // Animated dashed line
          const dashOffset = (frame * 2) % 20;
          ctx.setLineDash([10, 10]);
          ctx.lineDashOffset = -dashOffset;
        } else {
          ctx.setLineDash([]);
        }

        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw label if present
        if (edge.label) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '14px Inter';
          ctx.fillStyle = '#fff';
          ctx.fillText(edge.label, midX - 7, midY + 5);
        }
      });

      // Draw nodes
      const nodes = Array.from(nodesRef.current.values());
      nodes.forEach(node => {
        // Pulse effect
        if (node.pulse) {
          const pulseSize = node.size + Math.sin(frame * 0.1) * 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseSize + 5, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '30';
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = node.type === 'agent' ? 3 : 1;
        ctx.stroke();

        // Icon based on type
        ctx.fillStyle = '#fff';
        ctx.font = `${node.size * 0.8}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (node.type === 'agent') {
          const icon = getAgentIcon(node.data.role);
          ctx.fillText(icon, node.x, node.y);
        } else if (node.type === 'file') {
          ctx.fillText('📄', node.x, node.y);
        } else if (node.type === 'intent') {
          ctx.fillText('⚡', node.x, node.y);
        }

        // Label
        ctx.font = `${compact ? 10 : 12}px Inter`;
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(node.label, node.x, node.y + node.size + 15);
      });

      // Draw status indicator
      if (!compact) {
        ctx.font = '14px Inter';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'left';
        ctx.fillText(`${nodes.length} nodes · ${edgesRef.current.length} edges`, 20, dimensions.height - 20);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, simulate, compact]);

  // Mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: Node | null = null;
    for (const node of nodesRef.current.values()) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < node.size) {
        found = node;
        break;
      }
    }

    setHoveredNode(found);
    canvas.style.cursor = found ? 'pointer' : 'default';
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        className="w-full h-full"
      />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          className="absolute bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-10 pointer-events-none"
          style={{
            left: Math.min(hoveredNode.x + 20, dimensions.width - 200),
            top: Math.min(hoveredNode.y + 20, dimensions.height - 100),
          }}
        >
          <div className="font-medium text-white">{hoveredNode.label}</div>
          <div className="text-sm text-gray-400">
            {hoveredNode.type === 'agent' && (
              <>
                <div>Role: {hoveredNode.data.role}</div>
                <div>Environment: {hoveredNode.data.environment}</div>
                <div className={hoveredNode.data.isOnline ? 'text-green-400' : 'text-gray-500'}>
                  {hoveredNode.data.isOnline ? '● Online' : '○ Offline'}
                </div>
              </>
            )}
            {hoveredNode.type === 'file' && (
              <>
                <div>Path: {hoveredNode.data.path}</div>
                <div>Version: {hoveredNode.data.version || 'N/A'}</div>
              </>
            )}
            {hoveredNode.type === 'intent' && (
              <>
                <div>Action: {hoveredNode.data.action}</div>
                <div>Status: {hoveredNode.data.status}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {!compact && (
        <div className="absolute top-4 right-4 bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-xs">
          <div className="font-medium mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Coder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>Planner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Tester</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500"></span>
              <span>File</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              <span>Intent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getAgentIcon(role: string): string {
  switch (role) {
    case 'coder': return '💻';
    case 'planner': return '📋';
    case 'tester': return '🧪';
    case 'executor': return '⚙️';
    case 'observer': return '👁️';
    default: return '🤖';
  }
}
