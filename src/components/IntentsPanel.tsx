import { Target, CheckCircle, XCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import type { Intent, Agent } from '../types';

interface IntentsPanelProps {
  intents: Intent[];
  agents: Agent[];
  compact?: boolean;
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  active: Zap,
  completed: CheckCircle,
  cancelled: XCircle,
  blocked: AlertCircle,
};

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  active: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  completed: 'text-green-400 bg-green-500/20 border-green-500/30',
  cancelled: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
  blocked: 'text-red-400 bg-red-500/20 border-red-500/30',
};

function getAgentName(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

function formatTime(timestamp: number | Date | undefined): string {
  if (!timestamp) return 'Unknown';
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function IntentsPanel({ intents, agents, compact = false }: IntentsPanelProps) {
  const activeIntents = intents.filter(i => i.status === 'pending' || i.status === 'active');

  return (
    <div className={`${compact ? '' : 'bg-gray-800/50 rounded-xl border border-gray-700/50'} overflow-hidden h-full`}>
      <div className={`px-4 py-3 ${compact ? 'border-b border-gray-800' : 'border-b border-gray-700/50'} flex items-center justify-between sticky top-0 ${compact ? 'bg-gray-900/95' : 'bg-gray-800/95'} backdrop-blur-sm z-10`}>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-white">Intents</h2>
        </div>
        {activeIntents.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {activeIntents.length} active
          </span>
        )}
      </div>

      <div className="overflow-y-auto h-[calc(100%-52px)]">
        <div className={`divide-y ${compact ? 'divide-gray-800/30' : 'divide-gray-700/30'}`}>
          {intents.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active intents</p>
            </div>
          ) : (
            <>
              {activeIntents.map((intent) => {
                const Icon = statusIcons[intent.status];
                const colorClass = statusColors[intent.status];

                return (
                  <div key={intent.id} className={`px-4 ${compact ? 'py-2.5' : 'py-3'} hover:bg-gray-800/30 transition-colors`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-md border ${colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">
                          {intent.action.replace(/_/g, ' ')}
                        </div>
                        {!compact && intent.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {intent.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span>{getAgentName(intent.agentId, agents)}</span>
                          <span className="text-gray-700">·</span>
                          <span>{formatTime(intent.createdAt)}</span>
                          {intent.priority && intent.priority > 5 && (
                            <>
                              <span className="text-gray-700">·</span>
                              <span className="text-amber-400">High Priority</span>
                            </>
                          )}
                        </div>
                        {!compact && intent.targets && intent.targets.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {intent.targets.slice(0, 3).map((target, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 font-mono">
                                {target.split('/').pop()}
                              </span>
                            ))}
                            {intent.targets.length > 3 && (
                              <span className="text-xs text-gray-500">+{intent.targets.length - 3} more</span>
                            )}
                          </div>
                        )}
                        {!compact && intent.concepts && intent.concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {intent.concepts.slice(0, 4).map((concept, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">
                                {concept}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
