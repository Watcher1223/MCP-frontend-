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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl m-4">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Configuration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hub URL
            </label>
            <input
              type="text"
              value={hubUrl}
              onChange={(e) => setHubUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-synapse-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={runDemo}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-synapse-600 hover:bg-synapse-500 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Hub
            </button>
          </div>

          {output.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              {output.map((line, i) => (
                <div key={i} className="text-gray-300">{line}</div>
              ))}
            </div>
          )}

          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">How to Run</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>1. Start the hub:</p>
              <code className="block bg-gray-800 px-2 py-1 rounded">npm run dev:hub</code>
              <p>2. Run the demo scenarios:</p>
              <code className="block bg-gray-800 px-2 py-1 rounded">npm run demo</code>
              <p>3. Or run individual tests:</p>
              <code className="block bg-gray-800 px-2 py-1 rounded">npm run test</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
