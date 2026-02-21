import { useState, useEffect, useCallback } from 'react';
import { useSynapse } from './hooks/useSynapse';
import AgentsPanel from './components/AgentsPanel';
import EventsPanel from './components/EventsPanel';
import LocksPanel from './components/LocksPanel';
import MessageBoard from './components/MessageBoard';
import FilesPanel from './components/FilesPanel';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import CollaborationGraph from './components/CollaborationGraph';
import QuickConnect from './components/QuickConnect';

function App() {
  const [showConfig, setShowConfig] = useState(false);
  const [showQuickConnect, setShowQuickConnect] = useState(false);
  const { connected, blueprint, events, error, reconnect, updateAgent } = useSynapse();

  // Show quick connect on first visit when disconnected
  useEffect(() => {
    const hasConfig = localStorage.getItem('synapse_configured');
    if (!hasConfig && !connected) {
      setShowQuickConnect(true);
    }
  }, [connected]);

  const handleQuickConnect = useCallback(() => {
    localStorage.setItem('synapse_configured', 'true');
    setShowQuickConnect(false);
    reconnect();
  }, [reconnect]);

  return (
    <div className="min-h-screen bg-surface-deep text-text-primary">
      <Header
        connected={connected}
        error={error}
        onReconnect={reconnect}
        onConfig={() => setShowConfig(true)}
        agentCount={blueprint?.agents?.length || 0}
      />

      {showConfig && (
        <ConfigPanel onClose={() => setShowConfig(false)} />
      )}

      {showQuickConnect && (
        <QuickConnect
          onConnect={handleQuickConnect}
          onClose={() => setShowQuickConnect(false)}
        />
      )}

      <main className="pt-16">
        {/* Single dashboard layout - Shared context, Message Board, Locks, Handoff flow */}
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Left - Workspace & Agents */}
          <div className="w-64 border-r border-surface-border overflow-y-auto bg-surface-mid/50 flex flex-col">
            <div className="p-4 border-b border-surface-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Workspace
              </h2>
              <p className="text-sm text-text-secondary">
                {blueprint?.agents?.length || 0} agent{(blueprint?.agents?.length || 0) !== 1 ? 's' : ''} in session
              </p>
            </div>
            <div className="flex-1 p-2 min-h-0">
              <AgentsPanel
                agents={blueprint?.agents || []}
                onUpdateAgent={updateAgent}
                compact
              />
            </div>
          </div>

          {/* Center Left - Message Board (agents post what they're working on) */}
          <div className="w-96 border-r border-surface-border flex flex-col bg-surface-mid/30 overflow-hidden">
            <MessageBoard
              intents={blueprint?.intents || []}
              agents={blueprint?.agents || []}
              events={events}
            />
          </div>

          {/* Center - Collaboration Graph (handoff flow) */}
          <div className="flex-1 relative bg-surface-deep min-w-0">
            <CollaborationGraph
              agents={blueprint?.agents || []}
              intents={blueprint?.intents || []}
              locks={blueprint?.locks || []}
              files={blueprint?.files || {}}
              events={events}
            />
          </div>

          {/* Right - Files (lock status) & Locks & Events */}
          <div className="w-80 border-l border-surface-border flex flex-col overflow-hidden bg-surface-mid/50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <LocksPanel
                locks={blueprint?.locks || []}
                agents={blueprint?.agents || []}
              />
              <FilesPanel files={blueprint?.files || {}} locks={blueprint?.locks || []} agents={blueprint?.agents || []} />
            </div>
            <div className="h-48 border-t border-surface-border shrink-0">
              <EventsPanel
                events={events}
                agents={blueprint?.agents || []}
                compact
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
