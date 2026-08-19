import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Disponibilidad, Especialidad, Medico } from "@/lib/clinic";

export const especialidadesQuery = queryOptions({
  queryKey: ["especialidades"],
  queryFn: async (): Promise<Especialidad[]> => {
    const { data, error } = await supabase
      .from("especialidades")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Especialidad[];
  },
});

export const medicosQuery = queryOptions({
  queryKey: ["medicos"],
  queryFn: async (): Promise<Medico[]> => {
    const { data, error } = await supabase
      .from("medicos")
      .select("*")
      .order("apellido", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Medico[];
  },
});

export function disponibilidadesQuery(medicoId: string | null) {
  return queryOptions({
    queryKey: ["disponibilidades", medicoId],
    enabled: Boolean(medicoId),
    queryFn: async (): Promise<Disponibilidad[]> => {
      if (!medicoId) return [];
      const { data, error } = await supabase
        .from("disponibilidades")
        .select("*")
        .eq("medico_id", medicoId);
      if (error) throw error;
      return (data ?? []) as Disponibilidad[];
    },
  });
}

export function turnosOcupadosQuery(medicoId: string | null, dateKey: string) {
  return queryOptions({
    queryKey: ["turnos-ocupados", medicoId, dateKey],
    enabled: Boolean(medicoId),
    queryFn: async (): Promise<string[]> => {
      if (!medicoId) return [];
      const desde = new Date(`${dateKey}T00:00:00`);
      const hasta = new Date(desde);
      hasta.setDate(hasta.getDate() + 1);
      const { data, error } = await supabase
        .from("turnos")
        .select("fecha_hora, estado")
        .eq("medico_id", medicoId)
        .gte("fecha_hora", desde.toISOString())
        .lt("fecha_hora", hasta.toISOString());
      if (error) throw error;
      return ((data ?? []) as { fecha_hora: string; estado: string }[])
        .filter((t) => t.estado !== "cancelado")
        .map((t) => t.fecha_hora);
    },
  });
}
