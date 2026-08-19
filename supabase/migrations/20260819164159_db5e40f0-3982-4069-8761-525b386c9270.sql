CREATE TYPE public.app_role AS ENUM ('admin','staff','paciente');
CREATE TYPE public.estado_turno AS ENUM ('solicitado','confirmado','cancelado','atendido','ausente');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nombre text NOT NULL DEFAULT '',
  apellido text NOT NULL DEFAULT '',
  email text,
  telefono text,
  dni text,
  fecha_nacimiento date,
  obra_social text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (id = auth.uid() OR public.is_staff(auth.uid()));

-- especialidades
CREATE TABLE public.especialidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text NOT NULL DEFAULT '',
  icono text NOT NULL DEFAULT 'stethoscope',
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.especialidades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.especialidades TO authenticated;
GRANT ALL ON public.especialidades TO service_role;
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esp_public_read" ON public.especialidades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "esp_staff_write" ON public.especialidades FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- medicos
CREATE TABLE public.medicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  especialidad_id uuid NOT NULL REFERENCES public.especialidades(id) ON DELETE CASCADE,
  matricula text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  foto_url text,
  precio_consulta numeric(10,2) NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.medicos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicos TO authenticated;
GRANT ALL ON public.medicos TO service_role;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "med_public_read" ON public.medicos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "med_staff_write" ON public.medicos FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- disponibilidades
CREATE TABLE public.disponibilidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id uuid NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  dia_semana smallint NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  duracion_min smallint NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disponibilidades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disponibilidades TO authenticated;
GRANT ALL ON public.disponibilidades TO service_role;
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disp_public_read" ON public.disponibilidades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "disp_staff_write" ON public.disponibilidades FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- turnos
CREATE TABLE public.turnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  medico_id uuid NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  fecha_hora timestamptz NOT NULL,
  duracion_min smallint NOT NULL DEFAULT 30,
  estado public.estado_turno NOT NULL DEFAULT 'solicitado',
  motivo text NOT NULL DEFAULT '',
  obra_social text,
  recordatorio_enviado boolean NOT NULL DEFAULT false,
  token_confirmacion uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (medico_id, fecha_hora)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turnos TO authenticated;
GRANT SELECT ON public.turnos TO anon;
GRANT ALL ON public.turnos TO service_role;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_turnos_updated BEFORE UPDATE ON public.turnos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "turnos_select" ON public.turnos FOR SELECT TO authenticated USING (paciente_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "turnos_insert_own" ON public.turnos FOR INSERT TO authenticated WITH CHECK (paciente_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "turnos_update" ON public.turnos FOR UPDATE TO authenticated USING (paciente_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (paciente_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "turnos_delete_staff" ON public.turnos FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX idx_turnos_medico_fecha ON public.turnos (medico_id, fecha_hora);

-- notas clinicas
CREATE TABLE public.notas_clinicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id uuid REFERENCES public.turnos(id) ON DELETE SET NULL,
  paciente_id uuid NOT NULL,
  autor_id uuid NOT NULL,
  contenido text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_clinicas TO authenticated;
GRANT ALL ON public.notas_clinicas TO service_role;
ALTER TABLE public.notas_clinicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notas_select" ON public.notas_clinicas FOR SELECT TO authenticated USING (paciente_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "notas_staff_write" ON public.notas_clinicas FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- seed
INSERT INTO public.especialidades (id, nombre, descripcion, icono) VALUES
 ('11111111-1111-4111-8111-000000000001','Clínica Médica','Atención integral del adulto, controles y derivaciones.','stethoscope'),
 ('11111111-1111-4111-8111-000000000002','Cardiología','Estudios y seguimiento del corazón y la presión arterial.','heart-pulse'),
 ('11111111-1111-4111-8111-000000000003','Pediatría','Control y crecimiento saludable de chicos y adolescentes.','baby'),
 ('11111111-1111-4111-8111-000000000004','Dermatología','Diagnóstico y tratamiento de la piel, pelo y uñas.','sun'),
 ('11111111-1111-4111-8111-000000000005','Traumatología','Lesiones, fracturas y rehabilitación del sistema óseo.','bone'),
 ('11111111-1111-4111-8111-000000000006','Ginecología','Salud de la mujer, controles anuales y seguimiento.','flower-2');

INSERT INTO public.medicos (id, nombre, apellido, especialidad_id, matricula, bio, precio_consulta) VALUES
 ('22222222-2222-4222-8222-000000000001','Lucía','Fernández','11111111-1111-4111-8111-000000000001','MN 84213','Clínica médica con 12 años de experiencia en atención primaria.',18000),
 ('22222222-2222-4222-8222-000000000002','Martín','Gómez','11111111-1111-4111-8111-000000000001','MN 91002','Enfoque preventivo y control de enfermedades crónicas.',18000),
 ('22222222-2222-4222-8222-000000000003','Sofía','Ramírez','11111111-1111-4111-8111-000000000002','MN 77510','Cardióloga clínica, ergometrías y ecodoppler.',26000),
 ('22222222-2222-4222-8222-000000000004','Diego','Alvarez','11111111-1111-4111-8111-000000000003','MN 68420','Pediatra, control de niño sano y vacunación.',20000),
 ('22222222-2222-4222-8222-000000000005','Camila','Torres','11111111-1111-4111-8111-000000000004','MN 88301','Dermatología clínica y estética médica.',22000),
 ('22222222-2222-4222-8222-000000000006','Javier','Molina','11111111-1111-4111-8111-000000000005','MN 70255','Traumatología deportiva y rehabilitación.',24000),
 ('22222222-2222-4222-8222-000000000007','Valentina','Rossi','11111111-1111-4111-8111-000000000006','MN 81190','Ginecología y control anual integral.',23000);

INSERT INTO public.disponibilidades (medico_id, dia_semana, hora_inicio, hora_fin, duracion_min)
SELECT m.id, d.dia, '09:00'::time, '17:00'::time, 30
FROM public.medicos m CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS d(dia);