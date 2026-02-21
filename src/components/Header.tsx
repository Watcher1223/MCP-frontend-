import { WifiOff, Settings, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  error: string | null;
  onReconnect: () => void;
  onConfig: () => void;
  agentCount?: number;
}

// Product branding
const PRODUCT_NAME = 'Stigmergy';
const PRODUCT_TAGLINE = 'Autonomous Agent Coordination';

export default function Header({
  connected,
  error,
  onReconnect,
  onConfig,
  agentCount = 0,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">{PRODUCT_NAME}</h1>
                <p className="text-xs text-white/40 tracking-wide">
                  {PRODUCT_TAGLINE}
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connected ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm text-emerald-400 font-medium">Connected</span>
                  {agentCount > 0 && (
                    <span className="text-xs text-emerald-400/60 ml-1">
                      · {agentCount} agent{agentCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error || 'Disconnected'}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onReconnect}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                title="Reconnect"
              >
                <RefreshCw className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={onConfig}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
