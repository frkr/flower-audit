-- Flower Audit - D1 Schema
-- Source of truth: AGENTS.md
-- All record IDs use 16-byte hex (see src/front/lib/randomHEX.ts)

PRAGMA foreign_keys = ON;

-- ============================================================================
-- Flux (Fluxos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS flux (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    active        INTEGER NOT NULL DEFAULT 1,
    visible       INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_flux_name    ON flux(name);
CREATE INDEX IF NOT EXISTS idx_flux_active  ON flux(active);
CREATE INDEX IF NOT EXISTS idx_flux_created ON flux(created_at);

CREATE TABLE IF NOT EXISTS flux_metadata (
    id        TEXT PRIMARY KEY,
    id_fluxo  TEXT NOT NULL REFERENCES flux(id) ON DELETE CASCADE,
    name      TEXT NOT NULL,
    value     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_flux_metadata_flux ON flux_metadata(id_fluxo);

CREATE TABLE IF NOT EXISTS flux_authors (
    id        TEXT PRIMARY KEY,
    id_fluxo  TEXT NOT NULL REFERENCES flux(id) ON DELETE CASCADE,
    author    TEXT NOT NULL,
    at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_flux_authors_flux ON flux_authors(id_fluxo);

CREATE TABLE IF NOT EXISTS flux_steps (
    id        TEXT PRIMARY KEY,
    id_fluxo  TEXT NOT NULL REFERENCES flux(id) ON DELETE CASCADE,
    id_order  INTEGER NOT NULL DEFAULT 0,
    name      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_flux_steps_flux ON flux_steps(id_fluxo);

-- ============================================================================
-- Process (Processos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS process (
    id            TEXT PRIMARY KEY,
    id_fluxo      TEXT REFERENCES flux(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    active        INTEGER NOT NULL DEFAULT 1,
    visible       INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_process_flux    ON process(id_fluxo);
CREATE INDEX IF NOT EXISTS idx_process_name    ON process(name);
CREATE INDEX IF NOT EXISTS idx_process_active  ON process(active);
CREATE INDEX IF NOT EXISTS idx_process_created ON process(created_at);

CREATE TABLE IF NOT EXISTS process_metadata (
    id          TEXT PRIMARY KEY,
    id_process  TEXT NOT NULL REFERENCES process(id) ON DELETE CASCADE,
    id_fluxo    TEXT,
    name        TEXT NOT NULL,
    value       TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_process_metadata_process ON process_metadata(id_process);

CREATE TABLE IF NOT EXISTS process_authors (
    id          TEXT PRIMARY KEY,
    id_process  TEXT NOT NULL REFERENCES process(id) ON DELETE CASCADE,
    id_fluxo    TEXT,
    author      TEXT NOT NULL,
    at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_process_authors_process ON process_authors(id_process);

CREATE TABLE IF NOT EXISTS process_steps (
    id              TEXT PRIMARY KEY,
    id_order        INTEGER NOT NULL DEFAULT 0,
    id_reuse_step   TEXT,
    id_process      TEXT NOT NULL REFERENCES process(id) ON DELETE CASCADE,
    id_flux         TEXT REFERENCES flux(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    content         TEXT NOT NULL DEFAULT '',
    completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_process_steps_process ON process_steps(id_process);
CREATE INDEX IF NOT EXISTS idx_process_steps_flux    ON process_steps(id_flux);

CREATE TABLE IF NOT EXISTS process_step_authors (
    id        TEXT PRIMARY KEY,
    id_step   TEXT NOT NULL REFERENCES process_steps(id) ON DELETE CASCADE,
    id_fluxo  TEXT,
    author    TEXT NOT NULL,
    at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_process_step_authors_step ON process_step_authors(id_step);

CREATE TABLE IF NOT EXISTS process_step_files (
    id          TEXT PRIMARY KEY,
    id_process  TEXT NOT NULL REFERENCES process(id) ON DELETE CASCADE,
    id_step     TEXT NOT NULL REFERENCES process_steps(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    finder      TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_process_step_files_step ON process_step_files(id_step);

-- ============================================================================
-- Settings (Configuração — sistema-wide key/value bag)
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    value       TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Calendar source: dates where flows were started.
-- A "flow start" is the creation of a process tied to a flux.
-- The calendar reads from process.created_at (no separate table required).
-- ============================================================================
