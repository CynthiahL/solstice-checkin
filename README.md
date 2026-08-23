# Solstice Events Co. • Asynchronous Check-In Kiosk Node

An event-driven, microservices-based kiosk check-in network designed to scale under concurrent traffic. Developed to replace a legacy synchronous REST architecture, this system uses an **asynchronous event queue + webhook notification model** to handle physical badge-printer integrations without blocking thread execution lifecycles.

---

## 🏗️ Architectural Evolution: Sync vs. Async Pivot

| Architecture Layer | Legacy Synchronous Model | Modern Asynchronous Engine (This System) |
| :--- | :--- | :--- |
| **API Lifecycle** | `POST /print` (Blocks network request loop). | `POST /checkin/scan` (Instantly responds with `202 Accepted`). |
| **Kiosk UI UX** | **Idle** ➔ **Checked In** (UI locks completely). | **Idle** ➔ **Printing (Pending)** ➔ **Checked In** (Optimistic). |
| **Idempotency** | Read-then-write application logic database checks. | **PostgreSQL Distributed Lock Constraints** at scale. |
| **Fault Isolation** | Downstream device crashes crash user checkout loops. | **Durable Message Queuing** with automated retry queues. |

---

## 🛡️ Core Infrastructure Safeguards

* **Atomic Idempotency Engine:** Uses explicit database locks via PostgreSQL updates (`.eq('check_in_status', 'NOT_CHECKED_IN')`) to block concurrent duplicate badge scan requests instantly at the database layer.
* **Cryptographic Transit Security:** Protects the inbound printer vendor callback channel with an `HMAC SHA256` token signature verification handshake, neutralizing transaction spoofing risks.
* **Bi-Directional Real-Time Synchronization:** Integrates a decoupled `Socket.io` event listener network to update the client Kiosk user interface instantly upon out-of-band webhook confirmation.
* **Resilient Queue Topology:** Powered by `Inngest` background functions to isolate heavy external device routing processes entirely out-of-thread from core web pipelines.

---

## ⚙️ Monorepo Workspace Configuration

```text
solstice-checkin-workspace/
├── backend/                  # Node.js + Express API Engine
│   ├── src/
│   │   ├── controller/       # Request and Webhook router logic interceptors
│   │   ├── inngest/          # Background worker function compilation layers
│   │   ├── middleware/       # HMAC Cryptographic signature and API auth guards
│   │   ├── routes/           # Decoupled application network routes
│   │   └── services/         # Atomic data mutation database controllers
│   └── app.js                # App bootstrap orchestration setup
└── frontend/                 # Vite + React Client User Interface
    └── src/
        ├── components/
        │   ├── KioskUI.jsx   # Kiosk state dashboard panel logic
        │   └── Scanner.jsx   # Tabbed Live Camera & Manual Input receiver
```

---

## 🚀 Local Development Setup & Execution

### 1. Environment Configurations (`backend/.env`)
Create a local infrastructure environment variable config file inside your backend directory:
```ini
PORT=3000
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-high-privilege-service-role-key
KIOSK_API_KEY=solstice_kiosk_secret_2026
WEBHOOK_SIGNING_SECRET=vendor_webhook_secret_2026
```

### 2. Launch the Development Services Stack
Run each command sequence in an independent terminal split window from the root project folder:

```bash
# Tab A: Boot up the Express Web API Service Layer
npm run backend:dev

# Tab B: Initialize the Local Inngest Dev Server Loop
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest

# Tab C: Launch the React Client UI Application Engine
npm run frontend:dev
```

Open your browser configuration page view window at: **`http://localhost:5173/`**

---

## 🧪 Verification Matrix Automation Tests

The system architecture includes independent integration suites using `Jest` and `Supertest` running under native Node.js ES Modules to validate system behavior:

```bash
npm run test
```
* `tests/checkin.test.js`: Confirms async 202 Accepted handoffs to background drivers.
* `tests/duplicate.test.js`: Assets duplicate scans trigger `409 Conflict` database lock-outs.
* `tests/webhook.test.js`: Validates cryptographic signature processing on callback routes.
