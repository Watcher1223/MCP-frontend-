# Synapse Control Panel

Real-time dashboard for monitoring and configuring the Synapse multi-agent coordination system.

## Features

- **Live Agent Monitoring**: See all connected agents (realtime, stateless, observer)
- **Event Stream**: Real-time feed of all coordination events
- **Lock Visualization**: View active locks and their TTLs
- **Intent Tracking**: Monitor agent intents and their status
- **File Browser**: Explore the shared working memory files

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The control panel will be available at `http://localhost:5173`

## Requirements

- Node.js 18+
- Synapse Hub running on port 3100

## Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons
