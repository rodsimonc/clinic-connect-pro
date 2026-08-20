import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Check, Clock, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  disponibilidadesQuery,
  especialidadesQuery,
  medicosQuery,
  turnosOcupadosQuery,
} from "@/lib/queries";
import {
  OBRAS_SOCIALES,
  formatFechaLarga,
  formatHora,
  formatPrecio,
  generarSlots,
  nombreCompleto,
  proximosDias,
  toDateKey,
} from "@/lib/clinic";

type TurnosSearch = { medico?: string; especialidad?: string };

export const Route = createFileRoute("/turnos")({
  validateSearch: (search: Record<string, unknown>): TurnosSearch => {
    const out: TurnosSearch = {};
    if (typeof search.medico === "string" && search.medico) out.medico = search.medico;
    if (typeof search.especialidad === "string" && search.especialidad) {
      out.especialidad = search.especialidad;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Sacar turno online — Demo" },
      {
        name: "description",
        content:
          "Reservá tu turno médico en el centro Demo: elegí especialidad, profesional, día y horario disponible.",
      },
      { property: "og:title", content: "Sacar turno online — Demo" },
      { property: "og:description", content: "Agenda en tiempo real, confirmación inmediata." },
    ],
  }),
  component: TurnosPage,
});

function TurnosPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user } = useAuth();
  const [especialidadId, setEspecialidadId] = useState<string>(search.especialidad ?? "");
  const [medicoId, setMedicoId] = useState<string>(search.medico ?? "");
  const [dateKey, setDateKey] = useState<string>(toDateKey(new Date()));
  const [slot, setSlot] = useState<string>("");
  const [motivo, setMotivo] = useState("");
  const [obraSocial, setObraSocial] = useState("Particular");
  const [enviando, setEnviando] = useState(false);

  const { data: especialidades = [] } = useQuery(especialidadesQuery);
  const { data: medicos = [] } = useQuery(medicosQuery);
  const { data: disponibilidades = [] } = useQuery(disponibilidadesQuery(medicoId || null));
  const { data: ocupados = [] } = useQuery(turnosOcupadosQuery(medicoId || null, dateKey));

  const medicosFiltrados = useMemo(
    () => medicos.filter((m) => !especialidadId || m.especialidad_id === especialidadId),
    [medicos, especialidadId],
  );
  const medico = medicos.find((m) => m.id === medicoId) ?? null;

  // Preselección vía search params (?medico / ?especialidad): una vez cargados
  // los médicos, deriva la especialidad del profesional elegido y descarta ids inválidos.
  useEffect(() => {
    if (!medicoId || medicos.length === 0) return;
    const m = medicos.find((x) => x.id === medicoId);
    if (!m) {
      setMedicoId("");
      return;
    }
    if (!especialidadId) setEspecialidadId(m.especialidad_id);
  }, [medicos, medicoId, especialidadId]);

  const dias = useMemo(() => proximosDias(14), []);
  const slots = useMemo(
    () => (medicoId ? generarSlots(dateKey, disponibilidades, ocupados) : []),
    [medicoId, dateKey, disponibilidades, ocupados],
  );

  const reservar = async () => {
    if (!user) {
      toast.info("Ingresá a tu cuenta para confirmar el turno");
      const s: TurnosSearch = {};
      if (medicoId) s.medico = medicoId;
      if (especialidadId) s.especialidad = especialidadId;
      void navigate({ to: "/auth", search: s });
      return;
    }
    if (!medicoId || !slot) return;
    setEnviando(true);
    const { error } = await supabase.from("turnos").insert({
      paciente_id: user.id,
      medico_id: medicoId,
      fecha_hora: new Date(slot).toISOString(),
      motivo,
      obra_social: obraSocial,
    });
    setEnviando(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "Ese horario acaba de ocuparse" : "No pudimos reservar el turno",
      );
      return;
    }
    toast.success("¡Turno reservado!");
    void navigate({ to: "/mis-turnos" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Sacar turno</h1>
        <p className="mt-3 text-muted-foreground">
          Cuatro pasos y listo. Los horarios se actualizan en tiempo real según la agenda de cada
          profesional.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="border-border/70">
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>1 · Especialidad</Label>
                <Select
                  value={especialidadId}
                  onValueChange={(v) => {
                    setEspecialidadId(v);
                    setMedicoId("");
                    setSlot("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.icono} {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>2 · Profesional</Label>
                <Select
                  value={medicoId}
                  onValueChange={(v) => {
                    setMedicoId(v);
                    setSlot("");
                  }}
                  disabled={!especialidadId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí un profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicosFiltrados.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {nombreCompleto(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="pt-6">
              <Label className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" /> 3 · Día
              </Label>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {dias.map((d) => {
                  const key = toDateKey(d);
                  const activo = key === dateKey;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setDateKey(key);
                        setSlot("");
                      }}
                      className={`min-w-[74px] rounded-xl border px-3 py-2 text-center transition-colors ${
                        activo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="block text-[11px] uppercase opacity-80">
                        {new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(d)}
                      </span>
                      <span className="block font-display text-lg font-semibold">
                        {d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Label className="mt-6 flex items-center gap-2">
                <Clock className="size-4 text-primary" /> 4 · Horario
              </Label>
              {!medicoId ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Elegí primero especialidad y profesional.
                </p>
              ) : slots.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No hay horarios disponibles ese día. Probá con otra fecha.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const iso = s.toISOString();
                    const activo = iso === slot;
                    return (
                      <button
                        key={iso}
                        onClick={() => setSlot(iso)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          activo
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {formatHora(s)}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="motivo">Motivo de la consulta</Label>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Contanos brevemente el motivo"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Cobertura</Label>
                <Select value={obraSocial} onValueChange={setObraSocial}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OBRAS_SOCIALES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-24 border-border/70">
            <CardContent className="pt-6">
              <h2 className="font-display text-xl font-semibold">Resumen</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <UserRound className="mt-0.5 size-4 text-primary" />
                  <span>{medico ? nombreCompleto(medico) : "Sin profesional elegido"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 size-4 text-primary" />
                  <span className="capitalize">{formatFechaLarga(dateKey + "T12:00:00")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 text-primary" />
                  <span>{slot ? formatHora(slot) : "Sin horario elegido"}</span>
                </div>
                {medico && (
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" />
                    <span>{formatPrecio(medico.precio_consulta)} · {obraSocial}</span>
                  </div>
                )}
              </dl>

              <Button
                className="mt-6 w-full"
                disabled={!slot || enviando}
                onClick={reservar}
                size="lg"
              >
                {enviando ? "Reservando…" : user ? "Confirmar turno" : "Ingresar y confirmar"}
              </Button>
              {!user && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  ¿Ya tenés cuenta?{" "}
                  <Link to="/auth" className="text-primary underline-offset-2 hover:underline">
                    Ingresar
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
