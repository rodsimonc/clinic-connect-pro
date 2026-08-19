import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Stethoscope, LogOut, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CLINICA } from "@/lib/clinic";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/especialidades", label: "Especialidades" },
  { to: "/medicos", label: "Profesionales" },
  { to: "/turnos", label: "Sacar turno" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isStaff, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold">{CLINICA.nombre}</span>
            <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              {CLINICA.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {isStaff && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <ShieldCheck className="size-4" /> Panel
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/mis-turnos">
                  <CalendarDays className="size-4" /> Mis turnos
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Cerrar sesión">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Ingresar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/turnos">Sacar turno</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  {isStaff && (
                    <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                      <Link to="/admin">Panel de gestión</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                    <Link to="/mis-turnos">Mis turnos</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                    <Link to="/auth">Ingresar</Link>
                  </Button>
                  <Button asChild size="sm" onClick={() => setOpen(false)}>
                    <Link to="/turnos">Sacar turno</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
