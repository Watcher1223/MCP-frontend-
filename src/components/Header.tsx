import { Wifi, WifiOff, Settings, RefreshCw } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  error: string | null;
  onReconnect: () => void;
  onConfig: () => void;
  cursor: number;
}

export default function Header({ connected, error, onReconnect, onConfig, cursor }: HeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-synapse-500 to-synapse-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Synapse</h1>
                <p className="text-xs text-gray-400">Multi-Agent Coordination</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Cursor: <span className="font-mono text-synapse-400">{cursor}</span>
            </div>

            <div className="flex items-center gap-2">
              {connected ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">{error || 'Disconnected'}</span>
                </div>
              )}
            </div>

            <button
              onClick={onReconnect}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Reconnect"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={onConfig}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
