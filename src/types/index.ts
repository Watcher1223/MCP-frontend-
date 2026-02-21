export interface Agent {
  id: string;
  name: string;
  type?: 'realtime' | 'stateless' | 'observer';
  role: 'planner' | 'coder' | 'tester' | 'executor' | 'refactor' | 'observer' | 'backend' | 'frontend';
  environment?: string;
  capabilities?: string[];
  subscriptions?: string[];
  connectedAt?: number;
  lastSeen?: number | Date;
  cursor?: number;
  isOnline?: boolean;
  metadata?: Record<string, any>;
  status?: 'idle' | 'working' | 'waiting' | 'completed' | 'offline';
  currentTask?: string;
  autonomous?: boolean;
}

export interface Lock {
  id: string;
  agentId: string;
  targetPath?: string;
  targetType?: string;
  targetIdentifier?: string;
  target?: {
    type: string;
    path: string;
    identifier?: string;
  };
  acquiredAt?: number;
  ttl?: number;
  expiresAt?: number | Date;
  intent?: string;
  agentName?: string;
  client?: string;
}

export interface Intent {
  id: string;
  agentId: string;
  action: string;
  targets?: string[];
  concepts?: string[];
  description?: string;
  priority?: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'blocked';
  dependencies?: string[];
  result?: any;
  createdAt?: number | Date;
  updatedAt?: number;
  completedAt?: number | Date;
  timestamp?: number | Date;
}

export interface FileState {
  path: string;
  content?: string;
  version: number;
  lastModifiedBy?: string;
  lastModifiedAt?: number;
  checksum?: string;
}

export interface Event {
  id: string;
  cursor: number;
  type: string;
  agentId?: string;
  timestamp: number;
  data: Record<string, any>;
  concepts?: string[];
}

export interface WorkItem {
  id: string;
  description: string;
  forRole: 'backend' | 'frontend' | 'tester' | 'any';
  createdBy: string;
  createdAt: number;
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'completed';
  context?: Record<string, any>;
}

export interface Blueprint {
  version?: number;
  timestamp?: number;
  agents: Agent[];
  locks: Lock[];
  intents: Intent[];
  files: Record<string, FileState>;
  workQueue?: WorkItem[];
  target?: string | null;
  cursor: number;
}

export interface Reaction {
  id: string;
  agentId: string;
  triggerConcepts: string[];
  triggerEventTypes: string[];
  actionType: string;
  actionConfig: Record<string, any>;
  priority: number;
  enabled: boolean;
}
