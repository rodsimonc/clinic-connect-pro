import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, ShieldCheck, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { especialidadesQuery, medicosQuery } from "@/lib/queries";
import {
  ESTADO_LABEL,
  DIAS,
  formatFechaLarga,
  formatHora,
  formatPrecio,
  nombreCompleto,
  type EstadoTurno,
  type Turno,
} from "@/lib/clinic";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de gestión — Demo" },
      { name: "description", content: "Agenda, profesionales y métricas del centro médico Demo." },
      { property: "og:title", content: "Panel de gestión — Demo" },
      { property: "og:description", content: "Gestión interna del centro médico Demo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const ESTADOS: EstadoTurno[] = ["solicitado", "confirmado", "atendido", "ausente", "cancelado"];

function AdminPage() {
  const { user, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [nota, setNota] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: medicos = [] } = useQuery(medicosQuery);
  const { data: especialidades = [] } = useQuery(especialidadesQuery);

  const { data: turnos = [] } = useQuery({
    queryKey: ["admin-turnos"],
    enabled: isStaff,
    queryFn: async (): Promise<Turno[]> => {
      const { data, error } = await supabase
        .from("turnos")
        .select("*")
        .order("fecha_hora", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Turno[];
    },
  });

  const metricas = useMemo(() => {
    const ahora = Date.now();
    const proximos = turnos.filter((t) => new Date(t.fecha_hora).getTime() >= ahora);
    const ingresos = turnos
      .filter((t) => t.estado === "atendido")
      .reduce(
        (acc, t) => acc + (medicos.find((m) => m.id === t.medico_id)?.precio_consulta ?? 0),
        0,
      );
    return {
      total: turnos.length,
      proximos: proximos.length,
      pendientes: turnos.filter((t) => t.estado === "solicitado").length,
      ingresos,
    };
  }, [turnos, medicos]);

  const activarAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) {
      toast.error("No se pudo activar el acceso");
      return;
    }
    if (data) {
      toast.success("Acceso de administración activado");
      window.location.reload();
    } else {
      toast.info("Ya existe un administrador. Pedile que te asigne el rol.");
    }
  };

  const cambiarEstado = async (id: string, estado: EstadoTurno) => {
    const { error } = await supabase.from("turnos").update({ estado }).eq("id", id);
    if (error) {
      toast.error("No se pudo actualizar el turno");
      return;
    }
    toast.success(`Turno ${ESTADO_LABEL[estado].toLowerCase()}`);
    void qc.invalidateQueries({ queryKey: ["admin-turnos"] });
  };

  const guardarNota = async (turno: Turno) => {
    const contenido = nota[turno.id]?.trim();
    if (!contenido || !user) return;
    const { error } = await supabase.from("notas_clinicas").insert({
      turno_id: turno.id,
      paciente_id: turno.paciente_id,
      autor_id: user.id,
      contenido,
    });
    if (error) {
      toast.error("No se pudo guardar la nota");
      return;
    }
    setNota((prev) => ({ ...prev, [turno.id]: "" }));
    toast.success("Nota clínica guardada");
  };

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-20 text-sm">Cargando…</div>;

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold">Panel de gestión</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tu cuenta todavía no tiene permisos de recepción o administración.
        </p>
        <Button className="mt-6" onClick={activarAdmin}>
          Activar acceso de administrador
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Solo funciona si aún no hay ningún administrador cargado.
        </p>
      </div>
    );
  }

  const medicoDe = (id: string) => {
    const m = medicos.find((x) => x.id === id);
    return m ? nombreCompleto(m) : "Profesional";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Panel de gestión</h1>
        <p className="mt-2 text-muted-foreground">Agenda, equipo y métricas del centro.</p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CalendarCheck, label: "Turnos totales", value: String(metricas.total) },
          { icon: CalendarCheck, label: "Próximos", value: String(metricas.proximos) },
          { icon: Users, label: "Por confirmar", value: String(metricas.pendientes) },
          { icon: Wallet, label: "Facturado", value: formatPrecio(metricas.ingresos) },
        ].map((m) => (
          <Card key={m.label} className="border-border/70">
            <CardContent className="pt-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <m.icon className="size-5" />
              </span>
              <p className="mt-3 font-display text-2xl font-semibold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="agenda" className="mt-10">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="equipo">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="mt-6 space-y-3">
          {turnos.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Todavía no hay turnos cargados.
              </CardContent>
            </Card>
          )}
          {turnos.map((t) => (
            <Card key={t.id} className="border-border/70">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-lg font-semibold">{medicoDe(t.medico_id)}</p>
                      <Badge variant="secondary">{ESTADO_LABEL[t.estado]}</Badge>
                    </div>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {formatFechaLarga(t.fecha_hora)} · {formatHora(t.fecha_hora)} h ·{" "}
                      {t.obra_social ?? "Particular"}
                    </p>
                    {t.motivo && <p className="mt-2 text-sm text-foreground/80">{t.motivo}</p>}
                  </div>
                  <Select
                    value={t.estado}
                    onValueChange={(v) => cambiarEstado(t.id, v as EstadoTurno)}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {ESTADO_LABEL[e]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Textarea
                    rows={2}
                    placeholder="Nota clínica de la consulta"
                    value={nota[t.id] ?? ""}
                    onChange={(e) => setNota((p) => ({ ...p, [t.id]: e.target.value }))}
                  />
                  <Button variant="outline" onClick={() => guardarNota(t)}>
                    Guardar nota
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="equipo" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicos.map((m) => (
            <Card key={m.id} className="border-border/70">
              <CardContent className="pt-6">
                <h3 className="font-display text-lg font-semibold">{nombreCompleto(m)}</h3>
                <p className="text-xs text-muted-foreground">
                  {especialidades.find((e) => e.id === m.especialidad_id)?.nombre} · MN{" "}
                  {m.matricula}
                </p>
                <p className="mt-3 text-sm">{formatPrecio(m.precio_consulta)} por consulta</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Agenda: {DIAS.filter((_, i) => i >= 1 && i <= 5).join(", ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
