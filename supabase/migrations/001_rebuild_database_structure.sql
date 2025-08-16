-- Ricostruzione completa del database per risolvere errore 500
-- Elimina tabelle esistenti e ricrea con struttura corretta

-- 1. Elimina tabelle esistenti (in ordine di dipendenze)
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.user_workspaces CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Crea tabella users principale
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    display_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    email_verification_code VARCHAR(6),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_code VARCHAR(6),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Integrazione Zilliz/Milvus
    milvus_cluster_id VARCHAR(255),
    milvus_cluster_endpoint TEXT,
    milvus_api_key TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crea tabella workspaces
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Integrazione Milvus
    milvus_collection_name VARCHAR(255) NOT NULL,
    milvus_collection_id VARCHAR(255),
    
    -- Configurazioni
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crea tabella user_workspaces (relazioni)
CREATE TABLE public.user_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, workspace_id)
);

-- 5. Crea tabella collections (Milvus Integration)
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    
    -- Milvus specifics
    milvus_collection_name VARCHAR(255) NOT NULL,
    milvus_collection_id VARCHAR(255),
    dimension INTEGER DEFAULT 1536,
    metric_type VARCHAR(20) DEFAULT 'COSINE',
    
    -- Metadata
    description TEXT,
    schema_config JSONB DEFAULT '{}',
    index_config JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'creating' CHECK (status IN ('creating', 'active', 'error', 'deleted')),
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crea indici per performance
-- Indici users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_plan ON public.users(plan);
CREATE INDEX idx_users_milvus_cluster ON public.users(milvus_cluster_id);

-- Indici workspaces
CREATE INDEX idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX idx_workspaces_collection ON public.workspaces(milvus_collection_name);
CREATE UNIQUE INDEX idx_workspaces_owner_name ON public.workspaces(owner_id, name);

-- Indici user_workspaces
CREATE INDEX idx_user_workspaces_user ON public.user_workspaces(user_id);
CREATE INDEX idx_user_workspaces_workspace ON public.user_workspaces(workspace_id);

-- Indici collections
CREATE INDEX idx_collections_workspace ON public.collections(workspace_id);
CREATE INDEX idx_collections_milvus_name ON public.collections(milvus_collection_name);
CREATE UNIQUE INDEX idx_collections_workspace_name ON public.collections(workspace_id, name);