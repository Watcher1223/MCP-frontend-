import { useState, useEffect, useCallback, useRef } from 'react';
import type { Blueprint, Event } from '../types';

interface UseSynapseReturn {
  connected: boolean;
  blueprint: Blueprint | null;
  events: Event[];
  error: string | null;
  reconnect: () => void;
}

export function useSynapse(hubUrl: string = 'ws://localhost:3100'): UseSynapseReturn {
  const [connected, setConnected] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const cursorRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(hubUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);

      // Register as observer
      ws.send(JSON.stringify({
        type: 'register',
        agent: {
          id: 'control-panel-' + Date.now(),
          name: 'Control Panel',
          type: 'observer',
          role: 'observer',
          capabilities: ['monitoring'],
        },
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'registered':
            cursorRef.current = message.cursor;
            // Request full blueprint
            ws.send(JSON.stringify({ type: 'get_blueprint' }));
            // Subscribe to all events
            ws.send(JSON.stringify({ type: 'subscribe' }));
            break;

          case 'blueprint':
            setBlueprint(message.blueprint);
            break;

          case 'event':
            cursorRef.current = message.event.cursor;
            setEvents((prev) => [...prev.slice(-99), message.event]);

            // Update blueprint incrementally
            if (message.event.type === 'agent_connected' && blueprint) {
              setBlueprint({
                ...blueprint,
                agents: [...blueprint.agents, message.event.data.agent],
              });
            }
            break;
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Attempt reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setError('Connection failed');
      setConnected(false);
    };
  }, [hubUrl, blueprint]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Poll for blueprint updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3100/api/blueprint`);
        if (response.ok) {
          const data = await response.json();
          setBlueprint(data.blueprint || data);
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    connected,
    blueprint,
    events,
    error,
    reconnect: connect,
  };
}
