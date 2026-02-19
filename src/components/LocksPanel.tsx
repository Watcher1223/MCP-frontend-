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
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-synapse-400" />
          <h2 className="font-semibold text-white">Active Locks</h2>
        </div>
        <span className="text-sm text-gray-400">{locks.length} active</span>
      </div>

      <div className="divide-y divide-gray-700">
        {locks.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
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
              <div key={lock.id} className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm text-white truncate">
                      {targetPath}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {targetType}
                      {targetId && ` : ${targetId}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Held by: {getAgentName(lock.agentId, agents)}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isExpiringSoon ? 'text-yellow-400' : 'text-gray-400'}`}>
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
