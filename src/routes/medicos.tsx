import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { especialidadesQuery, medicosQuery } from "@/lib/queries";
import { formatPrecio, iniciales, nombreCompleto } from "@/lib/clinic";

export const Route = createFileRoute("/medicos")({
  head: () => ({
    meta: [
      { title: "Profesionales — Demo" },
      {
        name: "description",
        content:
          "Equipo médico matriculado del centro Demo: perfiles, especialidades y valor de consulta.",
      },
      { property: "og:title", content: "Profesionales — Demo" },
      { property: "og:description", content: "Conocé al equipo médico del centro Demo." },
    ],
  }),
  component: MedicosPage,
});

function MedicosPage() {
  const { data: medicos = [] } = useQuery(medicosQuery);
  const { data: especialidades = [] } = useQuery(especialidadesQuery);
  const [filtro, setFiltro] = useState<string>("todas");

  const visibles = useMemo(
    () => (filtro === "todas" ? medicos : medicos.filter((m) => m.especialidad_id === filtro)),
    [medicos, filtro],
  );

  const nombreEsp = (id: string) => especialidades.find((e) => e.id === id)?.nombre ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Nuestros profesionales
        </h1>
        <p className="mt-3 text-muted-foreground">
          Todos matriculados y con agenda online actualizada.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro("todas")}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            filtro === "todas"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/40"
          }`}
        >
          Todas
        </button>
        {especialidades.map((e) => (
          <button
            key={e.id}
            onClick={() => setFiltro(e.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filtro === e.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            }`}
          >
            {e.nombre}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((m) => (
          <Card key={m.id} className="border-border/70">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-lg font-semibold text-primary">
                  {iniciales(m.nombre, m.apellido)}
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold leading-tight">
                    {nombreCompleto(m)}
                  </h2>
                  <Badge variant="secondary" className="mt-1">
                    {nombreEsp(m.especialidad_id)}
                  </Badge>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{m.bio}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-semibold">{formatPrecio(m.precio_consulta)}</p>
                  <p className="text-xs text-muted-foreground">MN {m.matricula}</p>
                </div>
                <Button asChild size="sm">
                  <Link
                    to="/turnos"
                    search={{ medico: m.id, especialidad: m.especialidad_id }}
                  >
                    Reservar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
