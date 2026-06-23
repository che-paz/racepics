"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { invitePhotographer } from "@/app/(dashboard)/organizer/events/actions";

type Invite = {
  photographer_id: string;
  invited_at: string;
  display_name: string;
};

type Props = {
  eventId: string;
  invites: Invite[];
};

export default function InvitePhotographerForm({ eventId, invites }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await invitePhotographer(eventId, {}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotógrafos invitados</CardTitle>
        <CardDescription>
          Invita fotógrafos por email. Deben estar registrados con rol
          fotógrafo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.length > 0 && (
          <ul className="space-y-2 text-sm">
            {invites.map((invite) => (
              <li
                key={invite.photographer_id}
                className="rounded-md border px-3 py-2"
              >
                {invite.display_name}
                <span className="ml-2 text-muted-foreground">
                  · invitado{" "}
                  {new Date(invite.invited_at).toLocaleDateString("es-ES")}
                </span>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="flex gap-2"
        >
          <Input
            name="email"
            type="email"
            placeholder="fotografo@email.com"
            required
            className="max-w-sm"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Invitando…" : "Invitar"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600" role="status">
            Fotógrafo invitado correctamente.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
