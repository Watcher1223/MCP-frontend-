import { useState, useEffect, useCallback } from 'react';
import { useSynapse } from './hooks/useSynapse';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import { Bot, Lock, Zap, Target, ArrowRight, CheckCircle2, Clock, Users, Plus, Copy, Check, FolderOpen } from 'lucide-react';

// Agent colors based on client type
const AGENT_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  chatgpt: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  claude: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
  cursor: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  default: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
};

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  idle: { dot: 'bg-gray-400', text: 'text-gray-400', label: 'Idle' },
  working: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'Working' },
  waiting: { dot: 'bg-blue-400', text: 'text-blue-400', label: 'Waiting' },
  completed: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Completed' },
};

function getAgentColor(environment?: string) {
  return AGENT_COLORS[environment || 'default'] || AGENT_COLORS.default;
}

function getStatusStyle(status?: string) {
  return STATUS_STYLES[status || 'idle'] || STATUS_STYLES.idle;
}

function formatTime(timestamp: number | Date | undefined): string {
  if (!timestamp) return '';
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

// Workspace Selection Component
function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  onSelect,
  onCreate,
  onClear,
}: {
  workspaces: any[];
  currentWorkspace: any;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<any>;
  onClear: () => void;
}) {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await onCreate(newName.trim());
    setNewName('');
    setCreating(false);
  };

  const copyWorkspaceId = () => {
    if (currentWorkspace) {
      navigator.clipboard.writeText(currentWorkspace.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentWorkspace) {
    // No workspace selected - show selection/creation screen
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Stigmergy</h1>
            <p className="text-white/50">Autonomous Agent Coordination</p>
          </div>

          {/* Create new workspace */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Create Workspace
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g., Login Feature, API Refactor"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-medium rounded-xl transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>

          {/* Demo workspace (opt-in) */}
          {workspaces.some((ws) => ws.id === 'default') && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Demo (opt-in)
              </h2>
              <p className="text-sm text-white/40 mb-4">
                Try the pre-loaded demo. Toggle off to create or join your own workspace.
              </p>
              <button
                onClick={() => onSelect('default')}
                className="w-full p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-amber-400">Demo Workspace</div>
                    <div className="text-sm text-white/40 font-mono">default</div>
                  </div>
                  <div className="text-sm text-white/50">
                    {workspaces.find((w) => w.id === 'default')?.agents ?? 0} agents
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Existing workspaces (user-created, exclude demo) */}
          {workspaces.filter((ws) => ws.id !== 'default').length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-white/50" />
                Join Existing Workspace
              </h2>
              <div className="space-y-2">
                {workspaces
                  .filter((ws) => ws.id !== 'default')
                  .map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => onSelect(ws.id)}
                      className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl text-left transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{ws.name}</div>
                          <div className="text-sm text-white/40 font-mono">{ws.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/50">{ws.agents} agents</div>
                          {ws.target && (
                            <div className="text-xs text-amber-400">{ws.target}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Workspace selected - show compact selector in header area
  const isDemo = currentWorkspace?.id === 'default';
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border-b border-white/5">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-medium text-white truncate">{currentWorkspace.name}</span>
        {isDemo && (
          <button
            onClick={onClear}
            className="text-xs px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors shrink-0"
            title="Switch to your own workspace"
          >
            Switch workspace
          </button>
        )}
        <button
          onClick={copyWorkspaceId}
          className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-white/60 hover:text-white transition-colors shrink-0"
          title="Copy workspace ID to share with agents"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>{currentWorkspace.id}</span>
            </>
          )}
        </button>
      </div>
      {workspaces.length > 1 && (
        <select
          value={currentWorkspace.id}
          onChange={(e) => onSelect(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white/70 focus:outline-none"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id} className="bg-[#0a0a0f]">
              {ws.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function App() {
  const [showConfig, setShowConfig] = useState(false);
  const {
    connected,
    blueprint,
    events,
    error,
    reconnect,
    workspaces,
    currentWorkspace,
    createWorkspace,
    selectWorkspace,
    clearWorkspace,
  } = useSynapse();

  const agents = blueprint?.agents || [];
  const locks = blueprint?.locks || [];
  const intents = blueprint?.intents || [];
  const workQueue = blueprint?.workQueue || [];
  const target = blueprint?.target;

  // Build timeline from intents
  const timeline = [...intents].sort((a, b) => {
    const aTime = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp || 0).getTime();
    const bTime = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp || 0).getTime();
    return bTime - aTime;
  });

  // If no workspace selected, show workspace selector
  if (!currentWorkspace) {
    return (
      <WorkspaceSelector
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelect={selectWorkspace}
        onCreate={createWorkspace}
        onClear={clearWorkspace}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header
        connected={connected}
        error={error}
        onReconnect={reconnect}
        onConfig={() => setShowConfig(true)}
        agentCount={agents.length}
      />

      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}

      <main className="pt-16 h-screen flex flex-col">
        {/* Workspace Bar */}
        <WorkspaceSelector
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onSelect={selectWorkspace}
          onCreate={createWorkspace}
          onClear={clearWorkspace}
        />

        {/* Target Banner */}
        {target && (
          <div className="border-b border-white/5 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-amber-400/70 uppercase tracking-wider font-medium">
                    Current Target
                  </div>
                  <div className="text-xl font-semibold text-white">{target}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Users className="w-4 h-4" />
                <span>{agents.length} agents coordinating</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Agent Cards */}
          <div className="w-80 border-r border-white/5 flex flex-col bg-white/[0.02]">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Connected Agents
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {agents.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No agents connected</p>
                  <p className="text-xs mt-2 text-white/20">
                    Share workspace ID with agents:
                  </p>
                  <code className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded mt-1 inline-block">
                    {currentWorkspace.id}
                  </code>
                </div>
              ) : (
                agents.map((agent) => {
                  const colors = getAgentColor(agent.environment);
                  const status = getStatusStyle(agent.status);
                  const agentLock = locks.find(l => l.agentId === agent.id);

                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-xl border ${colors.border} ${colors.bg} transition-all hover:shadow-lg ${colors.glow}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                          <span className="font-medium text-white">{agent.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {agent.environment}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-white/50">
                          <span>Role</span>
                          <span className="text-white/80 capitalize">{agent.role}</span>
                        </div>
                        <div className="flex items-center justify-between text-white/50">
                          <span>Status</span>
                          <span className={status.text}>{status.label}</span>
                        </div>
                        {agent.currentTask && (
                          <div className="pt-2 border-t border-white/5">
                            <div className="text-white/50 text-xs mb-1">Working on</div>
                            <code className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                              {agent.currentTask}
                            </code>
                          </div>
                        )}
                        {agentLock && (
                          <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                            <Lock className="w-3 h-3 text-red-400" />
                            <code className="text-xs text-red-400">
                              {agentLock.targetPath?.split('/').pop()}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Center Panel - Activity Feed */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Real-time Activity
              </h2>
              <p className="text-xs text-white/30 mt-1">
                Agents share context and coordinate autonomously
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <Zap className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-lg">No activity yet</p>
                  <p className="text-sm mt-2">
                    Set a target to start autonomous coordination
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {timeline.map((intent, idx) => {
                    const agent = agents.find(a => a.id === intent.agentId);
                    const colors = getAgentColor(agent?.environment);
                    const isHandoff = intent.action === 'handoff' || intent.action === 'completed';
                    const isTargetSet = intent.action === 'target_set';

                    return (
                      <div
                        key={intent.id || idx}
                        className={`relative flex gap-4 ${idx === 0 ? 'animate-fade-in' : ''}`}
                      >
                        {idx < timeline.length - 1 && (
                          <div className="absolute left-5 top-12 bottom-0 w-px bg-white/10" />
                        )}

                        <div className={`shrink-0 w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                          {isTargetSet ? (
                            <Target className={`w-5 h-5 ${colors.text}`} />
                          ) : isHandoff ? (
                            <ArrowRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Bot className={`w-5 h-5 ${colors.text}`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${colors.text}`}>
                              {agent?.name || 'System'}
                            </span>
                            {agent?.environment && (
                              <span className="text-xs text-white/30 px-1.5 py-0.5 bg-white/5 rounded">
                                {agent.environment}
                              </span>
                            )}
                            <span className="text-xs text-white/20 ml-auto">
                              {formatTime(intent.timestamp)}
                            </span>
                          </div>

                          <div className={`p-4 rounded-xl border ${
                            isHandoff
                              ? 'bg-emerald-500/10 border-emerald-500/20'
                              : isTargetSet
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-white/[0.03] border-white/5'
                          }`}>
                            <p className="text-white/80">
                              {intent.action || intent.description}
                            </p>
                            {intent.description && intent.action !== intent.description && (
                              <p className="text-sm text-white/50 mt-2">
                                {intent.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Work Queue & Locks */}
          <div className="w-80 border-l border-white/5 flex flex-col bg-white/[0.02]">
            {/* Work Queue */}
            <div className="flex-1 border-b border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Work Queue
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {workQueue.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">
                    No work items
                  </div>
                ) : (
                  workQueue.map((item) => {
                    const assignedAgent = agents.find(a => a.id === item.assignedTo);
                    const isCompleted = item.status === 'completed';
                    const isAssigned = item.status === 'assigned';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border ${
                          isCompleted
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : isAssigned
                              ? 'border-amber-500/20 bg-amber-500/5'
                              : 'border-white/5 bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : isAssigned ? (
                            <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/20 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 leading-tight">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${
                            item.forRole === 'backend'
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {item.forRole}
                          </span>
                          {assignedAgent && (
                            <span className="text-white/40">
                              {assignedAgent.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* File Locks */}
            <div className="h-64 flex flex-col">
              <div className="p-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  File Locks
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {locks.length === 0 ? (
                  <div className="text-center py-4 text-white/30 text-sm">
                    No active locks
                  </div>
                ) : (
                  locks.map((lock) => {
                    const agent = agents.find(a => a.id === lock.agentId);
                    const colors = getAgentColor(agent?.environment);

                    return (
                      <div
                        key={lock.id}
                        className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-3 h-3 text-red-400" />
                          <code className="text-sm text-white/80 truncate">
                            {lock.targetPath?.split('/').pop() || lock.targetPath}
                          </code>
                        </div>
                        <div className="text-xs text-white/40">
                          Locked by <span className={colors.text}>{lock.agentName || agent?.name}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
