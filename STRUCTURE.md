# Project Structure Guide

```
history2life/
├── app/                        # Application source code
│   ├── main.py                 # FastAPI app creation, router registration, startup events
│   ├── config.py               # Settings loaded from env vars (use pydantic BaseSettings)
│   ├── requirements.txt        # Production Python dependencies
│   │
│   ├── api/                    # HTTP layer — only request/response logic here
│   │   ├── routes/             # One file per feature/domain
│   │   │   ├── health.py       # GET /health, GET /
│   │   │   ├── personas.py     # Endpoints for historical figure sessions
│   │   │   └── chat.py         # Conversation / message endpoints
│   │   └── schemas/            # Pydantic models for request & response bodies
│   │       └── models.py       # Input/output shapes — no business logic here
│   │
│   ├── services/               # Business logic & external integrations
│   │   ├── nova.py             # Amazon Nova API calls (text, multimodal)
│   │   └── voice.py            # Voice synthesis / audio processing
│   │
│   ├── data/
│   │   └── personas/           # Static data files (.json / .yaml) per historical figure
│   │                           # e.g. cleopatra.json, lincoln.json
│   │                           # Each file: name, era, personality, system_prompt, facts
│   │
│   └── utils/                  # Pure helpers with no side effects (formatting, parsing, etc.)
│
├── tests/                      # Mirrors app/ structure
│   ├── conftest.py             # Shared pytest fixtures (TestClient, mock AWS, etc.)
│   ├── test_api/               # Tests for HTTP routes (use TestClient, no real AWS calls)
│   └── test_services/          # Unit tests for service logic (mock external APIs)
│
├── docs/                       # Human-readable documentation
│   │                           # Architecture diagrams, API reference, deployment notes
│   └── .gitkeep
│
├── scripts/                    # One-off shell scripts (setup, deployment helpers)
│   │                           # Not imported by Python — pure shell/bash
│   └── .gitkeep
│
├── Dockerfile                  # Production container build
├── .env.example                # Template for required environment variables — commit this
├── .gitignore                  # Never commit .env or __pycache__
├── LICENSE
├── README.md                   # Project overview, quickstart
└── contest.md                  # Hackathon submission requirements
```

---

## Decision guide: where does this go?

| What you're adding | Where it goes |
|---|---|
| New API endpoint | `app/api/routes/<feature>.py` |
| Request/response body shape | `app/api/schemas/models.py` |
| Call to Amazon Nova or AWS | `app/api/services/nova.py` |
| Voice / audio processing | `app/api/services/voice.py` |
| Historical figure personality data | `app/data/personas/<name>.json` |
| App settings / env vars | `app/config.py` |
| Reusable pure function (no I/O) | `app/utils/` |
| Test for an API route | `tests/test_api/` |
| Test for a service | `tests/test_services/` |
| Architecture decision or API doc | `docs/` |
| Dev/ops shell script | `scripts/` |
| New Python package dependency | `app/requirements.txt` |
| New env variable | `.env.example` (document it here, never commit `.env`) |

---

## Key rules

- **`api/` never imports from another route file** — shared logic belongs in `services/` or `utils/`.
- **`services/` never imports from `api/`** — data flows one way: routes → services → (Nova/voice/data).
- **No business logic in schemas** — Pydantic models validate shape only.
- **Persona data is data, not code** — keep it in `app/data/personas/` as JSON/YAML, loaded at runtime.
- **Secrets never in code** — use `.env` locally, AWS Secrets Manager / environment injection in prod; document the variable in `.env.example`.
