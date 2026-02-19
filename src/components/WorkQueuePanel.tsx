import { useEffect, useState } from 'react';

interface WorkItem {
  id: string;
  description: string;
  role: string;
  status: string;
}

interface WorkQueuePanelProps {
  compact?: boolean;
}

export default function WorkQueuePanel({ compact }: WorkQueuePanelProps) {
  const [workQueue, setWorkQueue] = useState<WorkItem[]>([]);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await fetch('http://localhost:3200/api/graph');
        const data = await res.json();
        if (data.workQueue) {
          setWorkQueue(data.workQueue);
        }
      } catch (e) {
        console.error('Failed to fetch work queue:', e);
      }
    };

    fetchWork();
    const interval = setInterval(fetchWork, 2000);
    return () => clearInterval(interval);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'planner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'coder': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'fixer': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'tester': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'animate-pulse ring-2 ring-blue-500';
      case 'completed': return 'opacity-50 line-through';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Work Queue ({workQueue.length})
      </h3>

      {workQueue.length === 0 ? (
        <div className="text-gray-500 text-sm">No pending work</div>
      ) : (
        <div className="space-y-2">
          {workQueue.slice(0, compact ? 5 : 10).map((item) => (
            <div
              key={item.id}
              className={`border border-gray-700 rounded-lg p-3 ${getStatusStyle(item.status)}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(item.role)}`}>
                  {item.role}
                </span>
                {item.status === 'active' && (
                  <span className="text-xs text-blue-400">In Progress</span>
                )}
              </div>
              <div className="text-sm text-gray-300 truncate">
                {item.description}
              </div>
            </div>
          ))}
          {workQueue.length > (compact ? 5 : 10) && (
            <div className="text-xs text-gray-500 text-center">
              +{workQueue.length - (compact ? 5 : 10)} more items
            </div>
          )}
        </div>
      )}
    </div>
  );
}
