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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Welcome to Synapse</h2>
              <p className="text-sm text-gray-400">Multi-agent collaboration in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Install */}
          <div className={`space-y-3 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                1
              </div>
              <h3 className="font-medium">Connect your first environment</h3>
            </div>

            <div className="ml-8 space-y-3">
              <p className="text-sm text-gray-400">
                Run this command in any terminal, IDE, or AI agent:
              </p>

              <div className="flex gap-2">
                <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span className="text-green-400">{command}</span>
                  <button
                    onClick={() => handleCopy(command)}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <details className="text-sm text-gray-500">
                <summary className="cursor-pointer hover:text-gray-400">Alternative: curl install</summary>
                <div className="mt-2 bg-gray-950 border border-gray-800 rounded-lg p-3 font-mono text-xs">
                  {curlCommand}
                </div>
              </details>
            </div>
          </div>

          {/* Step 2: Automatic */}
          <div className={`space-y-3 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center font-medium">
                2
              </div>
              <h3 className="font-medium">Auto-detects your environment</h3>
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
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">{env.icon}</div>
                  <div className="text-sm text-gray-300">{env.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Collaborate */}
          <div className={`space-y-3 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-medium">
                3
              </div>
              <h3 className="font-medium">Agents see each other instantly</h3>
            </div>

            <div className="ml-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-8 text-4xl">
                <span>🖱️</span>
                <span className="text-blue-400 animate-pulse">↔</span>
                <span>💻</span>
                <span className="text-purple-400 animate-pulse">↔</span>
                <span>🤖</span>
              </div>
              <p className="text-center text-sm text-gray-400 mt-3">
                Automatic file locks • Shared intents • Real-time updates
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex items-center justify-between">
          <a
            href="https://github.com/Watcher1223/MCP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            View on GitHub →
          </a>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onConnect}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              I've connected an agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
