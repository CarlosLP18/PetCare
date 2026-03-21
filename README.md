# HealMyPaw 🐾

> Crowdfunding platform for pet medical treatments, governed by AI.

Users create campaigns with veterinary information. An **AI Verifier** analyzes credibility (score 0–1). If it passes the threshold, an **AI Council** of 3 specialized agents (Welfare, Finance, Fraud) decides whether the campaign gets published. Approved campaigns receive donations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Python 3.12+ |
| Framework | FastAPI 0.115+ |
| Database | Supabase (Postgres 15) via `supabase-py` |
| Auth | Supabase Auth (JWT) |
| AI | Anthropic SDK (`claude-sonnet-4-6`) — multi-agent |
| Validation | Pydantic v2 + pydantic-settings |
| Testing | pytest + pytest-asyncio + httpx |
| Linting | ruff + mypy (strict) |
| Package manager | `uv` |

---

## AI Flow

```
POST /campaigns
  → AI Verifier → score >= 0.4?
    NO → status = rejected_auto
    YES → BackgroundTask: AI Council

AI Council (asyncio.gather — 3 agents in parallel)
  WelfareAgent + FinanceAgent + FraudAgent
  → Orchestrator applies rules:
      fraud_vote = reject → automatic VETO (definitive)
      2/3 approve         → active
      2/3 reject          → rejected_council
  → updates campaign.status
```

> **Fraud Agent rule**: a `reject` vote is **absolute**. It overrides all other votes regardless of what Welfare and Finance decide.

---

## Project Structure

```
src/
  campaigns/        # Campaign CRUD + AI trigger + updates
  donations/        # Donations with anonymity support
  users/            # User profiles
  ai/
    verifier/       # AI Verifier agent (score 0–1)
    council/        # Welfare, Finance, Fraud agents + orchestrator
  shared/           # Config, database, auth, exceptions
tests/
main.py
pyproject.toml
```

Architecture: **Screaming Architecture** — Router → Service → Repository, strict separation of concerns.

---

## Getting Started

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/healmypaw.git
cd healmypaw

# Install dependencies
uv sync
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
APP_ENV=development
CORS_ORIGINS=http://localhost:3000
```

### Database Setup

Run the SQL schema in your Supabase project (Settings → SQL Editor). The full schema is in [`CLAUDE.md`](./CLAUDE.md#schema-supabase-postgres-15).

### Run

```bash
uv run fastapi dev main.py
```

API docs available at **http://localhost:8000/docs**

---

## API Reference

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | ✅ | Own profile |
| `PATCH` | `/users/me` | ✅ | Update profile |
| `GET` | `/users/{id}/campaigns` | ❌ | User's public campaigns |

### Campaigns

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/campaigns` | ✅ | Create campaign + trigger AI Verifier |
| `GET` | `/campaigns` | ❌ | List active campaigns (paginated, filterable) |
| `GET` | `/campaigns/mine` | ✅ | Own campaigns (all statuses) |
| `GET` | `/campaigns/{id}` | ❌ | Campaign detail |
| `PATCH` | `/campaigns/{id}` | ✅ owner | Edit (only if pending/rejected) |
| `DELETE` | `/campaigns/{id}` | ✅ owner | Soft delete |
| `POST` | `/campaigns/{id}/updates` | ✅ owner | Post a progress update |
| `GET` | `/campaigns/{id}/updates` | ❌ | View updates |
| `GET` | `/campaigns/{id}/ai-review` | ✅ owner | View AI review result |
| `POST` | `/campaigns/{id}/resubmit` | ✅ owner | Resubmit for re-verification (max 2x) |

### Donations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/campaigns/{id}/donate` | ✅ | Donate to a campaign |
| `GET` | `/campaigns/{id}/donations` | ❌ | Public donations (anonymity respected) |
| `GET` | `/donations/mine` | ✅ | Own donations |

---

## Campaign Status Flow

```
pending_verification
  ↓ score < 0.4          ↓ score ≥ 0.4
rejected_auto       pending_council
                          ↓ council votes
                    ┌─────┴─────┐
                  active    rejected_council
                    ↓             ↓ resubmit (max 2x)
            completed/expired  pending_verification
```

---

## Business Rules

- **Rate limit**: max 3 campaigns created per user per day
- **Resubmit**: max 2 times per campaign
- **Editing**: only campaigns in `pending_verification` or `rejected_*` status
- **Fraud veto**: if `fraud_vote = reject`, the final decision is always `reject`
- **Anonymity**: `GET /campaigns/{id}/donations` never exposes `donor_id` or name when `is_anonymous = true`
- **Soft delete**: campaigns are never physically deleted

---

## Development

```bash
# Linting
uv run ruff check .

# Type checking
uv run mypy .

# Tests
uv run pytest
```

---

## License

MIT
