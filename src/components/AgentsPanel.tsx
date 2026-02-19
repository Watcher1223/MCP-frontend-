import { useState } from 'react';
import { Users, Bot, Monitor, Eye, Edit2, Check, X, Code, TestTube, Cog } from 'lucide-react';
import type { Agent } from '../types';

interface AgentsPanelProps {
  agents: Agent[];
  onUpdateAgent?: (agentId: string, updates: Partial<Agent>) => Promise<void>;
  compact?: boolean;
}

const roleIcons: Record<string, any> = {
  planner: Bot,
  coder: Code,
  tester: TestTube,
  executor: Cog,
  refactor: Monitor,
  observer: Eye,
};

const roleColors: Record<string, string> = {
  planner: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  coder: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  tester: 'text-green-400 bg-green-500/20 border-green-500/30',
  executor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  refactor: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  observer: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
};

const ROLES = ['planner', 'coder', 'tester', 'executor', 'observer'];

function formatTime(timestamp: number | Date): string {
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AgentsPanel({ agents, onUpdateAgent, compact = false }: AgentsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const startEditing = (agent: Agent) => {
    setEditingId(agent.id);
    setEditName(agent.name);
    setEditRole(agent.role);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditRole('');
  };

  const saveEditing = async (agentId: string) => {
    if (onUpdateAgent) {
      await onUpdateAgent(agentId, { name: editName, role: editRole as Agent['role'] });
    }
    setEditingId(null);
  };

  const onlineAgents = agents.filter(a => a.isOnline !== false);
  const offlineAgents = agents.filter(a => a.isOnline === false);

  return (
    <div className={`${compact ? '' : 'bg-gray-800/50 rounded-xl border border-gray-700/50'} overflow-hidden`}>
      <div className={`px-4 py-3 ${compact ? 'border-b border-gray-800' : 'border-b border-gray-700/50'} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white">Agents</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            {onlineAgents.length} online
          </span>
        </div>
      </div>

      <div className={`divide-y ${compact ? 'divide-gray-800/50' : 'divide-gray-700/50'} max-h-[400px] overflow-y-auto`}>
        {agents.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No agents connected</p>
            <p className="text-xs mt-1">Run: npx synapse connect</p>
          </div>
        ) : (
          <>
            {/* Online agents */}
            {onlineAgents.map((agent) => {
              const Icon = roleIcons[agent.role] || Bot;
              const isEditing = editingId === agent.id;

              return (
                <div
                  key={agent.id}
                  className={`px-4 py-3 hover:bg-gray-800/50 transition-colors ${compact ? 'py-2.5' : ''}`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Agent name"
                        autoFocus
                      />
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditing(agent.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${roleColors[agent.role] || roleColors.observer} ${compact ? 'p-1.5' : ''}`}>
                        <Icon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">{agent.name}</span>
                          <span className="relative flex h-2 w-2" title="Online">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs capitalize ${roleColors[agent.role]?.split(' ')[0] || 'text-gray-400'}`}>
                            {agent.role}
                          </span>
                          {agent.environment && (
                            <>
                              <span className="text-gray-600">·</span>
                              <span className="text-xs text-gray-500">{agent.environment}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {onUpdateAgent && (
                        <button
                          onClick={() => startEditing(agent)}
                          className="p-1.5 hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit agent"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Offline agents */}
            {offlineAgents.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-900/50">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Offline ({offlineAgents.length})
                  </span>
                </div>
                {offlineAgents.map((agent) => {
                  const Icon = roleIcons[agent.role] || Bot;
                  return (
                    <div
                      key={agent.id}
                      className="px-4 py-2.5 opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg border border-gray-700 bg-gray-800`}>
                          <Icon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 truncate">{agent.name}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Last seen: {formatTime(agent.lastSeen)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
