import { Lock, Clock } from 'lucide-react';
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

export default function LocksPanel({ locks, agents }: LocksPanelProps) {
  return (
    <div className="panel-card overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent-teal" />
          <h2 className="font-semibold text-text-primary">Active Locks</h2>
        </div>
        <span className="text-sm text-text-muted">{locks.length} active</span>
      </div>

      <div className="divide-y divide-surface-border">
        {locks.length === 0 ? (
          <div className="px-4 py-6 text-center text-text-muted text-sm">
            No active locks
          </div>
        ) : (
          locks.map((lock) => {
            const expiresAt = typeof lock.expiresAt === 'number' ? lock.expiresAt : (lock.expiresAt ? new Date(lock.expiresAt).getTime() : Date.now() + 60000);
            const isExpiringSoon = expiresAt - Date.now() < 10000;
            const targetPath = lock.target?.path || lock.targetPath || 'Unknown';
            const targetType = lock.target?.type || lock.targetType || 'file';
            const targetId = lock.target?.identifier || lock.targetIdentifier;
            return (
              <div key={lock.id} className="px-4 py-3 hover:bg-surface-elevated/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm text-text-primary truncate">
                      {targetPath}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {targetType}
                      {targetId && ` : ${targetId}`}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Held by: {getAgentName(lock.agentId, agents)}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isExpiringSoon ? 'text-amber-400' : 'text-text-muted'}`}>
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(expiresAt)}
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
