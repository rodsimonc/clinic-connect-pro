import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { CalendarDays, Clock, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { medicosQuery } from "@/lib/queries";
import {
  ESTADO_LABEL,
  formatFechaLarga,
  formatHora,
  nombreCompleto,
  type Turno,
} from "@/lib/clinic";

export const Route = createFileRoute("/mis-turnos")({
  head: () => ({
    meta: [
      { title: "Mis turnos — Demo" },
      { name: "description", content: "Consultá, gestioná y cancelá tus turnos médicos." },
      { property: "og:title", content: "Mis turnos — Demo" },
      { property: "og:description", content: "Tu agenda médica en un solo lugar." },
    ],
  }),
  component: MisTurnosPage,
});

function MisTurnosPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: medicos = [] } = useQuery(medicosQuery);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: turnos = [] } = useQuery({
    queryKey: ["mis-turnos", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Turno[]> => {
      const { data, error } = await supabase
        .from("turnos")
        .select("*")
        .eq("paciente_id", user?.id ?? "")
        .order("fecha_hora", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Turno[];
    },
  });

  const cancelar = async (id: string) => {
    const { error } = await supabase.from("turnos").update({ estado: "cancelado" }).eq("id", id);
    if (error) {
      toast.error("No pudimos cancelar el turno");
      return;
    }
    toast.success("Turno cancelado");
    void qc.invalidateQueries({ queryKey: ["mis-turnos"] });
  };

  const ahora = Date.now();
  const proximos = turnos.filter(
    (t) => new Date(t.fecha_hora).getTime() >= ahora && t.estado !== "cancelado",
  );
  const historial = turnos.filter(
    (t) => new Date(t.fecha_hora).getTime() < ahora || t.estado === "cancelado",
  );

  const medicoDe = (id: string) => {
    const m = medicos.find((x) => x.id === id);
    return m ? nombreCompleto(m) : "Profesional";
  };

  const Item = ({ t, cancelable }: { t: Turno; cancelable: boolean }) => (
    <Card className="border-border/70">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="size-4 text-primary" />
            <p className="font-display text-lg font-semibold">{medicoDe(t.medico_id)}</p>
            <Badge variant="secondary">{ESTADO_LABEL[t.estado]}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 capitalize">
              <CalendarDays className="size-4" /> {formatFechaLarga(t.fecha_hora)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {formatHora(t.fecha_hora)} h
            </span>
            {t.obra_social && <span>{t.obra_social}</span>}
          </div>
          {t.motivo && <p className="mt-2 text-sm text-foreground/80">{t.motivo}</p>}
        </div>
        {cancelable && (
          <Button variant="outline" size="sm" onClick={() => cancelar(t.id)}>
            Cancelar
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Mis turnos</h1>
          <p className="mt-2 text-muted-foreground">{user?.email}</p>
        </div>
        <Button asChild>
          <Link to="/turnos">Sacar otro turno</Link>
        </Button>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Próximos</h2>
        <div className="mt-4 space-y-3">
          {proximos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Todavía no tenés turnos agendados.
              </CardContent>
            </Card>
          ) : (
            proximos.map((t) => <Item key={t.id} t={t} cancelable />)
          )}
        </div>
      </section>

      {historial.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Historial</h2>
          <div className="mt-4 space-y-3 opacity-80">
            {historial.map((t) => (
              <Item key={t.id} t={t} cancelable={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
