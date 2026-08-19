import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  FileHeart,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import hero from "@/assets/hero-clinica.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { especialidadesQuery, medicosQuery } from "@/lib/queries";
import { CLINICA, formatPrecio, iniciales, nombreCompleto } from "@/lib/clinic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Demo — Turnos médicos online en CABA" },
      {
        name: "description",
        content:
          "Reservá tu turno médico en minutos: 8 especialidades, profesionales matriculados, historia clínica digital y recordatorios automáticos.",
      },
      { property: "og:title", content: "Demo — Turnos médicos online" },
      {
        property: "og:description",
        content: "Reservá tu turno en minutos con profesionales matriculados.",
      },
    ],
  }),
  component: Index,
});

const beneficios = [
  {
    icon: CalendarCheck,
    titulo: "Turnos en 3 pasos",
    texto: "Elegí especialidad, profesional y horario disponible en tiempo real.",
  },
  {
    icon: BellRing,
    titulo: "Recordatorios",
    texto: "Te avisamos antes de la consulta para que no se te pase.",
  },
  {
    icon: FileHeart,
    titulo: "Historia clínica",
    texto: "Cada consulta queda registrada y disponible para tu profesional.",
  },
  {
    icon: ShieldCheck,
    titulo: "Datos protegidos",
    texto: "Acceso con login real y permisos por rol para el equipo médico.",
  },
];

function Index() {
  const { data: especialidades = [] } = useQuery(especialidadesQuery);
  const { data: medicos = [] } = useQuery(medicosQuery);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" /> Nueva plataforma de turnos
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Tu salud, con turno confirmado en un minuto.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {CLINICA.nombre} reúne {especialidades.length || 8} especialidades, profesionales
              matriculados y una agenda online que se actualiza en tiempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/turnos">
                  Sacar turno <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/especialidades">Ver especialidades</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: "+12.000", v: "consultas al año" },
                { k: `${medicos.length || 10}`, v: "profesionales" },
                { k: "4,9", v: "puntaje pacientes" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-semibold text-foreground">{s.k}</dt>
                  <dd className="text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
            <img
              src={hero}
              alt="Recepción luminosa del centro médico Demo"
              className="w-full rounded-[2rem] border border-border object-cover shadow-xl"
              loading="eager"
            />
            <Card className="absolute -bottom-6 left-4 w-56 border-border/80 shadow-lg">
              <CardContent className="flex items-center gap-3 py-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
                  <CalendarCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Turno confirmado</p>
                  <p className="text-xs text-muted-foreground">Sin llamadas ni esperas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((b) => (
            <Card key={b.titulo} className="border-border/70">
              <CardContent className="pt-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <b.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{b.titulo}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.texto}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Especialidades</h2>
            <p className="mt-2 text-muted-foreground">
              Atención integral para toda la familia, con agenda propia por profesional.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/especialidades">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {especialidades.slice(0, 6).map((e) => (
            <Link key={e.id} to="/turnos" className="group">
              <Card className="h-full border-border/70 transition-all group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-md">
                <CardContent className="pt-6">
                  <span className="text-2xl">{e.icono}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold">{e.nombre}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {e.descripcion}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Reservar <ArrowRight className="size-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Profesionales destacados
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {medicos.slice(0, 4).map((m) => (
            <Card key={m.id} className="border-border/70">
              <CardContent className="pt-6 text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-semibold text-primary">
                  {iniciales(m.nombre, m.apellido)}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{nombreCompleto(m)}</h3>
                <p className="text-xs text-muted-foreground">MN {m.matricula}</p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {formatPrecio(m.precio_consulta)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <Card className="overflow-hidden border-none bg-primary text-primary-foreground">
          <CardContent className="flex flex-wrap items-center justify-between gap-6 py-10">
            <div>
              <div className="flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold">
                ¿Listo para tu próxima consulta?
              </h2>
              <p className="mt-2 max-w-lg text-primary-foreground/80">
                Creá tu cuenta y gestioná todos tus turnos desde un solo lugar.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link to="/turnos">Reservar ahora</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
