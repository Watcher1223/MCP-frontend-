import { Lock, Unlock, Clock } from 'lucide-react';
import type { Lock as LockType, Agent } from '../types';

interface LocksPanelProps {
  locks: LockType[];
  agents: Agent[];
}

function formatTimeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Expired';
  if (remaining < 60000) return `${Math.ceil(remaining / 1000)}s`;
  return `${Math.ceil(remaining / 60000)}m`;
}

function getAgentName(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

function getAgentEnv(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.environment || '';
}

export default function LocksPanel({ locks, agents }: LocksPanelProps) {
  return (
    <div className="panel-card overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent-teal" />
          <h2 className="font-semibold text-text-primary">File Locks</h2>
        </div>
        <span className="text-xs text-text-muted">
          {locks.length > 0 ? `${locks.length} locked` : 'All available'}
        </span>
      </div>

      <div className="divide-y divide-surface-border">
        {locks.length === 0 ? (
          <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-3">
              <Unlock className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-400/90">All files available</p>
            <p className="text-xs text-text-muted mt-1">No locks • Agents can pick up work</p>
          </div>
        ) : (
          locks.map((lock) => {
            const expiresAt = typeof lock.expiresAt === 'number'
              ? lock.expiresAt
              : (lock.expiresAt ? new Date(lock.expiresAt).getTime() : Date.now() + 60000);
            const isExpiringSoon = expiresAt - Date.now() < 15000;
            const targetPath = lock.target?.path || lock.targetPath || 'Unknown';
            const agentName = getAgentName(lock.agentId, agents);
            const agentEnv = getAgentEnv(lock.agentId, agents);

            return (
              <div
                key={lock.id}
                className="px-4 py-3 border-l-2 border-l-red-500/80 bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm text-text-primary truncate">
                      {targetPath.split('/').pop() || targetPath}
                    </div>
                    <div className="text-xs font-medium text-red-400 mt-1">
                      LOCKED BY {agentName}
                      {agentEnv && (
                        <span className="text-red-400/80 font-normal"> ({agentEnv.toUpperCase()})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeRemaining(expiresAt)}
                      {isExpiringSoon && (
                        <span className="text-amber-400">· Expiring soon</span>
                      )}
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
