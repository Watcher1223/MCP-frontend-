import { Activity, FileText, Lock, AlertTriangle, CheckCircle, XCircle, UserPlus, UserMinus, Zap } from 'lucide-react';
import type { Event, Agent } from '../types';

interface EventsPanelProps {
  events: Event[];
  agents: Agent[];
  compact?: boolean;
}

const eventIcons: Record<string, any> = {
  agent_connected: UserPlus,
  agent_disconnected: UserMinus,
  agent_updated: Activity,
  intent_broadcast: Zap,
  intent_completed: CheckCircle,
  intent_cancelled: XCircle,
  lock_acquired: Lock,
  lock_released: Lock,
  lock_conflict: AlertTriangle,
  file_created: FileText,
  file_modified: FileText,
  file_deleted: FileText,
  test_passed: CheckCircle,
  test_failed: XCircle,
  reaction_trigger: Zap,
};

const eventColors: Record<string, string> = {
  agent_connected: 'text-green-400 bg-green-500/10',
  agent_disconnected: 'text-red-400 bg-red-500/10',
  agent_updated: 'text-blue-400 bg-blue-500/10',
  intent_broadcast: 'text-purple-400 bg-purple-500/10',
  intent_completed: 'text-green-400 bg-green-500/10',
  intent_cancelled: 'text-gray-400 bg-gray-500/10',
  lock_acquired: 'text-amber-400 bg-amber-500/10',
  lock_released: 'text-amber-300 bg-amber-500/10',
  lock_conflict: 'text-yellow-400 bg-yellow-500/10',
  file_created: 'text-green-400 bg-green-500/10',
  file_modified: 'text-blue-400 bg-blue-500/10',
  file_deleted: 'text-red-400 bg-red-500/10',
  test_passed: 'text-green-400 bg-green-500/10',
  test_failed: 'text-red-400 bg-red-500/10',
  reaction_trigger: 'text-pink-400 bg-pink-500/10',
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getAgentName(agentId: string | undefined, agents: Agent[]): string {
  if (!agentId) return 'System';
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

function getEventSummary(event: Event): string {
  const data = event.data || {};

  switch (event.type) {
    case 'agent_connected':
      return data.agent?.name || 'Agent joined';
    case 'agent_disconnected':
      return 'Agent left';
    case 'intent_broadcast':
      return data.intent?.action || 'New intent';
    case 'lock_acquired':
      return data.target?.path || data.targetPath || 'Lock acquired';
    case 'lock_released':
      return 'Lock released';
    case 'file_modified':
      return data.path || 'File changed';
    default:
      return event.type.replace(/_/g, ' ');
  }
}

export default function EventsPanel({ events, agents, compact = false }: EventsPanelProps) {
  const reversedEvents = [...events].reverse().slice(0, compact ? 50 : 100);

  return (
    <div className={`${compact ? '' : 'panel-card'} overflow-hidden h-full`}>
      <div className={`panel-header sticky top-0 ${compact ? 'bg-surface-mid/95' : 'bg-surface-card/95'} backdrop-blur-sm z-10`}>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-teal" />
          <h2 className="font-semibold text-text-primary">Events</h2>
        </div>
        <span className="text-xs text-text-muted">{events.length} total</span>
      </div>

      <div className="overflow-y-auto h-[calc(100%-52px)]">
        {reversedEvents.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-muted">
            <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for events...</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border/50">
            {reversedEvents.map((event) => {
              const Icon = eventIcons[event.type] || Activity;
              const colorClass = eventColors[event.type] || 'text-gray-400 bg-gray-500/10';
              const [textColor, bgColor] = colorClass.split(' ');

              return (
                <div key={event.id} className={`px-4 ${compact ? 'py-2' : 'py-2.5'} hover:bg-surface-elevated/50 transition-colors`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-md ${bgColor}`}>
                      <Icon className={`w-3.5 h-3.5 ${textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${textColor}`}>
                          {getEventSummary(event)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-muted">
                          {getAgentName(event.agentId, agents)}
                        </span>
                        <span className="text-text-muted">·</span>
                        <span className="text-xs text-text-muted font-mono">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
