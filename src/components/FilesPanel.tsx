import { useState } from 'react';
import { FileText, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import type { FileState } from '../types';

interface FilesPanelProps {
  files: Record<string, FileState>;
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

function FileTreeNode({ node, depth = 0, onSelect }: { node: FileNode; depth?: number; onSelect: (file: FileState) => void }) {
  const [expanded, setExpanded] = useState(true);

  if (node.isFile) {
    return (
      <button
        onClick={() => node.file && onSelect(node.file)}
        className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-700 rounded text-left"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="text-sm text-gray-300 truncate">{node.name}</span>
        <span className="text-xs text-gray-500 ml-auto">v{node.file?.version}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-700 rounded"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
        <Folder className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <span className="text-sm text-gray-300">{node.name}</span>
      </button>
      {expanded && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilesPanel({ files }: FilesPanelProps) {
  const [selectedFile, setSelectedFile] = useState<FileState | null>(null);
  const tree = buildFileTree(files);
  const fileCount = Object.keys(files).length;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-synapse-400" />
          <h2 className="font-semibold text-white">Files</h2>
        </div>
        <span className="text-sm text-gray-400">{fileCount} files</span>
      </div>

      {selectedFile ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-sm text-white truncate">{selectedFile.path}</div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Version: {selectedFile.version} | Modified by: {selectedFile.lastModifiedBy?.slice(0, 8) || 'Unknown'}
          </div>
          <pre className="text-xs text-gray-300 font-mono bg-gray-900 rounded p-3 overflow-auto max-h-64">
            {selectedFile.content}
          </pre>
        </div>
      ) : (
        <div className="p-2 max-h-64 overflow-y-auto">
          {tree.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No files in working memory
            </div>
          ) : (
            tree.map((node) => (
              <FileTreeNode key={node.path} node={node} onSelect={setSelectedFile} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
