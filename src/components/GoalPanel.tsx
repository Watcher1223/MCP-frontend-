import { useEffect, useState } from 'react';

interface Goal {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'converging' | 'satisfied' | 'regressed';
  success_criteria: string[];
  progress?: number;
}

interface GoalPanelProps {
  compact?: boolean;
}

export default function GoalPanel({ compact }: GoalPanelProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch('http://localhost:3200/api/graph');
        const data = await res.json();
        if (data.goals) {
          setGoals(data.goals.map((g: any) => ({
            id: g.id,
            description: g.label || g.description,
            status: g.status,
            success_criteria: g.criteria || [],
            progress: g.status === 'satisfied' ? 100 :
                     g.status === 'converging' ? 66 :
                     g.status === 'in_progress' ? 33 : 0,
          })));
        }
      } catch (e) {
        console.error('Failed to fetch goals:', e);
      }
      setLoading(false);
    };

    fetchGoals();
    const interval = setInterval(fetchGoals, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'satisfied': return 'text-green-400 border-green-400';
      case 'converging': return 'text-blue-400 border-blue-400';
      case 'in_progress': return 'text-yellow-400 border-yellow-400';
      case 'regressed': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getStatusBg = (status: Goal['status']) => {
    switch (status) {
      case 'satisfied': return 'bg-green-400';
      case 'converging': return 'bg-blue-400';
      case 'in_progress': return 'bg-yellow-400';
      case 'regressed': return 'bg-red-400';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Goals
        </h3>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Goals ({goals.length})
      </h3>

      {goals.length === 0 ? (
        <div className="text-gray-500 text-sm">No active goals</div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className={`border rounded-lg p-3 ${getStatusColor(goal.status)}`}>
              {/* Progress Ring */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(goal.progress || 0) * 1.76} 176`}
                      className={getStatusColor(goal.status).split(' ')[0]}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                    {goal.progress || 0}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{goal.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: <span className={getStatusColor(goal.status).split(' ')[0]}>{goal.status}</span>
                  </div>
                </div>
              </div>

              {/* Criteria */}
              {!compact && goal.success_criteria.length > 0 && (
                <div className="mt-3 space-y-1">
                  {goal.success_criteria.map((criterion, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        (goal.progress || 0) > (i + 1) * (100 / goal.success_criteria.length)
                          ? getStatusBg(goal.status) + ' text-white'
                          : 'bg-gray-700'
                      }`}>
                        {(goal.progress || 0) > (i + 1) * (100 / goal.success_criteria.length) ? '✓' : ''}
                      </span>
                      <span className="text-gray-400">{criterion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
