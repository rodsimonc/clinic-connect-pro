import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { especialidadesQuery, medicosQuery } from "@/lib/queries";
import { nombreCompleto } from "@/lib/clinic";

export const Route = createFileRoute("/especialidades")({
  head: () => ({
    meta: [
      { title: "Especialidades médicas — Demo" },
      {
        name: "description",
        content:
          "Conocé las especialidades del centro médico Demo: clínica, cardiología, pediatría, dermatología y más.",
      },
      { property: "og:title", content: "Especialidades médicas — Demo" },
      {
        property: "og:description",
        content: "Todas las especialidades disponibles con turnos online.",
      },
    ],
  }),
  component: EspecialidadesPage,
});

function EspecialidadesPage() {
  const { data: especialidades = [], isLoading } = useQuery(especialidadesQuery);
  const { data: medicos = [] } = useQuery(medicosQuery);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Especialidades</h1>
        <p className="mt-3 text-muted-foreground">
          Cada especialidad tiene su propio equipo y agenda. Elegí la que necesitás y reservá en
          el horario que mejor te quede.
        </p>
      </header>

      {isLoading && <p className="mt-10 text-sm text-muted-foreground">Cargando…</p>}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {especialidades.map((e) => {
          const equipo = medicos.filter((m) => m.especialidad_id === e.id);
          return (
            <Card key={e.id} className="flex h-full flex-col border-border/70">
              <CardContent className="flex flex-1 flex-col pt-6">
                <span className="text-2xl">{e.icono}</span>
                <h2 className="mt-3 font-display text-xl font-semibold">{e.nombre}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{e.descripcion}</p>
                <ul className="mt-4 flex-1 space-y-1 text-sm text-foreground/80">
                  {equipo.slice(0, 3).map((m) => (
                    <li key={m.id}>· {nombreCompleto(m)}</li>
                  ))}
                  {equipo.length === 0 && (
                    <li className="text-muted-foreground">Equipo en incorporación</li>
                  )}
                </ul>
                <Button asChild variant="ghost" className="mt-4 self-start px-0 hover:bg-transparent">
                  <Link to="/turnos">
                    Sacar turno <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
