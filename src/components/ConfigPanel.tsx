import { useState } from 'react';
import { X, Play, Square, RefreshCw } from 'lucide-react';

interface ConfigPanelProps {
  onClose: () => void;
}

export default function ConfigPanel({ onClose }: ConfigPanelProps) {
  const [hubUrl, setHubUrl] = useState('http://localhost:3100');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  const runDemo = async () => {
    setRunning(true);
    setOutput(['Starting Synapse demo...']);

    try {
      // Reset the hub state
      await fetch(`${hubUrl}/api/reset`, { method: 'POST' });
      setOutput(prev => [...prev, 'Hub state reset']);

      // The actual demo would be run via the terminal
      // This is a placeholder for the frontend to show status
      setOutput(prev => [...prev, 'Demo scenarios running...', 'Connect to the hub to see real-time events']);
    } catch (error: any) {
      setOutput(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setRunning(false);
    }
  };

  const resetHub = async () => {
    try {
      await fetch(`${hubUrl}/api/reset`, { method: 'POST' });
      setOutput(['Hub state reset successfully']);
    } catch (error: any) {
      setOutput([`Error: ${error.message}`]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="panel-card w-full max-w-2xl overflow-hidden">
        <div className="panel-header bg-surface-elevated/50">
          <h2 className="font-semibold text-text-primary">Configuration</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Hub URL
            </label>
            <input
              type="text"
              value={hubUrl}
              onChange={(e) => setHubUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-deep border border-surface-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={runDemo}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-gold hover:bg-accent-gold/90 disabled:opacity-50 rounded-lg text-surface-deep font-medium transition-colors"
            >
              {running ? (
                <>
                  <Square className="w-4 h-4" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Demo
                </>
              )}
            </button>

            <button
              onClick={resetHub}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-elevated hover:bg-surface-border/50 border border-surface-border rounded-lg text-text-primary font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Hub
            </button>
          </div>

          {output.length > 0 && (
            <div className="bg-surface-deep rounded-lg p-4 font-mono text-sm border border-surface-border">
              {output.map((line, i) => (
                <div key={i} className="text-text-secondary">{line}</div>
              ))}
            </div>
          )}

          <div className="bg-surface-deep/50 rounded-lg p-4 border border-surface-border">
            <h3 className="text-sm font-medium text-text-secondary mb-3">How to Run</h3>
            <div className="space-y-2 text-sm text-text-muted">
              <p>1. Start the hub:</p>
              <code className="block bg-surface-mid px-3 py-2 rounded-lg font-mono text-accent-teal">npm run dev:hub</code>
              <p>2. Run the demo scenarios:</p>
              <code className="block bg-surface-mid px-3 py-2 rounded-lg font-mono text-accent-teal">npm run demo</code>
              <p>3. Or run individual tests:</p>
              <code className="block bg-surface-mid px-3 py-2 rounded-lg font-mono text-accent-teal">npm run test</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
