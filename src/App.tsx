import { useState } from 'react';
import { useSynapse } from './hooks/useSynapse';
import AgentsPanel from './components/AgentsPanel';
import EventsPanel from './components/EventsPanel';
import LocksPanel from './components/LocksPanel';
import IntentsPanel from './components/IntentsPanel';
import FilesPanel from './components/FilesPanel';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';

function App() {
  const [showConfig, setShowConfig] = useState(false);
  const { connected, blueprint, events, error, reconnect } = useSynapse();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        connected={connected}
        error={error}
        onReconnect={reconnect}
        onConfig={() => setShowConfig(true)}
        cursor={blueprint?.cursor || 0}
      />

      {showConfig && (
        <ConfigPanel onClose={() => setShowConfig(false)} />
      )}

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Agents & Locks */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <AgentsPanel agents={blueprint?.agents || []} />
            <LocksPanel locks={blueprint?.locks || []} agents={blueprint?.agents || []} />
          </div>

          {/* Middle Column - Events */}
          <div className="col-span-12 lg:col-span-5">
            <EventsPanel events={events} agents={blueprint?.agents || []} />
          </div>

          {/* Right Column - Intents & Files */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <IntentsPanel intents={blueprint?.intents || []} agents={blueprint?.agents || []} />
            <FilesPanel files={blueprint?.files || {}} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
