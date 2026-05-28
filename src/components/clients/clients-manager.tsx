"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Mail, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";

import { deleteClientAction } from "@/lib/actions/clients";
import type { Client } from "@/lib/db/clients";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ClientsManagerProps = {
  clients: Client[];
  locale: string;
};

export function ClientsManager({ clients, locale }: ClientsManagerProps) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState(false);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    setDeleteError(false);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("locale", locale);
    startTransition(async () => {
      const result = await deleteClientAction(formData);
      if (!result.success) {
        setDeleteError(true);
        return;
      }
      router.refresh();
    });
  }

  if (clients.length === 0) {
    return (
      <>
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <div>
            <p className="text-sm font-medium">{t("emptyTitle")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
          </div>
          <Button onClick={openCreate} size="lg" className="h-11">
            <Plus data-icon="inline-start" />
            {t("addClient")}
          </Button>
        </div>
        <ClientFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          locale={locale}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate} size="lg" className="h-11">
          <Plus data-icon="inline-start" />
          {t("addClient")}
        </Button>
      </div>
      {deleteError ? (
        <p className="mb-4 text-sm text-destructive">{t("deleteHasQuotes")}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{client.name}</CardTitle>
                {client.email ? (
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {client.email}
                  </CardDescription>
                ) : null}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(client)}
                  aria-label={tCommon("edit")}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(client.id)}
                  disabled={pending}
                  aria-label={tCommon("delete")}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {client.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0" />
                  {client.phone}
                </p>
              ) : null}
              {client.address ? (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {client.address}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editing}
        locale={locale}
      />
    </>
  );
}
