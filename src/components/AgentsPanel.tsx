import { Users, Bot, Monitor, Eye } from 'lucide-react';
import type { Agent } from '../types';

interface AgentsPanelProps {
  agents: Agent[];
}

const roleIcons: Record<string, any> = {
  planner: Bot,
  coder: Monitor,
  tester: Eye,
  refactor: Monitor,
  observer: Eye,
};

const roleColors: Record<string, string> = {
  planner: 'text-purple-400 bg-purple-400/10',
  coder: 'text-blue-400 bg-blue-400/10',
  tester: 'text-green-400 bg-green-400/10',
  refactor: 'text-orange-400 bg-orange-400/10',
  observer: 'text-gray-400 bg-gray-400/10',
};

const typeColors: Record<string, string> = {
  realtime: 'bg-green-500',
  stateless: 'bg-yellow-500',
  observer: 'bg-blue-500',
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function AgentsPanel({ agents }: AgentsPanelProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-synapse-400" />
          <h2 className="font-semibold text-white">Agents</h2>
        </div>
        <span className="text-sm text-gray-400">{agents.length} active</span>
      </div>

      <div className="divide-y divide-gray-700">
        {agents.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No agents connected
          </div>
        ) : (
          agents.map((agent) => {
            const Icon = roleIcons[agent.role] || Bot;
            return (
              <div key={agent.id} className="px-4 py-3 hover:bg-gray-750 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${roleColors[agent.role]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">{agent.name}</span>
                      <span className={`w-2 h-2 rounded-full ${typeColors[agent.type]}`} title={agent.type} />
                    </div>
                    <div className="text-sm text-gray-400 capitalize">{agent.role}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last seen: {formatTime(agent.lastSeen)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
