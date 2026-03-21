-- =============================================================================
-- HealMyPaw — Schema SQL para Supabase
-- Ejecutar completo en SQL Editor de Supabase
-- Idempotente: seguro de re-ejecutar
-- =============================================================================


-- =============================================================================
-- 1. ENUMs
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM (
    'pending_verification',
    'pending_council',
    'active',
    'rejected_auto',
    'rejected_council',
    'completed',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_type AS ENUM ('welfare', 'finance', 'fraud');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_vote AS ENUM ('approve', 'reject', 'abstain');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- 2. Función para updated_at automático
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 3. Tablas (en orden de dependencias FK)
-- =============================================================================

-- 3.1 user_profiles — extiende auth.users de Supabase
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  bio          TEXT,
  phone        TEXT,
  is_verified  BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 campaigns
CREATE TABLE IF NOT EXISTS campaigns (
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

-- 3.3 ai_verifications
CREATE TABLE IF NOT EXISTS ai_verifications (
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

-- 3.4 ai_council_votes
CREATE TABLE IF NOT EXISTS ai_council_votes (
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

-- 3.5 ai_council_decisions
CREATE TABLE IF NOT EXISTS ai_council_decisions (
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

-- 3.6 donations
CREATE TABLE IF NOT EXISTS donations (
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

-- 3.7 campaign_updates
CREATE TABLE IF NOT EXISTS campaign_updates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  content      TEXT NOT NULL,
  images       TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================================================================
-- 4. Triggers updated_at
-- =============================================================================

DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_campaigns ON campaigns;
CREATE TRIGGER set_updated_at_campaigns
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_donations ON donations;
CREATE TRIGGER set_updated_at_donations
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- 5. Trigger: auto-crear user_profiles al registrarse un usuario
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- 6. Índices de performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_deleted ON campaigns(is_deleted);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_campaign_id ON ai_verifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_council_votes_campaign_id ON ai_council_votes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);


-- =============================================================================
-- 7. Row Level Security (RLS)
-- La API usa service_role_key que bypasea RLS automáticamente.
-- Las políticas protegen acceso directo con anon_key.
-- =============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_council_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_council_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- user_profiles: cada usuario lee y actualiza solo su propio perfil
DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- campaigns: lectura pública de activas y no eliminadas; escritura solo el owner
DROP POLICY IF EXISTS "campaigns_public_read" ON campaigns;
CREATE POLICY "campaigns_public_read"
  ON campaigns FOR SELECT
  USING (status = 'active' AND is_deleted = false);

DROP POLICY IF EXISTS "campaigns_owner_read_all" ON campaigns;
CREATE POLICY "campaigns_owner_read_all"
  ON campaigns FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "campaigns_owner_insert" ON campaigns;
CREATE POLICY "campaigns_owner_insert"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "campaigns_owner_update" ON campaigns;
CREATE POLICY "campaigns_owner_update"
  ON campaigns FOR UPDATE
  USING (auth.uid() = owner_id);

-- campaign_updates: lectura pública; escritura solo el owner de la campaña
DROP POLICY IF EXISTS "campaign_updates_public_read" ON campaign_updates;
CREATE POLICY "campaign_updates_public_read"
  ON campaign_updates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "campaign_updates_owner_insert" ON campaign_updates;
CREATE POLICY "campaign_updates_owner_insert"
  ON campaign_updates FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM campaigns WHERE id = campaign_id)
  );

-- donations: lectura pública; inserción solo autenticados
DROP POLICY IF EXISTS "donations_public_read" ON donations;
CREATE POLICY "donations_public_read"
  ON donations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "donations_authenticated_insert" ON donations;
CREATE POLICY "donations_authenticated_insert"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

-- ai_*: solo service_role (no se crean políticas → bloqueado para anon/authenticated)
-- El service_role bypasea RLS automáticamente, no necesita políticas explícitas.
