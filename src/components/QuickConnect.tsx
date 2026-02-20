import { useState } from 'react';
import { X, Zap, Copy, Check } from 'lucide-react';

interface QuickConnectProps {
  onConnect: () => void;
  onClose: () => void;
}

export default function QuickConnect({ onConnect, onClose }: QuickConnectProps) {
  const [copied, setCopied] = useState(false);
  const step = 3; // All steps visible

  const command = 'npx synapse connect';
  const curlCommand = 'curl -fsSL https://synapse.run/install | bash';

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="panel-card max-w-2xl w-full overflow-hidden shadow-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-elevated/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-teal rounded-xl flex items-center justify-center shadow-lg shadow-accent-gold/10">
              <Zap className="w-5 h-5 text-surface-deep" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Welcome to Synapse</h2>
              <p className="text-sm text-text-muted">Multi-agent collaboration in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className={`space-y-3 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent-teal text-surface-deep text-sm flex items-center justify-center font-medium">
                1
              </div>
              <h3 className="font-medium text-text-primary">Connect your first environment</h3>
            </div>

            <div className="ml-8 space-y-3">
              <p className="text-sm text-text-secondary">
                Run this command in any terminal, IDE, or AI agent:
              </p>

              <div className="flex gap-2">
                <div className="flex-1 bg-surface-deep border border-surface-border rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span className="text-emerald-400">{command}</span>
                  <button
                    onClick={() => handleCopy(command)}
                    className="p-1.5 hover:bg-surface-elevated rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                </div>
              </div>

              <details className="text-sm text-text-muted">
                <summary className="cursor-pointer hover:text-text-secondary">Alternative: curl install</summary>
                <div className="mt-2 bg-surface-deep border border-surface-border rounded-lg p-3 font-mono text-xs text-accent-teal">
                  {curlCommand}
                </div>
              </details>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`space-y-3 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent-gold text-surface-deep text-sm flex items-center justify-center font-medium">
                2
              </div>
              <h3 className="font-medium text-text-primary">Auto-detects your environment</h3>
            </div>

            <div className="ml-8 grid grid-cols-3 gap-3">
              {[
                { name: 'Cursor', icon: '🖱️' },
                { name: 'VS Code', icon: '💻' },
                { name: 'Terminal', icon: '⌨️' },
                { name: 'Claude', icon: '🤖' },
                { name: 'ChatGPT', icon: '💬' },
                { name: 'Web', icon: '🌐' },
              ].map(env => (
                <div
                  key={env.name}
                  className="bg-surface-elevated/50 border border-surface-border rounded-lg p-3 text-center hover:border-accent-gold/20 transition-colors"
                >
                  <div className="text-2xl mb-1">{env.icon}</div>
                  <div className="text-sm text-text-secondary">{env.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className={`space-y-3 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-surface-deep text-sm flex items-center justify-center font-medium">
                3
              </div>
              <h3 className="font-medium text-text-primary">Agents see each other instantly</h3>
            </div>

            <div className="ml-8 bg-gradient-to-r from-accent-gold/10 to-accent-teal/10 border border-accent-gold/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-8 text-4xl">
                <span>🖱️</span>
                <span className="text-accent-gold animate-pulse">↔</span>
                <span>💻</span>
                <span className="text-accent-teal animate-pulse">↔</span>
                <span>🤖</span>
              </div>
              <p className="text-center text-sm text-text-muted mt-3">
                Automatic file locks • Shared intents • Real-time updates
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-border flex items-center justify-between bg-surface-elevated/20">
          <a
            href="https://github.com/Watcher1223/MCP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-accent-teal transition-colors"
          >
            View on GitHub →
          </a>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onConnect}
              className="px-6 py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-surface-deep rounded-lg font-medium transition-colors"
            >
              I've connected an agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
