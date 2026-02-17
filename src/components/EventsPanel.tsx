import { Activity, FileText, Lock, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Event, Agent } from '../types';

interface EventsPanelProps {
  events: Event[];
  agents: Agent[];
}

const eventIcons: Record<string, any> = {
  agent_connected: Activity,
  agent_disconnected: Activity,
  intent_broadcast: Target,
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
};

const eventColors: Record<string, string> = {
  agent_connected: 'text-green-400',
  agent_disconnected: 'text-red-400',
  intent_broadcast: 'text-purple-400',
  intent_completed: 'text-green-400',
  intent_cancelled: 'text-gray-400',
  lock_acquired: 'text-blue-400',
  lock_released: 'text-blue-300',
  lock_conflict: 'text-yellow-400',
  file_created: 'text-green-400',
  file_modified: 'text-blue-400',
  file_deleted: 'text-red-400',
  test_passed: 'text-green-400',
  test_failed: 'text-red-400',
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

function getAgentName(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

export default function EventsPanel({ events, agents }: EventsPanelProps) {
  const reversedEvents = [...events].reverse();

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-[calc(100vh-180px)]">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-synapse-400" />
          <h2 className="font-semibold text-white">Event Stream</h2>
        </div>
        <span className="text-sm text-gray-400">{events.length} events</span>
      </div>

      <div className="overflow-y-auto h-[calc(100%-52px)]">
        {reversedEvents.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Waiting for events...
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {reversedEvents.map((event) => {
              const Icon = eventIcons[event.type] || Activity;
              const color = eventColors[event.type] || 'text-gray-400';

              return (
                <div key={event.id} className="px-4 py-3 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white text-sm">
                          {event.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {getAgentName(event.agentId, agents)}
                        </span>
                      </div>
                      {event.data && Object.keys(event.data).length > 0 && (
                        <pre className="text-xs text-gray-400 mt-1 font-mono overflow-x-auto">
                          {JSON.stringify(event.data, null, 2).slice(0, 200)}
                        </pre>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(event.timestamp)} | cursor: {event.cursor}
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
