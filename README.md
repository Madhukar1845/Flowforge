# FlowForge

A visual workflow automation engine — build "when X happens, do Y" pipelines on a drag-and-drop canvas, backed by a DAG compiler, a real job queue, and genuine parallel execution. Think of it as a self-hosted, from-scratch alternative to n8n/Zapier, built to understand *how* these systems actually work under the hood rather than to wrap an existing framework.

## What it does

Drag nodes onto a canvas (Schedule, HTTP, Filter, Slack), connect them with edges, configure each one, hit **Save** then **Run** — and a real backend compiles your graph, validates it, executes it through a job queue with genuine parallelism where possible, and triggers real external side effects (a real Slack message, sent through a real webhook).

**Example workflow:**

```
Schedule → HTTP (fetch products) → Filter (price < 50) → Slack ("3 cheap products found")
```

## Why this isn't a tutorial clone

Most "build your own workflow engine" tutorials import a graph library and fake the execution with `setTimeout`. FlowForge doesn't:

- **The DAG compiler is written from scratch** — cycle detection (three-color DFS) and topological sort (Kahn's algorithm with wave-grouping for parallelism) are hand-implemented, not imported from a library.
- **State passes between nodes through Redis**, not in-memory JS objects — because nodes execute as independent BullMQ jobs, potentially on different workers, with no shared memory. Each node reads its dependencies' output from Redis and writes its own back.
- **Failure isolation is a deliberate design choice.** One node failing doesn't crash the whole run — `Promise.allSettled` (not `Promise.all`) ensures a wave's other nodes still complete, and failures are reported per-node rather than as an opaque crash.
- **Template resolution is hand-rolled** — `{{filteredProducts.length}}`-style placeholders in node configs are resolved against live execution data via a small regex + dotted-path walker, not a templating library.
- **Real external integration** — the Slack node makes a genuine `fetch` POST to a real Slack Incoming Webhook, not a mocked response.

## Architecture

```
React Flow canvas (drag/drop, config panel)
        │  Save/Run
        ▼
Express API (POST /workflows, POST /workflows/:id/run, GET /runs/:runId)
        │
        ▼
nodesToGraph → compile (cycle check + wave-grouped topo sort)
        │
        ▼
BullMQ queue → workers execute each wave in parallel, waiting for the
        │        whole wave before advancing to the next
        ▼
Executors (schedule / http / filter / slack) read/write shared state
        │        via Redis, resolve {{templates}} against it
        ▼
MongoDB persists the workflow definition and every run's outcome
```

## Tech stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Redis, BullMQ
**Frontend:** React, React Flow (`@xyflow/react`), Vite
**Infra:** Docker (Redis), MongoDB Atlas (or local)

## Project structure

```
FlowForge/
├── backend/
│   ├── engine/
│   │   ├── hasCycle.js       # cycle detection (three-color DFS)
│   │   ├── topoWaves.js       # topological sort, wave-grouped for parallelism
│   │   ├── nodesToGraph.js    # converts node list (dependsOn) → adjacency graph
│   │   ├── compile.js         # ties cycle check + topo sort together
│   │   ├── context.js         # Redis-backed state passing between nodes
│   │   ├── templates.js       # {{path}} placeholder resolution
│   │   ├── executors.js       # per-node-type execution logic
│   │   └── queue.js           # BullMQ wave-based parallel execution
│   ├── api/
│   │   ├── server.js          # Express routes
│   │   └── db.js              # MongoDB connection
│   ├── models/                # Workflow, Run schemas
│   └── test/                  # manual verification scripts written during development
└── frontend/
    └── src/
        ├── App.jsx             # canvas, save/run, layout
        ├── Sidebar.jsx         # draggable node-type palette
        ├── ConfigPanel.jsx     # per-node configuration form
        └── nodes/              # custom node components (Schedule/HTTP/Filter/Slack)
```

## Running it locally

**Prerequisites:** Node.js, Docker (for Redis), a MongoDB URI (local or Atlas)

**1. Redis**
```bash
docker run --name flowforge-redis -p 6379:6379 -d redis
```

**2. Backend**
```bash
cd backend
npm install
```
Create `backend/.env`:
```
PORT=3000
MONGO_URI=<your-mongodb-uri>
SLACK_WEBHOOK_URL=<your-slack-incoming-webhook-url>
```
```bash
node api/server.js
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
Open the local URL Vite prints (typically `http://localhost:5173`).

## Using it

1. Drag **Schedule → HTTP → Filter → Slack** onto the canvas
2. Connect them in order (drag from each node's bottom handle to the next node's top handle)
3. Click the **Filter** node, set Field: `price`, Operator: `<`, Threshold: `50`
4. Click the **Slack** node, set your webhook URL and a message like `{{filteredProducts.length}} cheap products found`
5. Click **Save**, then **Run**
6. Check your Slack channel for the message

## Known simplifications

- The `http` executor currently returns fixed sample data rather than calling a real external API — swapping in a real `fetch(node.config.url)` is a small, isolated change.
- No authentication — reasonable for a local demo/portfolio project; a shared-secret API key middleware would be the minimal addition before any public deployment.
- The filter condition supports a single field/operator/threshold rather than arbitrary boolean expressions — a deliberate scope cut to keep the DAG/execution engine as the focus rather than building a full expression parser.

## What I'd build next

- A run-history view in the UI (the `GET /runs/:runId` endpoint already exists on the backend)
- Loading an existing saved workflow back onto the canvas for editing
- Real HTTP fetching and additional node types (email, conditional branching)