import { useState, useEffect, useCallback } from 'react';
import { useSynapse } from './hooks/useSynapse';
import AgentsPanel from './components/AgentsPanel';
import EventsPanel from './components/EventsPanel';
import LocksPanel from './components/LocksPanel';
import IntentsPanel from './components/IntentsPanel';
import FilesPanel from './components/FilesPanel';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import CollaborationGraph from './components/CollaborationGraph';
import QuickConnect from './components/QuickConnect';

function App() {
  const [showConfig, setShowConfig] = useState(false);
  const [showQuickConnect, setShowQuickConnect] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'grid'>('graph');
  const { connected, blueprint, events, error, reconnect, updateAgent } = useSynapse();

  // Show quick connect on first visit
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <Header
        connected={connected}
        error={error}
        onReconnect={reconnect}
        onConfig={() => setShowConfig(true)}
        cursor={blueprint?.cursor || 0}
        agentCount={blueprint?.agents.length || 0}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
        {viewMode === 'graph' ? (
          // Graph View - Full screen collaboration visualization
          <div className="h-[calc(100vh-4rem)] flex">
            {/* Left Sidebar - Agents */}
            <div className="w-72 border-r border-gray-800 overflow-y-auto bg-gray-900/50">
              <AgentsPanel
                agents={blueprint?.agents || []}
                onUpdateAgent={updateAgent}
                compact
              />
            </div>

            {/* Main Graph Area */}
            <div className="flex-1 relative bg-gray-950">
              <CollaborationGraph
                agents={blueprint?.agents || []}
                intents={blueprint?.intents || []}
                locks={blueprint?.locks || []}
                files={blueprint?.files || {}}
                events={events}
              />
            </div>

            {/* Right Sidebar - Activity */}
            <div className="w-80 border-l border-gray-800 flex flex-col bg-gray-900/50">
              <div className="flex-1 overflow-y-auto border-b border-gray-800">
                <EventsPanel events={events} agents={blueprint?.agents || []} compact />
              </div>
              <div className="h-64 overflow-y-auto">
                <IntentsPanel intents={blueprint?.intents || []} agents={blueprint?.agents || []} compact />
              </div>
            </div>
          </div>
        ) : (
          // Grid View - Traditional dashboard
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Agents & Locks */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <AgentsPanel agents={blueprint?.agents || []} onUpdateAgent={updateAgent} />
                <LocksPanel locks={blueprint?.locks || []} agents={blueprint?.agents || []} />
              </div>

              {/* Middle Column - Graph & Events */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                <div className="h-80 bg-gray-900 rounded-lg border border-gray-800">
                  <CollaborationGraph
                    agents={blueprint?.agents || []}
                    intents={blueprint?.intents || []}
                    locks={blueprint?.locks || []}
                    files={blueprint?.files || {}}
                    events={events}
                    compact
                  />
                </div>
                <EventsPanel events={events} agents={blueprint?.agents || []} />
              </div>

              {/* Right Column - Intents & Files */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <IntentsPanel intents={blueprint?.intents || []} agents={blueprint?.agents || []} />
                <FilesPanel files={blueprint?.files || {}} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
