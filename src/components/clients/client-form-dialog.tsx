"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createClientAction,
  updateClientAction,
} from "@/lib/actions/clients";
import type { Client } from "@/lib/db/clients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClientFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  locale: string;
  onCreated?: (clientId: string) => void;
};

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  locale,
  onCreated,
}: ClientFormDialogProps) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const isEdit = Boolean(client);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    if (client) formData.set("id", client.id);

    startTransition(async () => {
      if (isEdit) {
        const result = await updateClientAction(formData);
        if (!result.success) {
          setError(true);
          return;
        }
      } else {
        const result = await createClientAction(formData);
        if (!result.success) {
          setError(true);
          return;
        }
        onCreated?.(result.clientId);
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editClient") : t("addClient")}</DialogTitle>
          <DialogDescription>{t("formDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">{t("fields.name")}</Label>
            <Input
              id="client-name"
              name="name"
              defaultValue={client?.name}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-email">{t("fields.email")}</Label>
            <Input
              id="client-email"
              name="email"
              type="email"
              defaultValue={client?.email}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-phone">{t("fields.phone")}</Label>
            <Input
              id="client-phone"
              name="phone"
              defaultValue={client?.phone}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-address">{t("fields.address")}</Label>
            <Textarea
              id="client-address"
              name="address"
              defaultValue={client?.address}
              rows={3}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{tCommon("error")}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={pending} className="h-11">
              {pending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
