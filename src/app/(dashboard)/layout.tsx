import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProfile, ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = (await ensureProfile(supabase, user)) ?? (await getProfile(supabase, user.id));

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Perfil no encontrado</CardTitle>
            <CardDescription>
              Tu cuenta existe en Auth pero no hay fila en{" "}
              <code className="text-xs">profiles</code>. Esto suele pasar si te
              registraste antes de aplicar las migraciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              No se pudo crear tu perfil automáticamente. Ejecuta en Supabase →
              SQL Editor:
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
              {`INSERT INTO public.profiles (id, role, display_name)
SELECT id, 'organizer', split_part(email, '@', 1)
FROM auth.users
WHERE id = '${user.id}'
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role;`}
            </pre>
            <p className="text-muted-foreground">User ID: {user.id}</p>
            <form action={signOut}>
              <button type="submit" className="text-primary underline">
                Cerrar sesión e intentar de nuevo
              </button>
            </form>
            <Link href="/" className="block text-muted-foreground underline">
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold">
              RacePics
            </Link>
            {profile.role === "organizer" && (
              <nav className="flex gap-4 text-sm">
                <Link
                  href="/organizer/events"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Mis eventos
                </Link>
              </nav>
            )}
            {profile.role === "photographer" && (
              <nav className="flex gap-4 text-sm">
                <Link
                  href="/photographer/events"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Mis eventos
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {profile.display_name ?? user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
