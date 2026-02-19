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

function getHubUrl(): string {
  const host = window.location.host;
  // In production, WebSocket goes through Apache proxy at the same host
  // In development, connect directly to localhost:3100
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'ws://localhost:3100';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${host}`;
}

function getApiBase(): string {
  const host = window.location.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:3100';
  }
  return `${window.location.protocol}//${host}`;
}

export function useSynapse(hubUrl: string = getHubUrl()): UseSynapseReturn {
  const [connected, setConnected] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const cursorRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(hubUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);

      // Connect with session token if available, or register new
      const savedSession = sessionTokenRef.current || localStorage.getItem('synapse_session');

      ws.send(JSON.stringify({
        type: 'connect',
        sessionToken: savedSession,
        environment: 'web-dashboard',
        name: 'Control Panel',
        role: 'observer',
        capabilities: ['monitoring', 'admin'],
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;

      // Attempt reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      setError('Connection failed');
      setConnected(false);
    };
  }, [hubUrl]);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'connected':
        // Save session for reconnection
        if (message.sessionToken) {
          sessionTokenRef.current = message.sessionToken;
          localStorage.setItem('synapse_session', message.sessionToken);
        }
        // Set initial blueprint
        if (message.blueprint) {
          setBlueprint(message.blueprint);
          cursorRef.current = message.blueprint.cursor || 0;
        }
        break;

      case 'blueprint':
        setBlueprint(message);
        cursorRef.current = message.cursor || 0;
        break;

      case 'agent_connected':
        setBlueprint(prev => {
          if (!prev) return prev;
          const exists = prev.agents.some(a => a.id === message.agent.id);
          if (exists) return prev;
          return {
            ...prev,
            agents: [...prev.agents, message.agent],
          };
        });
        addEvent({ type: 'agent_connected', data: message });
        break;

      case 'agent_disconnected':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            agents: prev.agents.map(a =>
              a.id === message.agentId ? { ...a, isOnline: false } : a
            ),
          };
        });
        addEvent({ type: 'agent_disconnected', data: message });
        break;

      case 'agent_updated':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            agents: prev.agents.map(a =>
              a.id === message.agent.id ? message.agent : a
            ),
          };
        });
        addEvent({ type: 'agent_updated', data: message });
        break;

      case 'intent_broadcast':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            intents: [...prev.intents, message.intent],
          };
        });
        addEvent({ type: 'intent_broadcast', data: message });
        break;

      case 'intent_completed':
      case 'intent_cancelled':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            intents: prev.intents.filter(i => i.id !== message.intent.id),
          };
        });
        addEvent({ type: message.type, data: message });
        break;

      case 'lock_acquired':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            locks: [...prev.locks, {
              id: message.lockId,
              agentId: message.agentId,
              targetPath: message.target?.path,
              targetType: message.target?.type,
            }],
          };
        });
        addEvent({ type: 'lock_acquired', data: message });
        break;

      case 'lock_released':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            locks: prev.locks.filter(l => l.id !== message.lockId),
          };
        });
        addEvent({ type: 'lock_released', data: message });
        break;

      case 'file_modified':
        setBlueprint(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            files: {
              ...prev.files,
              [message.path]: {
                path: message.path,
                version: message.version,
                checksum: message.checksum,
                lastModifiedBy: message.agentId,
              },
            },
          };
        });
        addEvent({ type: 'file_modified', data: message });
        break;

      case 'error':
        setError(message.message);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        // For any other event type, just add to events
        if (message.type && message.data) {
          addEvent(message);
        }
    }
  }, []);

  const addEvent = useCallback((event: any) => {
    const fullEvent: Event = {
      id: event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: event.type,
      data: event.data || event,
      timestamp: Date.now(),
      cursor: cursorRef.current++,
    };
    setEvents(prev => [...prev.slice(-99), fullEvent]);
  }, []);

  // Update agent via HTTP API
  const updateAgent = useCallback(async (agentId: string, updates: Partial<Agent>) => {
    try {
      const response = await fetch(`${getApiBase()}/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionTokenRef.current || '',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
    } catch (e) {
      console.error('Failed to update agent:', e);
      throw e;
    }
  }, []);

  // Send intent via WebSocket
  const sendIntent = useCallback((intent: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'intent',
        ...intent,
      }));
    }
  }, []);

  // Initial connection
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Periodic blueprint refresh as fallback
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!connected) return;

      try {
        const response = await fetch(`${getApiBase()}/api/blueprint`, {
          headers: {
            'X-Session-Token': sessionTokenRef.current || '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.cursor > cursorRef.current) {
            setBlueprint(data);
            cursorRef.current = data.cursor;
          }
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connected]);

  return {
    connected,
    blueprint,
    events,
    error,
    reconnect: connect,
    updateAgent,
    sendIntent,
  };
}
