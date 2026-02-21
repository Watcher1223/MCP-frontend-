import { useState } from 'react';
import { FileText, ChevronRight, ChevronDown, Folder, Lock, Unlock } from 'lucide-react';
import type { FileState, Lock as LockType, Agent } from '../types';

interface FilesPanelProps {
  files: Record<string, FileState>;
  locks?: LockType[];
  agents?: Agent[];
}

interface FileNode {
  name: string;
  path: string;
  isFile: boolean;
  children: FileNode[];
  file?: FileState;
}

function buildFileTree(files: Record<string, FileState>): FileNode[] {
  const root: FileNode[] = [];

  for (const [path, file] of Object.entries(files)) {
    const parts = path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const fullPath = '/' + parts.slice(0, i + 1).join('/');

      let node = current.find(n => n.name === name);

      if (!node) {
        node = {
          name,
          path: fullPath,
          isFile,
          children: [],
          file: isFile ? file : undefined,
        };
        current.push(node);
      }

      current = node.children;
    }
  }

  return root;
}

function getAgentName(agentId: string, agents: Agent[]): string {
  const agent = agents.find(a => a.id === agentId);
  return agent?.name || agentId.slice(0, 8);
}

function FileTreeNode({
  node,
  depth = 0,
  onSelect,
  lockMap,
  agents = [],
}: {
  node: FileNode;
  depth?: number;
  onSelect: (file: FileState) => void;
  lockMap: Map<string, { agentId: string }>;
  agents: Agent[];
}) {
  const [expanded, setExpanded] = useState(true);
  const lock = node.isFile && node.file ? lockMap.get(node.file.path) : null;

  if (node.isFile) {
    return (
      <button
        onClick={() => node.file && onSelect(node.file)}
        className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-surface-elevated rounded-lg text-left transition-colors group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileText className="w-4 h-4 text-accent-teal flex-shrink-0" />
        <span className="text-sm text-text-secondary truncate flex-1">{node.name}</span>
        {lock ? (
          <span className="flex items-center gap-1 text-[10px] text-red-400 shrink-0" title={`Locked by ${getAgentName(lock.agentId, agents)}`}>
            <Lock className="w-3 h-3" />
            LOCKED
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400/80 shrink-0" title="Available">
            <Unlock className="w-3 h-3" />
          </span>
        )}
        <span className="text-xs text-text-muted">v{node.file?.version}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-surface-elevated rounded-lg transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
        <Folder className="w-4 h-4 text-accent-gold flex-shrink-0" />
        <span className="text-sm text-text-secondary">{node.name}</span>
      </button>
      {expanded && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              lockMap={lockMap}
              agents={agents}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilesPanel({ files, locks = [], agents = [] }: FilesPanelProps) {
  const [selectedFile, setSelectedFile] = useState<FileState | null>(null);
  const tree = buildFileTree(files);
  const fileCount = Object.keys(files).length;

  const lockMap = new Map<string, { agentId: string }>();
  locks.forEach((lock) => {
    const path = lock.target?.path || lock.targetPath;
    if (path) lockMap.set(path, { agentId: lock.agentId });
  });

  return (
    <div className="panel-card overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent-teal" />
          <h2 className="font-semibold text-text-primary">Shared Context</h2>
        </div>
        <span className="text-xs text-text-muted">{fileCount} files</span>
      </div>

      {selectedFile ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-sm text-text-primary truncate">{selectedFile.path}</div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              Close
            </button>
          </div>
          <div className="text-xs text-text-muted mb-2">
            Version: {selectedFile.version} | Modified by: {selectedFile.lastModifiedBy?.slice(0, 8) || 'Unknown'}
          </div>
          <pre className="text-xs text-text-secondary font-mono bg-surface-deep rounded-lg p-3 overflow-auto max-h-64 border border-surface-border">
            {selectedFile.content}
          </pre>
        </div>
      ) : (
        <div className="p-2 max-h-64 overflow-y-auto">
          {tree.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-muted text-sm">
              No files in working memory
            </div>
          ) : (
            tree.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                onSelect={setSelectedFile}
                lockMap={lockMap}
                agents={agents}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
