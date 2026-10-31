"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { DateField } from "./DateField";
import {
  type Data,
  type Entity,
  type Kind,
  type Project,
  type Member,
  type Task,
  blank,
  validate,
  categories,
  priorities,
  statuses,
} from "@/lib/domain";
export function Choice({
  id,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select
      value={value || "__none"}
      onValueChange={(v) => onChange(v === "__none" ? "" : v)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
const options = (values: readonly string[]) =>
  values.map((x) => ({ value: x, label: x }));
export function EntityForm({
  kind,
  entity,
  data,
  onClose,
  onSave,
}: {
  kind: Kind;
  entity?: Entity;
  data: Data;
  onClose: () => void;
  onSave: (value: Entity) => Promise<void>;
}) {
  const [value, setValue] = useState<Entity>(() =>
    structuredClone(entity || blank(kind)),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const set = (field: string, v: unknown) =>
    setValue((prev) => ({ ...prev, [field]: v }));
  const p = value as Project,
    m = value as Member,
    t = value as Task;
  const title =
    kind === "project" ? "proyecto" : kind === "member" ? "miembro" : "tarea";
  const field = (id: string, label: string, control: React.ReactNode) => (
    <div className="space-y-2" key={id}>
      <Label htmlFor={id}>{label}</Label>
      {control}
    </div>
  );
  const input = (key: string, label: string, v: string, type = "text") =>
    field(
      key,
      label,
      <Input
        id={key}
        value={v}
        type={type}
        onChange={(e) => set(key, e.target.value)}
        maxLength={key === "description" ? 500 : 150}
      />,
    );
  const choice = (
    key: string,
    label: string,
    v: string,
    items: { value: string; label: string }[],
    callback?: (v: string) => void,
  ) =>
    field(
      key,
      label,
      <Choice
        id={key}
        value={v}
        onChange={callback || ((v) => set(key, v))}
        options={items}
      />,
    );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onInteractOutside={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {entity ? "Editar" : "Crear"} {title}
          </DialogTitle>
          <DialogDescription>
            Completa la información. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const problems = validate(kind, value, data);
            setErrors(problems);
            if (problems.length) return;
            setBusy(true);
            try {
              await onSave(value);
              onClose();
            } catch (error) {
              setErrors([
                error instanceof Error ? error.message : "No se pudo guardar.",
              ]);
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-5"
        >
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Revisa los datos</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <fieldset disabled={busy} className="space-y-5">
            {kind === "project" && (
              <>
                {input("name", "Nombre del proyecto *", p.name)}
                {field(
                  "description",
                  "Descripción",
                  <Textarea
                    id="description"
                    value={p.description}
                    maxLength={500}
                    onChange={(e) => set("description", e.target.value)}
                  />,
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {choice(
                    "category",
                    "Categoría *",
                    p.category,
                    options(categories),
                  )}
                  {choice(
                    "priority",
                    "Prioridad *",
                    p.priority,
                    options(priorities),
                  )}
                </div>
                {choice(
                  "status",
                  "Estado *",
                  p.status,
                  options([
                    "Planificado",
                    "En progreso",
                    "En revisión",
                    "Completado",
                  ]),
                )}
                <div className="space-y-3">
                  <Label>Miembros del equipo</Label>
                  <div className="max-h-40 space-y-3 overflow-auto rounded-lg border p-3">
                    {data.members.length ? (
                      data.members.map((member) => (
                        <label
                          key={member.userId}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Checkbox
                            checked={p.memberIds.includes(member.userId)}
                            onCheckedChange={(checked) =>
                              set(
                                "memberIds",
                                checked
                                  ? [...p.memberIds, member.userId]
                                  : p.memberIds.filter(
                                      (id) => id !== member.userId,
                                    ),
                              )
                            }
                          />
                          {member.name}
                          <span className="text-muted-foreground">
                            {member.position}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Primero crea un miembro en Equipo.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
            {kind === "member" && (
              <>
                <p className="text-xs text-muted-foreground">
                  ID: {m.userId || "Se genera automáticamente"}
                </p>
                {input("name", "Nombre completo *", m.name)}
                <div className="grid gap-4 sm:grid-cols-2">
                  {input("email", "Correo electrónico *", m.email, "email")}
                  {input("phone", "Teléfono *", m.phone, "tel")}
                  {choice(
                    "role",
                    "Rol *",
                    m.role,
                    options(["Administrador", "Líder", "Colaborador"]),
                  )}
                  {input("position", "Cargo *", m.position)}
                </div>
                {field(
                  "birthdate",
                  "Fecha de nacimiento *",
                  <DateField
                    id="birthdate"
                    value={m.birthdate}
                    birth
                    onChange={(v) => set("birthdate", v)}
                  />,
                )}
                {choice(
                  "projectId",
                  "Proyecto principal",
                  m.projectId,
                  data.projects.map((p) => ({ value: p.id, label: p.name })),
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Miembro activo</Label>
                  <Switch
                    id="isActive"
                    checked={m.isActive}
                    onCheckedChange={(v) => set("isActive", v)}
                  />
                </div>
              </>
            )}
            {kind === "task" && (
              <>
                {input(
                  "description",
                  "Descripción de la tarea *",
                  t.description,
                )}
                {choice(
                  "projectId",
                  "Proyecto *",
                  t.projectId,
                  data.projects.map((p) => ({ value: p.id, label: p.name })),
                  (v) =>
                    setValue((prev) => ({ ...prev, projectId: v, userId: "" })),
                )}
                {choice(
                  "userId",
                  "Responsable *",
                  t.userId,
                  data.members
                    .filter((m) =>
                      data.projects
                        .find((p) => p.id === t.projectId)
                        ?.memberIds.includes(m.userId),
                    )
                    .map((m) => ({ value: m.userId, label: m.name })),
                )}
                <p className="text-xs text-muted-foreground">
                  El responsable debe pertenecer al proyecto. Puedes asignar
                  miembros desde Proyectos.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {choice("status", "Estado *", t.status, options(statuses))}
                  {choice(
                    "priority",
                    "Prioridad *",
                    t.priority,
                    options(priorities),
                  )}
                </div>
                {field(
                  "dateline",
                  "Fecha límite *",
                  <DateField
                    id="dateline"
                    value={t.dateline}
                    onChange={(v) => set("dateline", v)}
                  />,
                )}
              </>
            )}
          </fieldset>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Spinner />}
              {busy ? "Guardando…" : "Guardar " + title}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
