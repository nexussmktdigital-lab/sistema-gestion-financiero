-- ============================================================
-- FinanceApp — Schema + RLS
-- IMPORTANTE: desactivar "Confirm email" en
--   Authentication → Providers → Email  ANTES de crear usuarios
-- ============================================================

-- Limpia todo si ya existía una versión anterior
DROP TABLE IF EXISTS public.caja_diaria CASCADE;
DROP TABLE IF EXISTS public.alertas   CASCADE;
DROP TABLE IF EXISTS public.creditos  CASCADE;
DROP TABLE IF EXISTS public.divisas   CASCADE;
DROP TABLE IF EXISTS public.cheques   CASCADE;
DROP TABLE IF EXISTS public.clientes  CASCADE;
DROP FUNCTION IF EXISTS public.set_user_id() CASCADE;

-- ─── Trigger: setea user_id automáticamente en cada INSERT ──────────────────
CREATE FUNCTION public.set_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- ─── CLIENTES ────────────────────────────────────────────────────────────────
CREATE TABLE public.clientes (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT  NOT NULL,
  telefono    TEXT,
  email       TEXT,
  cuit        TEXT,
  direccion   TEXT,
  notas       TEXT,
  created_at  DATE  NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_own" ON public.clientes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER auto_user_id_clientes
  BEFORE INSERT ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ─── CHEQUES ─────────────────────────────────────────────────────────────────
CREATE TABLE public.cheques (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id      UUID          REFERENCES public.clientes(id) ON DELETE SET NULL,
  nombre          TEXT,
  telefono        TEXT,
  fecha_cobro     DATE,
  numero_cheque   TEXT,
  importe         NUMERIC(15,2) DEFAULT 0,
  nombre_titular  TEXT,
  cuit            TEXT,
  vigencia_cuenta DATE,
  es_digital      BOOLEAN       DEFAULT FALSE,
  comision        NUMERIC(15,2) DEFAULT 0,
  estado          TEXT          DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente','cobrado','rechazado')),
  destino         TEXT          CHECK (destino IN ('caja','divisa','credito','proveedor','gasto','otro') OR destino IS NULL),
  destino_detalle TEXT,
  fecha_uso       DATE,
  notas           TEXT,
  created_at      DATE          NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cheques_own" ON public.cheques
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER auto_user_id_cheques
  BEFORE INSERT ON public.cheques
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ─── DIVISAS ─────────────────────────────────────────────────────────────────
CREATE TABLE public.divisas (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id        UUID          REFERENCES public.clientes(id) ON DELETE SET NULL,
  nombre            TEXT,
  telefono          TEXT,
  divisa            TEXT,
  tipo_accion       TEXT          CHECK (tipo_accion IN ('compra','venta')),
  precio_compra     NUMERIC(15,2),
  precio_venta      NUMERIC(15,2),
  monto             NUMERIC(15,4),
  fecha_transaccion DATE,
  notas             TEXT,
  created_at        DATE          NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE public.divisas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "divisas_own" ON public.divisas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER auto_user_id_divisas
  BEFORE INSERT ON public.divisas
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ─── CREDITOS ────────────────────────────────────────────────────────────────
CREATE TABLE public.creditos (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id      UUID          REFERENCES public.clientes(id) ON DELETE SET NULL,
  nombre          TEXT          NOT NULL,
  telefono        TEXT,
  importe         NUMERIC(15,2) DEFAULT 0,
  fecha_emision   DATE,
  cuotas          INTEGER,
  interes         NUMERIC(5,2)  DEFAULT 0,
  fecha_finalizar DATE,
  cuotas_pagadas  INTEGER       DEFAULT 0,
  estado          TEXT          DEFAULT 'activo'
                  CHECK (estado IN ('activo','mora','completado')),
  notas           TEXT,
  created_at      DATE          NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE public.creditos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creditos_own" ON public.creditos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER auto_user_id_creditos
  BEFORE INSERT ON public.creditos
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ─── ALERTAS ─────────────────────────────────────────────────────────────────
CREATE TABLE public.alertas (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id    UUID          REFERENCES public.clientes(id) ON DELETE SET NULL,
  nombre        TEXT,
  telefono      TEXT,
  monto         NUMERIC(15,2) DEFAULT 0,
  fecha_alerta  DATE,
  descripcion   TEXT,
  tipo          TEXT          DEFAULT 'otro'
                CHECK (tipo IN ('cheque','credito','divisa','otro')),
  estado        TEXT          DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente','enviada','completada')),
  referencia_id UUID,
  created_at    DATE          NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alertas_own" ON public.alertas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER auto_user_id_alertas
  BEFORE INSERT ON public.alertas
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ─── CAJA DIARIA ─────────────────────────────────────────────────────────────
CREATE TABLE public.caja_diaria (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha            DATE          NOT NULL,
  pesos_inicial    NUMERIC(15,2) DEFAULT 0,
  dolares_inicial  NUMERIC(15,2) DEFAULT 0,
  notas            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, fecha)
);
ALTER TABLE public.caja_diaria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caja_own" ON public.caja_diaria
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER auto_user_id_caja
  BEFORE INSERT ON public.caja_diaria
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_cheques_estado      ON public.cheques(estado);
CREATE INDEX idx_cheques_fecha_cobro ON public.cheques(fecha_cobro);
CREATE INDEX idx_cheques_destino     ON public.cheques(destino);
CREATE INDEX idx_creditos_estado     ON public.creditos(estado);
CREATE INDEX idx_alertas_estado      ON public.alertas(estado);
CREATE INDEX idx_divisas_divisa      ON public.divisas(divisa);
CREATE INDEX idx_caja_fecha          ON public.caja_diaria(fecha);
