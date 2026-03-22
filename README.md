# HealMyPaw

> Crowdfunding platform for pet medical treatments, governed by AI on the blockchain.

Users create campaigns with veterinary information. An **AI Council** of 5 independent LLM validators evaluates each campaign on GenLayer's blockchain. The result is immutable and verifiable — nobody can forge an approval, not even us.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Python 3.12+ |
| Framework | FastAPI 0.115+ |
| Database | Supabase (Postgres 15) |
| Auth | Supabase Auth |
| AI / Blockchain | GenLayer Intelligent Contract |
| Validation | Pydantic v2 + pydantic-settings |
| HTTP Client | httpx |
| Package manager | uv |

---

## How it works

```
POST /campaigns
  ↓
BackgroundTask: AI pipeline
  ↓ status → pending_council
  ↓
GenLayer Contract: evaluate_campaign()
  5 independent LLM validators run in parallel
  Fraud veto is absolute — if fraud votes reject, final is always reject
  2/3 approve → active
  2/3 reject  → rejected_council
  ↓
Supabase: votes + decision persisted
Campaign status updated
```

**Pitch**: every campaign is evaluated by 5 independent AI validators on the blockchain. The result is immutable and publicly verifiable.

---

## Project Structure

```
src/
  campaigns/     # Campaign CRUD, AI trigger, updates
  donations/     # Donations with anonymity support
  users/         # User profiles
  ai/
    council/     # Orchestrator — calls GenLayer, persists results
  blockchain/    # GenLayer JSON-RPC client
  shared/        # Config, database, auth, exceptions
contracts/
  campaign_council.py   # GenLayer Intelligent Contract
main.py
pyproject.toml
schema.sql
```

Architecture: **Screaming Architecture** — Router → Service → Repository.

---

## Getting Started

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- A [Supabase](https://supabase.com) project
- Access to a GenLayer node with the contract deployed

### Installation

```bash
git clone https://github.com/your-username/healmypaw.git
cd healmypaw
uv sync
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GENLAYER_NODE_URL=https://...
GENLAYER_CONTRACT_ADDRESS=0x...
GENLAYER_SENDER_ADDRESS=0x...
```

### Database Setup

Run `schema.sql` in your Supabase project via **Settings → SQL Editor**.

### Run

```bash
uv run fastapi dev main.py
```

API docs: **http://localhost:8000/docs**

---

## API Reference

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/me` | Own profile |
| `PATCH` | `/users/me` | Update profile |
| `GET` | `/users/{id}/campaigns` | User's public campaigns |

### Campaigns

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/campaigns` | Create campaign — triggers GenLayer Council |
| `GET` | `/campaigns` | List active campaigns (paginated) |
| `GET` | `/campaigns/mine` | Own campaigns (all statuses) |
| `GET` | `/campaigns/{id}` | Campaign detail |
| `PATCH` | `/campaigns/{id}` | Edit campaign (only if pending/rejected) |
| `DELETE` | `/campaigns/{id}` | Soft delete |
| `POST` | `/campaigns/{id}/updates` | Post a progress update |
| `GET` | `/campaigns/{id}/updates` | View updates |
| `GET` | `/campaigns/{id}/ai-review` | View GenLayer Council result |
| `POST` | `/campaigns/{id}/resubmit` | Resubmit for re-evaluation (max 2x) |

### Donations

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/campaigns/{id}/donate` | Donate to a campaign |
| `GET` | `/campaigns/{id}/donations` | Public donations (anonymity respected) |
| `GET` | `/donations/mine` | Own donations |

---

## Campaign Status Flow

```
pending_verification
  ↓
pending_council
  ↓ GenLayer Council
  ├── approve → active → completed / expired
  └── reject  → rejected_council → resubmit (max 2x) → pending_verification
```

---

## Business Rules

- Max 3 campaigns created per user per day
- Max 2 resubmits per campaign
- Campaigns are only editable in `pending_verification` or `rejected_*` status
- Fraud veto is absolute — overrides all other votes
- Donor anonymity is enforced at the API level
- Campaigns are never physically deleted (soft delete)

---

## License

MIT
