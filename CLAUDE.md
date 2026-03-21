# HealMyPaw — Guía Maestra del Proyecto

## Descripción

**HealMyPaw** es una plataforma de crowdfunding para tratamientos médicos de mascotas gobernada por IA.

Los usuarios crean campañas con información veterinaria. Un **AI Verifier** analiza la credibilidad (score 0–1). Si pasa el umbral, un **AI Council** de 3 agentes especializados (Welfare, Finance, Fraud) decide si la campaña se publica. Las campañas aprobadas reciben donaciones.

---

## Tech Stack

- **Runtime**: Python 3.12+
- **Framework**: FastAPI 0.115+
- **Base de datos**: Supabase (Postgres 15) via `supabase-py`
- **Auth**: Supabase Auth (JWT)
- **IA**: Anthropic SDK (`claude-sonnet-4-6`) — multi-agent
- **Validación**: Pydantic v2 + pydantic-settings
- **Testing**: pytest + pytest-asyncio + httpx
- **Linting/Types**: ruff + mypy (strict)
- **Package manager**: `uv` — NUNCA usar `pip` directamente

---

## Estructura de Carpetas (Screaming Architecture)

```
src/
  campaigns/
    models.py          # Modelos de dominio (sin sufijo)
    repository.py      # Solo CRUD puro contra Supabase
    service.py         # Toda la lógica de negocio
    router.py          # Recibe, delega, responde
    exceptions.py      # Excepciones del dominio
  donations/
    models.py
    repository.py
    service.py
    router.py
    exceptions.py
  users/
    models.py
    repository.py
    service.py
    router.py
    exceptions.py
  ai/
    verifier/
      agent.py         # Lógica del AI Verifier
      prompts.py       # Prompts del verifier
    council/
      welfare_agent.py
      finance_agent.py
      fraud_agent.py
      orchestrator.py  # Aplica reglas de votación
      prompts.py       # Prompts de cada agente del council
    models.py          # Pydantic schemas de respuestas IA
    exceptions.py
  shared/
    database.py        # Cliente Supabase singleton
    auth.py            # Dependencias JWT FastAPI
    config.py          # Settings via pydantic-settings
    exceptions.py      # Excepciones base
tests/
  campaigns/
  donations/
  users/
  ai/
  conftest.py
main.py
pyproject.toml
.env.example
```

---

## Convenciones de Código

### Naming
- Archivos: `snake_case.py`
- Clases: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Pydantic schemas de request/response: sufijo `Schema` (ej: `CreateCampaignSchema`, `CampaignResponseSchema`)
- Modelos de dominio: sin sufijo (ej: `Campaign`, `Donation`)

### Async
- **SIEMPRE async/await**. Cero código sincrónico. Sin excepciones.

### Separación de responsabilidades (ESTRICTA)
- **Repository**: solo CRUD puro. Sin lógica de negocio. Sin validaciones.
- **Service**: toda la lógica de negocio. Sin acceso directo a Supabase (usa el repository).
- **Router**: recibe request, llama al service, retorna response. Sin lógica.

### Tipos
- Tipos explícitos en TODAS las funciones (mypy strict).
- Nunca usar `Any` salvo para JSONB raw de Supabase (y documentarlo).

---

## Endpoints FastAPI

### Skills a cargar
Antes de implementar cualquier endpoint, leer:
- `~/.claude/skills/django-drf/SKILL.md` (patrones REST adaptables)
- `~/.claude/skills/pytest/SKILL.md` (para los tests)

### Auth / Usuarios

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users/me` | ✅ | Perfil propio |
| PATCH | `/users/me` | ✅ | Actualizar perfil |
| GET | `/users/{id}/campaigns` | ❌ | Campañas públicas del usuario |

### Campaigns

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/campaigns` | ✅ | Crear campaña + trigger AI Verifier |
| GET | `/campaigns` | ❌ | Listar campañas activas (paginado, filtros) |
| GET | `/campaigns/{id}` | ❌ | Detalle con donaciones agregadas |
| GET | `/campaigns/mine` | ✅ | Campañas propias (todos los status) |
| PATCH | `/campaigns/{id}` | ✅ owner | Editar (solo si pending/rejected) |
| DELETE | `/campaigns/{id}` | ✅ owner | Soft delete |
| POST | `/campaigns/{id}/updates` | ✅ owner | Publicar actualización de progreso |
| GET | `/campaigns/{id}/updates` | ❌ | Ver actualizaciones |
| GET | `/campaigns/{id}/ai-review` | ✅ owner | Ver resultado AI (sin re-llamar LLM) |
| POST | `/campaigns/{id}/resubmit` | ✅ owner | Reenviar para re-verificación (máx 2 veces) |

### Donations

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/campaigns/{id}/donate` | ✅ | Donar (MVP: simula pago) |
| GET | `/campaigns/{id}/donations` | ❌ | Donaciones públicas (anonimato respetado) |
| GET | `/donations/mine` | ✅ | Mis donaciones |

---

## Flujo de IA

```
POST /campaigns
  → AI Verifier → score >= 0.4?
    NO → status = rejected_auto
    SI → BackgroundTask: AI Council

AI Council (asyncio.gather — 3 agentes en paralelo)
  WelfareAgent + FinanceAgent + FraudAgent
  → Orchestrator aplica reglas:
      fraud_vote = reject → veto automático (DEFINITIVO)
      2/3 approve         → active
      2/3 reject          → rejected_council
  → update campaign.status
```

> **Regla de oro del Fraud Agent**: su voto `reject` es DEFINITIVO. No importa lo que voten los otros dos agentes. El veto es absoluto.

### Umbrales del Verifier

| Score | Resultado |
|-------|-----------|
| < 0.4 | `rejected_auto` (no llega al Council) |
| ≥ 0.4 | Pasa al AI Council |

---

## Schema Supabase (Postgres 15)

### Enums

```sql
CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'other');
CREATE TYPE campaign_status AS ENUM (
  'pending_verification',
  'pending_council',
  'active',
  'rejected_auto',
  'rejected_council',
  'completed',
  'expired'
);
CREATE TYPE agent_type AS ENUM ('welfare', 'finance', 'fraud');
CREATE TYPE agent_vote AS ENUM ('approve', 'reject', 'abstain');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
```

### Tablas

```sql
-- Extiende auth.users de Supabase
CREATE TABLE user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  bio          TEXT,
  phone        TEXT,
  is_verified  BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           UUID NOT NULL REFERENCES user_profiles(id),
  title              TEXT NOT NULL,
  pet_name           TEXT NOT NULL,
  pet_species        pet_species NOT NULL,
  pet_age_years      NUMERIC(4,1),
  pet_breed          TEXT,
  story              TEXT NOT NULL,
  diagnosis          TEXT NOT NULL,
  vet_name           TEXT,
  vet_clinic         TEXT,
  goal_amount        NUMERIC(12,2) NOT NULL CHECK (goal_amount > 0),
  total_raised       NUMERIC(12,2) NOT NULL DEFAULT 0,
  status             campaign_status NOT NULL DEFAULT 'pending_verification',
  deadline           DATE NOT NULL,
  images             TEXT[] NOT NULL DEFAULT '{}',
  medical_documents  TEXT[] NOT NULL DEFAULT '{}',
  resubmit_count     SMALLINT NOT NULL DEFAULT 0 CHECK (resubmit_count <= 2),
  is_deleted         BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id),
  score         NUMERIC(4,3) NOT NULL CHECK (score >= 0 AND score <= 1),
  flags         TEXT[] NOT NULL DEFAULT '{}',
  summary       TEXT NOT NULL,
  raw_response  JSONB NOT NULL,
  model_used    TEXT NOT NULL,
  tokens_used   INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_council_votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID NOT NULL REFERENCES campaigns(id),
  verification_id  UUID NOT NULL REFERENCES ai_verifications(id),
  agent_type       agent_type NOT NULL,
  vote             agent_vote NOT NULL,
  reasoning        TEXT NOT NULL,
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, verification_id, agent_type)
);

CREATE TABLE ai_council_decisions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID NOT NULL REFERENCES campaigns(id),
  verification_id  UUID NOT NULL REFERENCES ai_verifications(id),
  final_decision   agent_vote NOT NULL,
  decision_reason  TEXT NOT NULL,
  welfare_vote     agent_vote NOT NULL,
  finance_vote     agent_vote NOT NULL,
  fraud_vote       agent_vote NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE donations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  donor_id     UUID NOT NULL REFERENCES user_profiles(id),
  amount       NUMERIC(12,2) NOT NULL CHECK (amount >= 1),
  message      TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status       donation_status NOT NULL DEFAULT 'pending',
  payment_ref  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaign_updates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  content      TEXT NOT NULL,
  images       TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Campaign Status Flow

```
pending_verification
  ↓ (AI Verifier score < 0.4)
  └── rejected_auto
  ↓ (AI Verifier score ≥ 0.4)
  └── pending_council
        ↓ (AI Council)
        ├── approve → active
        │              ↓
        │         completed / expired
        └── reject → rejected_council
                          ↓ (resubmit, máx 2x)
                          └── vuelve a pending_verification
```

---

## Variables de Entorno

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
APP_ENV=development
CORS_ORIGINS=http://localhost:3000
```

---

## Dependencias (pyproject.toml)

```toml
[project]
name = "healmypaw"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi[standard]>=0.115",
    "supabase>=2.9",
    "anthropic>=0.40",
    "pydantic>=2.9",
    "pydantic-settings>=2.6",
    "python-jose[cryptography]>=3.3",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3",
    "pytest-asyncio>=0.24",
    "httpx>=0.27",
    "ruff>=0.8",
    "mypy>=1.13",
]
```

---

## Orden de Implementación

1. `pyproject.toml` + `.env.example` — estructura base
2. `shared/config.py` + `shared/database.py` — cimientos
3. Schema SQL en Supabase (en orden de dependencias FK)
4. `users/` — dominio más simple, establece el patrón router→service→repository
5. `campaigns/` sin IA — CRUD puro primero, flujo completo
6. `ai/verifier/` — testeable de forma aislada
7. `ai/council/` — 3 agentes + orchestrator con asyncio.gather
8. Integrar IA en `campaigns/service.py` con BackgroundTasks
9. `donations/` — último, depende de campañas activas

---

## Reglas de Negocio Críticas

- **Rate limit**: máximo 3 campañas creadas por usuario por día
- **Resubmit**: máximo 2 veces por campaña (`resubmit_count <= 2`)
- **Edición**: solo campañas en estado `pending_verification` o `rejected_*`
- **Fraud veto**: si `fraud_vote = reject`, el `final_decision` es siempre `reject`
- **Anonimato**: en `GET /campaigns/{id}/donations`, si `is_anonymous = true`, no exponer `donor_id` ni nombre
- **Soft delete**: nunca borrar físicamente campañas, usar `is_deleted = true`
- **total_raised**: actualizar vía trigger SQL o en el service de donations al confirmar pago

---

## Verificación (Smoke Tests)

```bash
# Levantar servidor
uv run fastapi dev main.py

# Verificar Swagger
# → http://localhost:8000/docs debe mostrar todos los endpoints

# Test del flujo completo
# 1. Crear campaña → verificar que en Supabase aparece ai_verifications + ai_council_votes
# 2. Campaña con texto claramente fraudulento → debe quedar rejected_auto o rejected_council
# 3. Campaña legítima → debe quedar active
# 4. Intentar crear 4 campañas en el mismo día → la 4ta debe dar 429
```
