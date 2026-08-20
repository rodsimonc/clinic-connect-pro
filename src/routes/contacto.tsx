import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CLINICA } from "@/lib/clinic";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto y ubicación — Demo" },
      {
        name: "description",
        content:
          "Dirección, teléfono, horarios de atención y guardia del centro médico Demo en CABA.",
      },
      { property: "og:title", content: "Contacto y ubicación — Demo" },
      { property: "og:description", content: "Cómo llegar y comunicarte con el centro Demo." },
    ],
  }),
  component: ContactoPage,
});

const datos = [
  { icon: MapPin, label: "Dirección", value: CLINICA.direccion },
  { icon: Phone, label: "Teléfono", value: CLINICA.telefono },
  { icon: Mail, label: "Email", value: CLINICA.email },
  { icon: Clock, label: "Horarios", value: CLINICA.horario },
];

function ContactoPage() {
  // Link a WhatsApp derivado del mismo teléfono de la clínica (sin caracteres no
  // numéricos) + mensaje prellenado.
  const waHref = `https://wa.me/${CLINICA.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hola, quiero hacer una consulta.",
  )}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Contacto</h1>
        <p className="mt-3 text-muted-foreground">
          Estamos para ayudarte. Para consultas administrativas escribinos o llamanos; para
          atención médica, reservá un turno online.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {datos.map((d) => (
          <Card key={d.label} className="border-border/70">
            <CardContent className="flex items-start gap-4 pt-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <d.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{d.label}</p>
                <p className="mt-1 font-medium text-foreground">{d.value}</p>
                {d.label === "Teléfono" && (
                  <Button asChild size="sm" className="mt-3">
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-4" /> Escribinos por WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-none bg-secondary">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <h2 className="font-display text-2xl font-semibold">¿Necesitás una consulta?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reservá online y recibí la confirmación al instante.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/turnos">Sacar turno</Link>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
        <strong>Urgencias:</strong> ante una emergencia médica llamá al 107 o acercate a la guardia
        más cercana.
      </p>
    </div>
  );
}
