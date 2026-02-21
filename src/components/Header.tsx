import { WifiOff, Settings, RefreshCw, Users } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  error: string | null;
  onReconnect: () => void;
  onConfig: () => void;
  agentCount?: number;
}

export default function Header({
  connected,
  error,
  onReconnect,
  onConfig,
  agentCount = 0,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-surface-mid/95 backdrop-blur-md border-b border-surface-border z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-accent-gold to-accent-teal rounded-xl flex items-center justify-center shadow-lg shadow-accent-gold/10">
                <span className="text-surface-deep font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary tracking-tight">Synapse</h1>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Shared context for AI agents · Real-time handoff
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg border border-surface-border">
              <Users className="w-4 h-4 text-accent-teal" />
              <span className="text-sm font-medium text-text-secondary">
                {agentCount} agent{agentCount !== 1 ? 's' : ''} in workspace
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {connected ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm text-emerald-400 font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error || 'Offline'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onReconnect}
                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                title="Reconnect"
              >
                <RefreshCw className="w-5 h-5 text-text-muted hover:text-text-primary transition-colors" />
              </button>
              <button
                onClick={onConfig}
                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-text-muted hover:text-text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
