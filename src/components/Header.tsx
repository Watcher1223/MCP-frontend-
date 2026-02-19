import { WifiOff, Settings, RefreshCw, LayoutGrid, GitBranch, Users } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  error: string | null;
  onReconnect: () => void;
  onConfig: () => void;
  cursor: number;
  agentCount?: number;
  viewMode?: 'graph' | 'grid';
  onViewModeChange?: (mode: 'graph' | 'grid') => void;
}

export default function Header({
  connected,
  error,
  onReconnect,
  onConfig,
  cursor,
  agentCount = 0,
  viewMode = 'graph',
  onViewModeChange,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Synapse</h1>
                <p className="text-xs text-gray-500">Multi-Agent Coordination</p>
              </div>
            </div>

            {/* Agent count badge */}
            <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                {agentCount} agent{agentCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Center - View Toggle */}
          {onViewModeChange && (
            <div className="hidden sm:flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => onViewModeChange('graph')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'graph'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                Graph
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cursor */}
            <div className="hidden md:block text-sm">
              <span className="text-gray-500">Cursor:</span>{' '}
              <span className="font-mono text-blue-400">{cursor}</span>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connected ? (
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-green-400 font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error || 'Offline'}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onReconnect}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Reconnect"
              >
                <RefreshCw className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>

              <button
                onClick={onConfig}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
