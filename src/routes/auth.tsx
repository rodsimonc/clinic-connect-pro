import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthSearch = { medico?: string; especialidad?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const out: AuthSearch = {};
    if (typeof search.medico === "string" && search.medico) out.medico = search.medico;
    if (typeof search.especialidad === "string" && search.especialidad) {
      out.especialidad = search.especialidad;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta — Demo" },
      {
        name: "description",
        content: "Accedé a tu cuenta para gestionar turnos médicos en el centro Demo.",
      },
      { property: "og:title", content: "Ingresar — Demo" },
      { property: "og:description", content: "Accedé para gestionar tus turnos médicos." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // Si el usuario venía de reservar (llega con ?medico/?especialidad), lo
  // devolvemos a la reserva con la selección; si no, a sus turnos.
  const irADestino = () => {
    if (search.medico || search.especialidad) {
      const s: AuthSearch = {};
      if (search.medico) s.medico = search.medico;
      if (search.especialidad) s.especialidad = search.especialidad;
      void navigate({ to: "/turnos", search: s });
    } else {
      void navigate({ to: "/mis-turnos" });
    }
  };

  useEffect(() => {
    if (user) irADestino();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("¡Bienvenido de nuevo!");
    irADestino();
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/mis-turnos`,
        data: { nombre_completo: nombre, telefono },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cuenta creada. Ya podés reservar tu turno.");
    irADestino();
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Stethoscope className="size-6" />
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Tu cuenta</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Gestioná tus turnos, historial y datos personales.
      </p>

      <Card className="mt-8 w-full border-border/70">
        <CardContent className="pt-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form className="mt-6 space-y-4" onSubmit={signIn}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vos@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Ingresando…" : "Ingresar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="mt-6 space-y-4" onSubmit={signUp}>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre y apellido</Label>
                  <Input
                    id="nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ana Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tel">Teléfono</Label>
                  <Input
                    id="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="11 5555-5555"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Contraseña</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta…" : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/*
            Login con Google deshabilitado: el provider no está configurado en
            Supabase, así que el OAuth caía en un 404. Para reactivarlo:
              1. Supabase → Authentication → Providers → Google (Client ID + Secret de Google Cloud).
              2. Google Cloud → OAuth: redirect URI https://<project>.supabase.co/auth/v1/callback
              3. Supabase → Authentication → URL Configuration: agregar la URL del sitio.
            Luego restaurar el botón con supabase.auth.signInWithOAuth({ provider: "google" }).
          */}
        </CardContent>
      </Card>
    </div>
  );
}
