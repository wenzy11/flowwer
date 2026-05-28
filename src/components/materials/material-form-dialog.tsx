"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createMaterialAction,
  updateMaterialAction,
} from "@/lib/actions/materials";
import type { Material } from "@/lib/db/materials";
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

type MaterialFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  locale: string;
};

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  locale,
}: MaterialFormDialogProps) {
  const t = useTranslations("materials");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const isEdit = Boolean(material);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    if (material) formData.set("id", material.id);

    startTransition(async () => {
      const result = isEdit
        ? await updateMaterialAction(formData)
        : await createMaterialAction(formData);

      if (!result.success) {
        setError(true);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editItem") : t("addItem")}
          </DialogTitle>
          <DialogDescription>{t("formDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fields.name")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={material?.name}
              required
              className="h-11"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">{t("fields.unit")}</Label>
              <Input
                id="unit"
                name="unit"
                defaultValue={material?.unit}
                placeholder={t("fields.unitPlaceholder")}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">{t("fields.unitCost")}</Label>
              <Input
                id="unitCost"
                name="unitCost"
                type="number"
                min="0"
                step="0.01"
                defaultValue={material?.unitCost}
                required
                className="h-11"
              />
            </div>
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
