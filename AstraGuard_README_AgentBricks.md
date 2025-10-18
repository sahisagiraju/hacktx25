# AstraGuard — NorthMark Edition (with AgentBricks)
**Tagline:** *Read the stars. Guard the apex.*  
**Tracks (kept):** **Best NorthMark Hack**, **Best Design**, **Best Celestial-Themed**, **Best Use of ElevenLabs**, **Best Use of Gemini API**, **Best .Tech Domain**

This version **explicitly includes AgentBricks** as the orchestration layer for per-rival agents and system skills.

---

## 🎯 What AstraGuard Does
AstraGuard is a **real-time race strategy copilot**. It runs **per-competitor agents** that learn habits and predict intentions, evaluates **micro-scenarios** (HPC‑lite), **fuses** signals, and **communicates** short, actionable calls via **ElevenLabs** — all while storing context for **Gemini‑powered RAG** strategy validation.

---

## 🧱 System Architecture (AgentBricks Orchestrated)

### High-Level (runtime blocks)
```mermaid
flowchart LR
  A[Telemetry Replay (FastF1 JSON)] --> B[Feature Extractor (Py)]
  B --> C[Intention Model (TCN • ONNXRuntime)]
  B --> D[Micro-Scenario Simulator (HPC-lite)]
  C --> E[Fusion Strategist]
  D --> E
  E --> F[VoiceComm (ElevenLabs • streaming)]
  E --> G[React Celestial UI (Three.js + WS)]
  E --> H[RAG Store (FAISS + SQLite)]
  H --> I[Gemini API (Strategy Q&A)]
```

### AgentBricks Orchestration Graph
```mermaid
flowchart TB
  subgraph Bus[AgentBricks Event Bus]
  end

  subgraph Ingest
    TR[TelemetryReaderAgent] -->|tick_state| Bus
    CR[CommsReaderAgent] -->|radio_text| Bus
  end

  subgraph Per-Rival Loop
    FW[RivalWatcherAgent[j]] -->|intent_logits| Bus
    MS[MicroScenarioSimAgent[j]] -->|scenario_scores| Bus
    AD[AnomalyAgent[j]] -->|anomaly_flags| Bus
  end

  CR --> NLP[CommsNLPAgent] -->|comms_logits| Bus
  Bus --> FUS[FusionStrategistAgent] -->|alert| Bus
  Bus --> RAG[RAGIndexerAgent]        %% logs alerts + context
  FUS --> VC[VoiceCommAgent (ElevenLabs)]
  FUS --> UI[UIBridgeAgent (WebSocket)]
  QRY[RAGQueryAgent] -->|LLM prompt| GEM[Gemini API] -->|answer| UI
```

**Key ideas:**
- **One RivalWatcherAgent per opponent** runs at 10–20 Hz.  
- Agents communicate via an **event bus** (in-process dispatcher or Redis pub/sub).  
- **FusionStrategistAgent** subscribes to `{intent, scenario, anomaly, comms}` and publishes **alerts**.  
- **RAGIndexerAgent** persists alerts + windows to **FAISS/SQLite**.  
- **VoiceCommAgent** streams TTS; **UIBridgeAgent** pushes WebSocket frames to the React app.  
- **RAGQueryAgent** handles chat questions, retrieving chunks and calling **Gemini**.

---

## 🧩 Agent Specs (concise)

### `TelemetryReaderAgent`
- Reads cached telemetry; publishes `tick_state` at 10–20 Hz.

### `RivalWatcherAgent[j]`
- Subscribes: `tick_state` filtered by `rival_id`  
- Computes windowed features → runs **TCN ONNXRuntime** → publishes `intent_logits` and `p_attack_in_Δt`.

### `MicroScenarioSimAgent[j]`
- Subscribes: `tick_state`  
- Simulates 5–10 ghost futures for next 5–10 s (ERS dump / save / brake early / deep send).  
- Publishes `scenario_scores` (risk estimates).

### `AnomalyAgent[j]`
- Subscribes: `tick_state`  
- CUSUM on ERS discharge + lateral line deviation; optional tiny AE.  
- Publishes `anomaly_flags` with scores.

### `CommsReaderAgent` → `CommsNLPAgent`
- Ingests radio transcripts (file/ASR).  
- Keyword/phrase spotting → `comms_logits` with time decay.

### `FusionStrategistAgent`
- Subscribes: `intent_logits`, `scenario_scores`, `anomaly_flags`, `comms_logits`.  
- Bayesian/threshold fusion → **`alert`** `{turn, risk, recommendation, why[]}`.

### `RAGIndexerAgent`
- Subscribes: `alert`, `tick_state` windows → builds text+numeric chunks → **embeds** → upserts to **FAISS** and row to **SQLite**.

### `VoiceCommAgent`
- Subscribes: `alert` → formats concise line (<3 s) → **ElevenLabs streaming TTS** → plays/streams; supports interrupt priorities.

### `UIBridgeAgent`
- Subscribes: `alert` → emits WebSocket message for the **React Celestial UI**.

### `RAGQueryAgent`
- HTTP endpoint `/rag/query`: retrieves top‑k chunks from FAISS → prompts **Gemini** → returns grounded answer (optionally TTS via VoiceCommAgent).

---

## 🧮 Data Contracts

**`tick_state`**
```json
{
  "ts": 1734567890123,
  "rival_id": "RBR_1",
  "seg_id": 12,
  "gap_s": 0.42,
  "closing_rate": 0.18,
  "drs_rival": true,
  "ers_rival": 0.46,
  "ers_delta": -0.07,
  "v_rival": 286.4,
  "v_ours": 283.9,
  "throttle_rival": 0.92,
  "brake_rival": 0.05,
  "steer_deg_rival": -8.1,
  "lateral_line_dev": 0.27,
  "compound": "M",
  "stint_laps": 9
}
```

**`alert`**
```json
{
  "ts": 1734567890200,
  "rival_id": "RBR_1",
  "turn": 12,
  "risk_attack_now": 0.74,
  "recommendation": "Defend inside; ERS 30% in S3",
  "why": ["ERS spike", "DRS active", "line deviation"],
  "priority": "critical",
  "ttl_ms": 4000,
  "lap": 23
}
```

---

## 🗂️ Repo Layout
```
astraguard/
├── backend/
│   ├── main.py                  # FastAPI + WS + AgentBricks bootstrap
│   ├── bus.py                   # in-proc dispatcher / Redis option
│   ├── agents/
│   │   ├── telemetry_reader.py
│   │   ├── rival_watcher.py
│   │   ├── micro_scenario_sim.py
│   │   ├── anomaly.py
│   │   ├── comms_reader.py
│   │   ├── comms_nlp.py
│   │   ├── fusion_strategist.py
│   │   ├── rag_indexer.py
│   │   ├── voice_comm.py
│   │   └── ui_bridge.py
│   ├── models/model_intention.onnx
│   ├── features.py
│   ├── vector_store.py          # FAISS + SQLite
│   ├── elevenlabs_client.py
│   └── gemini_client.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── CelestialMap.jsx
│   │   └── ThreatRibbon.jsx
├── data/
│   ├── telemetry_monza.json
│   └── demo_transcripts.json
└── README.md
```

---

## ⚙️ Local Runtime (minimal)

**Prereqs:** Python 3.10+, Node 20+, keys for ElevenLabs & Gemini

```bash
# backend
pip install -r requirements.txt  # fastapi, websockets, onnxruntime, faiss-cpu, numpy, pandas
python backend/main.py

# frontend
npm --prefix frontend install
npm --prefix frontend run dev
```

`.env` (backend):
```
ELEVENLABS_API_KEY=...
GEMINI_API_KEY=...
```

---

## 🖌️ Design (Best Design + Celestial)
- Track: luminous ring; rivals: stars with orbit arcs.  
- Threat: red supernova pulse on predicted move zone.  
- Toasts: “Defend inside • T12 • 74%” with rationale chips.  
- A11y: WCAG AA, captions for voice, keyboard focus styles.

---

## 🧪 Demo
1) Start replay → RivalWatcherAgent raises risk near T12.  
2) FusionStrategistAgent emits **alert**; **VoiceCommAgent** speaks callout; UI shows supernova pulse.  
3) Ask chat: “Why defend Lap 23?” → **RAGQueryAgent** retrieves chunks; **Gemini** answers with citations.  

---

## 📌 NorthMark Pitch Angle
“AstraGuard reduces HPC‑scale strategy space into **micro‑scenarios** and **speaks** the right call in **milliseconds** — the missing bridge between simulation and action.”

---

## 📜 License
MIT © 2025 AstraGuard Team
