"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { deleteMaterialAction } from "@/lib/actions/materials";
import type { Material } from "@/lib/db/materials";
import { formatMoney } from "@/lib/quotes/calculate";
import { MaterialFormDialog } from "@/components/materials/material-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MaterialsManagerProps = {
  materials: Material[];
  locale: string;
};

export function MaterialsManager({ materials, locale }: MaterialsManagerProps) {
  const t = useTranslations("materials");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(material: Material) {
    setEditing(material);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    const formData = new FormData();
    formData.set("id", id);
    formData.set("locale", locale);
    startTransition(async () => {
      await deleteMaterialAction(formData);
      router.refresh();
    });
  }

  if (materials.length === 0) {
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
            {t("addItem")}
          </Button>
        </div>
        <MaterialFormDialog
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
          {t("addItem")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("fields.name")}</TableHead>
              <TableHead>{t("fields.unit")}</TableHead>
              <TableHead className="text-right">{t("fields.unitCost")}</TableHead>
              <TableHead className="w-[100px] text-right">
                {tCommon("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell className="text-right">
                  {formatMoney(material.unitCost, locale)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(material)}
                      aria-label={tCommon("edit")}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(material.id)}
                      disabled={pending}
                      aria-label={tCommon("delete")}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <MaterialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        material={editing}
        locale={locale}
      />
    </>
  );
}
