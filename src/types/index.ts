export interface Agent {
  id: string;
  name: string;
  type: 'realtime' | 'stateless' | 'observer';
  role: 'planner' | 'coder' | 'tester' | 'refactor' | 'observer';
  capabilities: string[];
  connectedAt: number;
  lastSeen: number;
  cursor: number;
}

export interface Lock {
  id: string;
  agentId: string;
  target: {
    type: string;
    path: string;
    identifier?: string;
  };
  acquiredAt: number;
  ttl: number;
  expiresAt: number;
  intent?: string;
}

export interface Intent {
  id: string;
  agentId: string;
  action: string;
  targets: string[];
  description: string;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'blocked';
  dependencies: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FileState {
  path: string;
  content: string;
  version: number;
  lastModifiedBy: string;
  lastModifiedAt: number;
  checksum: string;
}

export interface Event {
  id: string;
  cursor: number;
  type: string;
  agentId: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface Blueprint {
  version: number;
  timestamp: number;
  agents: Agent[];
  locks: Lock[];
  intents: Intent[];
  files: Record<string, FileState>;
  cursor: number;
}
