import { MessageSquare, Zap, CheckCircle, User } from 'lucide-react';
import type { Intent, Agent, Event } from '../types';

interface MessageBoardProps {
  intents: Intent[];
  agents: Agent[];
  events: Event[];
}

function getAgentName(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

function getAgentEnv(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.environment || '';
}

function formatTime(timestamp: number | Date | undefined): string {
  if (!timestamp) return '';
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function MessageBoard({ intents, agents, events }: MessageBoardProps) {
  const activeIntents = intents.filter(i => i.status === 'pending' || i.status === 'active');
  const recentCompletions = events
    .filter(e => e.type === 'intent_completed' || e.type === 'lock_released')
    .slice(-5)
    .reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header shrink-0 bg-surface-card/80 border-b-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent-gold" />
          <h2 className="font-semibold text-text-primary">Message Board</h2>
        </div>
        <span className="text-xs text-text-muted">
          Agents post intent & progress
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* What agents are working on */}
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            In Progress
          </h3>
          {activeIntents.length === 0 ? (
            <div className="text-sm text-text-muted italic py-4">
              No active intents. Agents will post here when they start work.
            </div>
          ) : (
            <div className="space-y-2">
              {activeIntents.map((intent) => {
                const agentName = getAgentName(intent.agentId, agents);
                const agentEnv = getAgentEnv(intent.agentId, agents);
                return (
                  <div
                    key={intent.id}
                    className="p-3 rounded-xl border border-accent-gold/20 bg-accent-gold/5"
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-accent-gold/20">
                        <Zap className="w-3.5 h-3.5 text-accent-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary">
                          {intent.action.replace(/_/g, ' ')}
                        </div>
                        {intent.description && (
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {intent.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="flex items-center gap-1 text-xs text-accent-gold">
                            <User className="w-3 h-3" />
                            {agentName}
                            {agentEnv && (
                              <span className="text-text-muted">({agentEnv})</span>
                            )}
                          </span>
                          <span className="text-text-muted">·</span>
                          <span className="text-xs text-text-muted">
                            {formatTime(intent.createdAt)}
                          </span>
                        </div>
                        {intent.targets && intent.targets.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {intent.targets.slice(0, 3).map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-surface-elevated rounded text-xs font-mono text-text-secondary"
                              >
                                {t.split('/').pop()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent handoffs / completions */}
        {recentCompletions.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Recent Handoffs
            </h3>
            <div className="space-y-2">
              {recentCompletions.map((event, i) => {
                const isRelease = event.type === 'lock_released';
                const agentName = event.data?.agent?.name || getAgentName(event.data?.agentId || event.agentId || '', agents);
                const target = event.data?.target?.path || event.data?.path || event.data?.targetPath || '';
                return (
                  <div
                    key={event.id || i}
                    className="p-2.5 rounded-lg border border-surface-border bg-surface-elevated/50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-text-secondary">
                        {isRelease ? (
                          <>
                            <span className="text-accent-gold">{agentName}</span> released{' '}
                            <span className="font-mono text-accent-teal">{target.split('/').pop() || target}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-accent-gold">{agentName}</span> completed intent
                          </>
                        )}
                      </span>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        {formatTime(event.timestamp)} · Pick up available
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
