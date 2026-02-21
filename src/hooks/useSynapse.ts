import { useState, useEffect, useCallback, useRef } from 'react';
import type { Blueprint, Event, Agent } from '../types';

interface Workspace {
  id: string;
  name: string;
  agents: number;
  target: string | null;
  created: number;
}

interface UseSynapseReturn {
  connected: boolean;
  blueprint: Blueprint | null;
  events: Event[];
  error: string | null;
  reconnect: () => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<void>;
  sendIntent: (intent: any) => void;
  // Workspace features
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  selectWorkspace: (id: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

// MCP-use deployed backend URL
const MCP_USE_API = 'https://shiny-credit-ak9lb.run.mcp-use.com';

function getApiBase(): string {
  const host = window.location.host;

  // Local development - API is on port 3200
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:3200';
  }

  // Production: use the mcp-use deployed backend
  return MCP_USE_API;
}

export function useSynapse(): UseSynapseReturn {
  const [connected, setConnected] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const versionRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get workspace ID from state or localStorage
  const getWorkspaceId = useCallback((): string | null => {
    if (currentWorkspace) return currentWorkspace.id;
    const stored = localStorage.getItem('stigmergy_workspace_id');
    return stored;
  }, [currentWorkspace]);

  // Convert server state to Blueprint format
  const convertToBlueprint = useCallback((data: any): Blueprint => {
    return {
      agents: (data.agents || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        role: a.role || 'coder',
        environment: a.client || 'terminal',
        capabilities: a.capabilities || [],
        isOnline: a.status !== 'offline',
        currentTask: a.currentTask,
        status: a.status,
        autonomous: a.autonomous,
        lastSeen: a.lastSeen,
      })),
      intents: (data.intents || []).map((i: any) => ({
        id: i.id,
        agentId: i.agentId,
        action: i.action,
        description: i.description,
        targets: i.targets || [],
        status: i.action === 'completed' ? 'completed' : 'active',
        timestamp: i.timestamp,
        createdAt: i.timestamp,
      })),
      locks: (data.locks || []).map((l: any) => ({
        id: l.path || l.id,
        agentId: l.agentId,
        targetPath: l.path,
        targetType: 'file',
        agentName: l.agentName,
        client: l.client,
        intent: l.reason,
      })),
      files: {},
      workQueue: data.workQueue || [],
      target: data.target,
      cursor: data.version || 0,
    };
  }, []);

  // Fetch workspaces list
  const refreshWorkspaces = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/workspaces`);
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.workspaces || []);

        // If no current workspace, try to restore from localStorage
        const storedId = localStorage.getItem('stigmergy_workspace_id');
        if (!currentWorkspace && storedId) {
          const found = data.workspaces?.find((w: Workspace) => w.id === storedId);
          if (found) {
            setCurrentWorkspace(found);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch workspaces:', e);
    }
  }, [currentWorkspace]);

  // Create workspace (resets backend state for fresh start)
  const createWorkspace = useCallback(async (name: string): Promise<Workspace | null> => {
    try {
      const response = await fetch(`${getApiBase()}/api/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, reset: true }),
      });
      if (response.ok) {
        const data = await response.json();
        const newWorkspace: Workspace = {
          id: data.id,
          name: name, // Use the name we sent, not demo name
          agents: 0,
          target: null,
          created: Date.now(),
        };
        // Clear old state
        setBlueprint(null);
        setEvents([]);
        versionRef.current = 0;
        // Set new workspace
        setWorkspaces([newWorkspace]);
        setCurrentWorkspace(newWorkspace);
        localStorage.setItem('stigmergy_workspace_id', newWorkspace.id);
        return newWorkspace;
      }
    } catch (e) {
      console.error('Failed to create workspace:', e);
      setError('Failed to create workspace. Check API connection.');
    }
    return null;
  }, []);

  // Select workspace
  const selectWorkspace = useCallback((id: string) => {
    const found = workspaces.find(w => w.id === id);
    if (found) {
      setCurrentWorkspace(found);
      localStorage.setItem('stigmergy_workspace_id', id);
      versionRef.current = 0; // Reset version to fetch full state
    }
  }, [workspaces]);

  // Poll for changes
  const poll = useCallback(async () => {
    const wsId = getWorkspaceId();
    if (!wsId) return;

    try {
      const url = `${getApiBase()}/api/workspaces/${wsId}/changes?since=${versionRef.current}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          // Workspace not found, clear selection
          localStorage.removeItem('stigmergy_workspace_id');
          setCurrentWorkspace(null);
          setError('Workspace not found');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await response.json();

      if (!connected) {
        setConnected(true);
        setError(null);
      }

      if (data.changed) {
        versionRef.current = data.version;
        const bp = convertToBlueprint(data);
        setBlueprint(bp);

        // Update current workspace info
        if (currentWorkspace) {
          setCurrentWorkspace(prev => prev ? {
            ...prev,
            target: data.target,
            agents: data.agents?.length || 0,
          } : null);
        }

        // Add new intents as events
        data.intents?.forEach((intent: any) => {
          if (intent.timestamp > Date.now() - 5000) {
            setEvents(prev => {
              const exists = prev.some(e => e.id === intent.id);
              if (exists) return prev;
              return [...prev.slice(-99), {
                id: intent.id,
                type: intent.action === 'handoff' ? 'handoff' :
                      intent.action === 'completed' ? 'work_completed' :
                      intent.action === 'target_set' ? 'target_set' : 'intent',
                data: intent,
                timestamp: intent.timestamp,
                cursor: versionRef.current,
              }];
            });
          }
        });
      }
    } catch (e) {
      if (connected) {
        setConnected(false);
        setError('Connection lost. Retrying...');
      }
    }
  }, [connected, convertToBlueprint, getWorkspaceId, currentWorkspace]);

  // Initial fetch
  const fetchState = useCallback(async () => {
    const wsId = getWorkspaceId();
    if (!wsId) {
      // No workspace selected, just fetch workspace list
      await refreshWorkspaces();
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/workspaces/${wsId}`);
      if (response.ok) {
        const data = await response.json();
        versionRef.current = data.version;
        setBlueprint(convertToBlueprint(data));
        setConnected(true);
        setError(null);

        // Update current workspace
        setCurrentWorkspace({
          id: data.id,
          name: data.name,
          agents: data.agents?.length || 0,
          target: data.target,
          created: 0,
        });
      } else if (response.status === 404) {
        localStorage.removeItem('stigmergy_workspace_id');
        setCurrentWorkspace(null);
        await refreshWorkspaces();
      }
    } catch (e) {
      setError('Cannot connect to Stigmergy server');
      setConnected(false);
    }
  }, [convertToBlueprint, getWorkspaceId, refreshWorkspaces]);

  // Initialize
  useEffect(() => {
    refreshWorkspaces();
    fetchState();

    pollIntervalRef.current = setInterval(poll, 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Re-fetch when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchState();
    }
  }, [currentWorkspace?.id]);

  const reconnect = useCallback(() => {
    setError(null);
    refreshWorkspaces();
    fetchState();
  }, [fetchState, refreshWorkspaces]);

  const updateAgent = useCallback(async (_agentId: string, _updates: Partial<Agent>) => {
    console.log('updateAgent not implemented');
  }, []);

  const sendIntent = useCallback((_intent: any) => {
    console.log('sendIntent not implemented - use MCP tools');
  }, []);

  return {
    connected,
    blueprint,
    events,
    error,
    reconnect,
    updateAgent,
    sendIntent,
    workspaces,
    currentWorkspace,
    createWorkspace,
    selectWorkspace,
    refreshWorkspaces,
  };
}
