export type EstadoTurno = "solicitado" | "confirmado" | "cancelado" | "atendido" | "ausente";

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  activa: boolean;
}

export interface Medico {
  id: string;
  nombre: string;
  apellido: string;
  especialidad_id: string;
  matricula: string;
  bio: string;
  foto_url: string | null;
  precio_consulta: number;
  activo: boolean;
}

export interface Turno {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha_hora: string;
  duracion_min: number;
  estado: EstadoTurno;
  motivo: string;
  obra_social: string | null;
  created_at: string;
}

export interface Disponibilidad {
  id: string;
  medico_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_min: number;
}

export const CLINICA = {
  nombre: "Demo",
  tagline: "Centro médico integral",
  direccion: "Av. Corrientes 1234, CABA",
  telefono: "+54 11 4000-0000",
  email: "hola@demo-salud.com.ar",
  horario: "Lunes a viernes de 8 a 20 h · Sábados de 9 a 13 h",
} as const;

export const ESTADO_LABEL: Record<EstadoTurno, string> = {
  solicitado: "Solicitado",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  atendido: "Atendido",
  ausente: "Ausente",
};

export const ESTADO_CLASS: Record<EstadoTurno, string> = {
  solicitado: "bg-warning/15 text-warning-foreground border-warning/30",
  confirmado: "bg-success/15 text-success border-success/30",
  cancelado: "bg-destructive/10 text-destructive border-destructive/30",
  atendido: "bg-primary/10 text-primary border-primary/30",
  ausente: "bg-muted text-muted-foreground border-border",
};

export const OBRAS_SOCIALES = [
  "Particular",
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "PAMI",
  "IOMA",
  "Otra",
];

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function nombreCompleto(m: Pick<Medico, "nombre" | "apellido">) {
  return `Dra./Dr. ${m.nombre} ${m.apellido}`;
}

export function iniciales(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

/** yyyy-mm-dd de una fecha local */
export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function formatFechaLarga(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatFechaHora(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatHora(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatPrecio(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Genera los horarios de un médico para una fecha, descontando los ya tomados.
 */
export function generarSlots(
  dateKey: string,
  disponibilidades: Disponibilidad[],
  ocupados: string[],
): Date[] {
  const base = parseDateKey(dateKey);
  const dia = base.getDay();
  const tomados = new Set(ocupados.map((iso) => new Date(iso).getTime()));
  const ahora = Date.now();
  const slots: Date[] = [];

  for (const disp of disponibilidades.filter((d) => d.dia_semana === dia)) {
    const [hi, mi] = disp.hora_inicio.split(":").map(Number);
    const [hf, mf] = disp.hora_fin.split(":").map(Number);
    const cursor = new Date(base);
    cursor.setHours(hi ?? 9, mi ?? 0, 0, 0);
    const fin = new Date(base);
    fin.setHours(hf ?? 17, mf ?? 0, 0, 0);

    while (cursor < fin) {
      const t = cursor.getTime();
      if (t > ahora && !tomados.has(t)) slots.push(new Date(t));
      cursor.setMinutes(cursor.getMinutes() + (disp.duracion_min || 30));
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

/** Próximos N días con al menos una franja para el médico */
export function proximosDias(cantidad: number, start = new Date()): Date[] {
  const dias: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < cantidad; i++) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}
