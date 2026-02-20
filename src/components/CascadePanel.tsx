import { useEffect, useState } from 'react';

interface FileSession {
  path: string;
  editors: string[];
  pendingChanges: number;
}

interface CascadeEvent {
  type: string;
  source: string;
  target: string;
  details: string;
}

interface CascadePanelProps {
  compact?: boolean;
}

export default function CascadePanel({ compact }: CascadePanelProps) {
  const [fileSessions, setFileSessions] = useState<FileSession[]>([]);
  const [cascadeEvents, setCascadeEvents] = useState<CascadeEvent[]>([]);

  useEffect(() => {
    const fetchCascade = async () => {
      try {
        const res = await fetch('http://localhost:3200/api/graph');
        const data = await res.json();
        if (data.fileSessions) {
          setFileSessions(data.fileSessions);
        }
        if (data.cascadeEvents) {
          setCascadeEvents(data.cascadeEvents);
        }
      } catch (e) {
        console.error('Failed to fetch cascade data:', e);
      }
    };

    fetchCascade();
    const interval = setInterval(fetchCascade, 1000);
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'endpoint_added': return '🔌';
      case 'contract_changed': return '📝';
      case 'frontend_adapted': return '🎨';
      case 'conflict_resolved': return '✅';
      case 'test_triggered': return '🧪';
      default: return '📡';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'endpoint_added': return 'border-green-500/30 bg-green-500/10';
      case 'contract_changed': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'frontend_adapted': return 'border-purple-500/30 bg-purple-500/10';
      case 'conflict_resolved': return 'border-blue-500/30 bg-blue-500/10';
      case 'test_triggered': return 'border-cyan-500/30 bg-cyan-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Sessions */}
      <div className="panel-card p-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Collaborative Editing ({fileSessions.length})
        </h3>

        {fileSessions.length === 0 ? (
          <div className="text-text-muted text-sm">No active file sessions</div>
        ) : (
          <div className="space-y-2">
            {fileSessions.map((session, i) => (
              <div key={i} className="border border-accent-teal/30 bg-accent-teal/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-accent-teal">📄</span>
                  <span className="text-sm font-mono text-text-secondary">{session.path}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {session.editors.map((editor, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 rounded-lg bg-surface-elevated text-text-secondary"
                    >
                      {editor}
                    </span>
                  ))}
                </div>
                {session.pendingChanges > 0 && (
                  <div className="text-xs text-amber-400 mt-2">
                    {session.pendingChanges} pending changes (auto-merging...)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cascade Events */}
      <div className="panel-card p-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Cascade Events
        </h3>

        {cascadeEvents.length === 0 ? (
          <div className="text-text-muted text-sm">No recent cascades</div>
        ) : (
          <div className="space-y-2">
            {cascadeEvents.slice(0, compact ? 5 : 10).map((event, i) => (
              <div
                key={i}
                className={`border rounded-lg p-2 ${getEventColor(event.type)}`}
              >
                <div className="flex items-center gap-2">
                  <span>{getEventIcon(event.type)}</span>
                  <span className="text-xs text-text-muted">
                    {event.source} → {event.target}
                  </span>
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {event.details}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
