import { useState } from 'react';
import { X, Zap, Copy, Check } from 'lucide-react';

interface QuickConnectProps {
  onConnect: () => void;
  onClose: () => void;
}

export default function QuickConnect({ onConnect, onClose }: QuickConnectProps) {
  const [copied, setCopied] = useState(false);

  const command = 'npx synapse connect';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="panel-card max-w-xl w-full overflow-hidden shadow-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-elevated/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-teal rounded-xl flex items-center justify-center shadow-lg shadow-accent-gold/10">
              <Zap className="w-5 h-5 text-surface-deep" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Connect in one command</h2>
              <p className="text-sm text-text-muted">ChatGPT · Claude · Cursor · Same project, shared context</p>
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
        <div className="p-6 space-y-5">
          <p className="text-sm text-text-secondary">
            Run this in any terminal, IDE, or AI agent. No config files. No setup friction.
          </p>

          <div className="flex gap-2">
            <div className="flex-1 bg-surface-deep border border-surface-border rounded-xl p-4 font-mono text-sm flex items-center justify-between">
              <span className="text-emerald-400">{command}</span>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-text-muted" />
                )}
              </button>
            </div>
          </div>

          {/* The Handoff Demo */}
          <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/5 p-4">
            <h3 className="text-sm font-medium text-accent-gold mb-3">The Relentless Handoff</h3>
            <div className="space-y-2 text-xs text-text-secondary">
              <p><span className="text-accent-gold">ChatGPT</span>: &quot;We need a Login page.&quot; → Synapse updates target.</p>
              <p><span className="text-accent-teal">Claude</span>: Sees target, creates auth.ts, <span className="text-red-400">locks</span> the file.</p>
              <p><span className="text-accent-teal">Cursor</span>: Sidebar shows &quot;<span className="text-red-400">LOCKED BY CLAUDE</span>&quot;.</p>
              <p>Claude finishes → Unlocks → Posts: &quot;API ready at /login.&quot;</p>
              <p>Cursor: Lock turns <span className="text-emerald-400">green</span>. &quot;Building the Form UI.&quot;</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border flex items-center justify-end gap-3 bg-surface-elevated/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onConnect}
            className="px-6 py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-surface-deep rounded-lg font-medium transition-colors"
          >
            I&apos;ve connected an agent
          </button>
        </div>
      </div>
    </div>
  );
}
