import { useState, useEffect, useCallback, useRef } from 'react';
import type { Blueprint, Event, Agent } from '../types';

interface UseSynapseReturn {
  connected: boolean;
  blueprint: Blueprint | null;
  events: Event[];
  error: string | null;
  reconnect: () => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<void>;
  sendIntent: (intent: any) => void;
}

function getApiBase(): string {
  const host = window.location.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    // HTTP API is on port 3201
    return 'http://localhost:3201';
  }
  return `${window.location.protocol}//${host}`;
}

export function useSynapse(): UseSynapseReturn {
  const [connected, setConnected] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Poll for changes
  const poll = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/changes?since=${versionRef.current}`);

      if (!response.ok) {
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
  }, [connected, convertToBlueprint]);

  // Initial fetch
  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/state`);
      if (response.ok) {
        const data = await response.json();
        versionRef.current = data.version;
        setBlueprint(convertToBlueprint(data));
        setConnected(true);
        setError(null);
      }
    } catch (e) {
      setError('Cannot connect to Synapse server');
      setConnected(false);
    }
  }, [convertToBlueprint]);

  // Start polling
  useEffect(() => {
    fetchState();

    pollIntervalRef.current = setInterval(poll, 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchState, poll]);

  const reconnect = useCallback(() => {
    setError(null);
    fetchState();
  }, [fetchState]);

  const updateAgent = useCallback(async (_agentId: string, _updates: Partial<Agent>) => {
    // Not implemented for new server
    console.log('updateAgent not implemented');
  }, []);

  const sendIntent = useCallback((_intent: any) => {
    // Not implemented for new server - use MCP tools instead
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
  };
}
