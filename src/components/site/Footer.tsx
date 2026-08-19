import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, Stethoscope } from "lucide-react";
import { CLINICA } from "@/lib/clinic";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">{CLINICA.nombre}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Centro médico con turnos online, historia clínica digital y recordatorios automáticos
            para que no se te pase ninguna consulta.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/especialidades" className="text-foreground/80 hover:text-primary">
                Especialidades
              </Link>
            </li>
            <li>
              <Link to="/medicos" className="text-foreground/80 hover:text-primary">
                Profesionales
              </Link>
            </li>
            <li>
              <Link to="/turnos" className="text-foreground/80 hover:text-primary">
                Sacar turno
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="text-foreground/80 hover:text-primary">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Dónde estamos
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-primary" /> {CLINICA.direccion}
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 text-primary" /> {CLINICA.telefono}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 text-primary" /> {CLINICA.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 text-primary" /> {CLINICA.horario}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {CLINICA.nombre}. Sitio de demostración — no reemplaza una
        consulta médica.
      </div>
    </footer>
  );
}
