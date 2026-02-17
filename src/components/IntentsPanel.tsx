import { Target, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { Intent, Agent } from '../types';

interface IntentsPanelProps {
  intents: Intent[];
  agents: Agent[];
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  active: Target,
  completed: CheckCircle,
  cancelled: XCircle,
  blocked: AlertCircle,
};

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  active: 'text-blue-400 bg-blue-400/10',
  completed: 'text-green-400 bg-green-400/10',
  cancelled: 'text-gray-400 bg-gray-400/10',
  blocked: 'text-red-400 bg-red-400/10',
};

function getAgentName(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function IntentsPanel({ intents, agents }: IntentsPanelProps) {
  const activeIntents = intents.filter(i => i.status === 'pending' || i.status === 'active');
  const recentIntents = intents
    .filter(i => i.status !== 'pending' && i.status !== 'active')
    .slice(-5)
    .reverse();

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-synapse-400" />
          <h2 className="font-semibold text-white">Intents</h2>
        </div>
        <span className="text-sm text-gray-400">{activeIntents.length} active</span>
      </div>

      <div className="divide-y divide-gray-700">
        {intents.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            No intents broadcast
          </div>
        ) : (
          <>
            {activeIntents.map((intent) => {
              const Icon = statusIcons[intent.status];
              const color = statusColors[intent.status];

              return (
                <div key={intent.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded ${color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">
                        {intent.action.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {intent.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{getAgentName(intent.agentId, agents)}</span>
                        <span>·</span>
                        <span>{formatTime(intent.createdAt)}</span>
                        <span>·</span>
                        <span>Priority: {intent.priority}</span>
                      </div>
                      {intent.targets.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {intent.targets.map((target, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 font-mono">
                              {target}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {recentIntents.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-750 text-xs text-gray-500 uppercase tracking-wider">
                  Recent
                </div>
                {recentIntents.map((intent) => {
                  const Icon = statusIcons[intent.status];
                  const color = statusColors[intent.status];

                  return (
                    <div key={intent.id} className="px-4 py-2 opacity-60">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${color}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-sm text-gray-400 truncate">
                          {intent.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(intent.updatedAt)}
                        </span>
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
