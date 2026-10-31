"use client";
import { useState, useSyncExternalStore, useEffect } from "react";
import {
  FolderKanban,
  CheckCheck,
  Users,
  Clock3,
  Plus,
  ArrowUpRight,
  LayoutDashboard,
  ListTodo,
  Settings2,
  Search,
  Trash2,
  Pencil,
  Layers3,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EntityForm, Choice } from "./EntityForm";
import {
  type Data,
  type Entity,
  type Kind,
  type Project,
  type Settings,
  initialData,
  saveEntity,
  deleteEntity,
  metrics,
  projectProgress,
  uid,
} from "@/lib/domain";
const STORAGE = "lab11-nexo-v1";
const subscribe = () => () => {};
const delay = () => new Promise((resolve) => setTimeout(resolve, 700));
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
const date = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
function Status({ children }: { children: string }) {
  return (
    <Badge
      variant={
        children === "Urgente"
          ? "destructive"
          : children === "Completado" || children === "Activo"
            ? "default"
            : children === "En progreso"
              ? "secondary"
              : "outline"
      }
    >
      {children}
    </Badge>
  );
}
export default function Dashboard() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [data, setData] = useState<Data>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE);
        if (raw) {
          const d = JSON.parse(raw);
          if (
            Array.isArray(d.projects) &&
            Array.isArray(d.members) &&
            Array.isArray(d.tasks) &&
            d.settings &&
            Array.isArray(d.activity)
          )
            return d;
        }
      } catch {}
    }
    return structuredClone(initialData);
  });
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        localStorage.setItem(STORAGE, JSON.stringify(data));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data, hydrated]);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{ kind: Kind; entity?: Entity } | null>(
    null,
  );
  const [detail, setDetail] = useState<Project | null>(null);
  const [removal, setRemoval] = useState<{
    kind: Kind;
    id: string;
    name: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const stats = metrics(data),
    query = search.toLowerCase().trim();
  const projects = data.projects.filter((p) =>
    `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query),
  );
  const members = data.members.filter((m) =>
    `${m.name} ${m.email} ${m.position}`.toLowerCase().includes(query),
  );
  const tasks = data.tasks.filter(
    (t) =>
      `${t.description} ${data.projects.find((p) => p.id === t.projectId)?.name} ${data.members.find((m) => m.userId === t.userId)?.name}`
        .toLowerCase()
        .includes(query) &&
      (!filter || t.status === filter),
  );
  const pageSize = Number(data.settings.pageSize),
    pages = Math.max(1, Math.ceil(tasks.length / pageSize)),
    current = Math.min(page, pages),
    visible = tasks.slice((current - 1) * pageSize, current * pageSize);
  const save = async (kind: Kind, value: Entity) => {
    await delay();
    setData((prev) => saveEntity(prev, kind, value));
    setNotice("Los cambios se guardaron correctamente.");
  };
  const tools = (kind: Kind, entity: Entity, name: string, id: string) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Editar ${name}`}
        onClick={() => setEditor({ kind, entity })}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        aria-label={`Eliminar ${name}`}
        onClick={() => setRemoval({ kind, id, name })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
  const empty = (text: string) => (
    <div className="col-span-full rounded-xl border border-dashed py-16 text-center">
      <Search className="mx-auto mb-3 size-7 text-muted-foreground" />
      <p className="font-medium">{text}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Crea un registro o prueba otra búsqueda.
      </p>
    </div>
  );
  if (!hydrated)
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <Spinner /> Cargando espacio de trabajo…
      </div>
    );
  return (
    <div
      data-theme={data.settings.theme}
      className="min-h-screen bg-background text-foreground"
    >
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
          <a
            href="/dashboard"
            className="flex items-center gap-3 font-bold tracking-tight text-xl"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers3 className="size-5" />
            </span>
            nexo
            <span className="ml-3 hidden border-l pl-5 text-xs font-normal tracking-normal text-muted-foreground sm:block">
              Espacio de proyectos
            </span>
          </a>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex">
              LAB 11 · Desarrollo Web
            </Badge>
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                GH
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
              {data.settings.workspace}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Dashboard de Proyectos<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Organiza al equipo. Conecta las tareas. Haz que las ideas avancen.
            </p>
          </div>
          <Button
            onClick={() =>
              setEditor({
                kind:
                  tab === "team"
                    ? "member"
                    : tab === "tasks"
                      ? "task"
                      : "project",
              })
            }
          >
            <Plus className="size-4" />
            {tab === "team"
              ? "Nuevo miembro"
              : tab === "tasks"
                ? "Nueva tarea"
                : "Nuevo proyecto"}
          </Button>
        </div>
        {notice && (
          <Alert className="mb-5 border-primary/25 bg-primary/5">
            <CheckCircle2 />
            <AlertTitle>Listo</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              {notice}
              <button onClick={() => setNotice("")} className="underline">
                Cerrar
              </button>
            </AlertDescription>
          </Alert>
        )}
        {storageError && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle />
            <AlertTitle>No se pudo conservar la información</AlertTitle>
            <AlertDescription>
              Los cambios siguen disponibles en memoria. Revisa el
              almacenamiento del navegador antes de cerrar.
            </AlertDescription>
          </Alert>
        )}
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v);
            setSearch("");
            setNotice("");
          }}
          className="gap-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
            <TabsList className="h-auto max-w-full justify-start overflow-x-auto bg-transparent p-0">
              {[
                { id: "overview", name: "Resumen", icon: LayoutDashboard },
                { id: "projects", name: "Proyectos", icon: FolderKanban },
                { id: "team", name: "Equipo", icon: Users },
                { id: "tasks", name: "Tareas", icon: ListTodo },
                { id: "settings", name: "Configuración", icon: Settings2 },
              ].map((x) => (
                <TabsTrigger
                  key={x.id}
                  value={x.id}
                  className="gap-2 rounded-lg px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <x.icon className="size-4" />
                  {x.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {["projects", "team", "tasks"].includes(tab) && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  className="bg-card pl-9"
                  placeholder="Buscar…"
                  aria-label="Buscar registros"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </div>
          <TabsContent value="overview" className="space-y-7">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total proyectos",
                  value: stats.projects,
                  sub: "Ideas convertidas en proyectos",
                  icon: FolderKanban,
                },
                {
                  label: "Tareas completadas",
                  value: stats.completed,
                  sub: `De ${stats.total} tareas registradas`,
                  icon: CheckCheck,
                },
                {
                  label: "Tareas pendientes",
                  value: stats.pending,
                  sub: "Pendientes o en progreso",
                  icon: Clock3,
                },
                {
                  label: "Miembros activos",
                  value: stats.active,
                  sub: `De ${data.members.length} personas en el equipo`,
                  icon: Users,
                },
              ].map((s, i) => (
                <Card
                  key={s.label}
                  className={
                    i === 0
                      ? "border-primary bg-primary text-primary-foreground shadow-none"
                      : "shadow-none"
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-0">
                    <CardTitle className="text-sm font-medium">
                      {s.label}
                    </CardTitle>
                    <s.icon
                      className={`size-5 ${i === 0 ? "opacity-70" : "text-primary"}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <p
                      className="mt-3 text-4xl font-semibold tracking-tight"
                      data-testid={`metric-${i}`}
                    >
                      {s.value}
                    </p>
                    <p
                      className={`mt-2 text-xs ${i === 0 ? "opacity-80" : "text-muted-foreground"}`}
                    >
                      {s.sub}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
              <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Proyectos en foco</CardTitle>
                    <CardDescription className="mt-2">
                      El avance de tus próximos entregables.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTab("projects")}
                  >
                    Ver todos <ArrowUpRight className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  {data.projects.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <FolderKanban className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <button
                          className="text-left text-sm font-semibold hover:underline"
                          onClick={() => setDetail(p)}
                        >
                          {p.name}
                        </button>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.category}
                        </p>
                      </div>
                      <div className="w-28">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-muted-foreground">Avance</span>
                          <span>{projectProgress(data, p.id)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${projectProgress(data, p.id)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {!data.projects.length && empty("Aún no hay proyectos")}
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Un paso a la vez</CardTitle>
                  <CardDescription>
                    Avance general de las tareas del equipo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="mx-auto my-3 flex size-36 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--primary) ${stats.progress}%, var(--secondary) 0)`,
                    }}
                  >
                    <div className="flex size-28 flex-col items-center justify-center rounded-full bg-card">
                      <span className="text-3xl font-semibold">
                        {stats.progress}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        completado
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between border-t pt-4 text-sm">
                    <span className="text-muted-foreground">
                      Tareas por completar
                    </span>
                    <strong>{stats.pending}</strong>
                  </div>
                  <Button
                    className="mt-5 w-full"
                    variant="outline"
                    onClick={() => setTab("tasks")}
                  >
                    Revisar tareas <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
                <CardDescription>
                  Los cambios de tu espacio de trabajo.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                {data.activity.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm">{a.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleString("es-PE")}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="projects">
            <div className="mb-5 flex justify-between">
              <h2 className="text-lg font-semibold">
                Todos los proyectos{" "}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {projects.length}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                De la idea al resultado
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <Card
                  key={p.id}
                  className="shadow-none transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                        <FolderKanban className="size-5" />
                      </span>
                      <Status>{p.status}</Status>
                    </div>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <CardDescription className="min-h-10 leading-relaxed">
                      {p.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                      <span>Progreso de tareas</span>
                      <strong className="text-foreground">
                        {projectProgress(data, p.id)}%
                      </strong>
                    </div>
                    <div className="mb-5 h-1.5 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${projectProgress(data, p.id)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="size-4" />
                        {p.memberIds.length} miembros
                      </span>
                      <Status>{p.priority}</Status>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetail(p)}
                      >
                        Ver detalles <ArrowUpRight className="size-4" />
                      </Button>
                      {tools("project", p, p.name, p.id)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!projects.length && empty("No se encontraron proyectos")}
            </div>
          </TabsContent>
          <TabsContent value="team">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Miembros del equipo</CardTitle>
                <CardDescription>
                  {members.length} personas. El talento detrás de cada proyecto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((m) => (
                  <div
                    key={m.userId}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-11">
                        <AvatarFallback className="bg-secondary text-primary">
                          {initials(m.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{m.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.position} · {m.role}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {m.email} · {m.phone}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {data.projects.find((p) => p.id === m.projectId)
                            ?.name || "Sin proyecto principal"}{" "}
                          · Nacimiento: {date(m.birthdate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Status>{m.isActive ? "Activo" : "Inactivo"}</Status>
                      {tools("member", m, m.name, m.userId)}
                    </div>
                  </div>
                ))}
                {!members.length && empty("No se encontraron miembros")}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tasks">
            <Card className="shadow-none">
              <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle>Gestión de tareas</CardTitle>
                  <CardDescription className="mt-2">
                    Cada entrega tiene su lugar.{" "}
                    {
                      selected.filter((id) => tasks.some((t) => t.id === id))
                        .length
                    }{" "}
                    seleccionadas.
                  </CardDescription>
                </div>
                <div className="w-44">
                  <Choice
                    id="status-filter"
                    value={filter}
                    onChange={(v) => {
                      setFilter(v);
                      setPage(1);
                    }}
                    placeholder="Todos los estados"
                    options={["Pendiente", "En progreso", "Completado"].map(
                      (x) => ({ value: x, label: x }),
                    )}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>
                    Lista de todas las tareas de tus proyectos
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          aria-label="Seleccionar página"
                          checked={
                            visible.length > 0 &&
                            visible.every((t) => selected.includes(t.id))
                          }
                          onCheckedChange={(v) =>
                            setSelected(
                              v
                                ? [
                                    ...new Set([
                                      ...selected,
                                      ...visible.map((t) => t.id),
                                    ]),
                                  ]
                                : selected.filter(
                                    (id) => !visible.some((t) => t.id === id),
                                  ),
                            )
                          }
                        />
                      </TableHead>
                      {[
                        "Tarea",
                        "Proyecto",
                        "Estado",
                        "Prioridad",
                        "Asignado a",
                        "Fecha límite",
                        "Acciones",
                      ].map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Checkbox
                            aria-label={`Seleccionar ${t.description}`}
                            checked={selected.includes(t.id)}
                            onCheckedChange={(v) =>
                              setSelected(
                                v
                                  ? [...selected, t.id]
                                  : selected.filter((id) => id !== t.id),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-48 whitespace-normal font-medium">
                          {t.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {
                            data.projects.find((p) => p.id === t.projectId)
                              ?.name
                          }
                        </TableCell>
                        <TableCell>
                          <Status>{t.status}</Status>
                        </TableCell>
                        <TableCell>
                          <Status>{t.priority}</Status>
                        </TableCell>
                        <TableCell>
                          {data.members.find((m) => m.userId === t.userId)
                            ?.name || "Sin asignar"}
                        </TableCell>
                        <TableCell>{date(t.dateline)}</TableCell>
                        <TableCell>
                          {tools("task", t, t.description, t.id)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!visible.length && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-12 text-center text-muted-foreground"
                        >
                          No se encontraron tareas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                  <p className="text-xs text-muted-foreground">
                    {tasks.length
                      ? `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, tasks.length)}`
                      : "0"}{" "}
                    de {tasks.length} tareas
                  </p>
                  <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          text="Anterior"
                          href="#"
                          aria-label="Página anterior"
                          aria-disabled={current === 1}
                          className={
                            current === 1
                              ? "pointer-events-none opacity-40"
                              : ""
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(Math.max(1, current - 1));
                          }}
                        />
                      </PaginationItem>
                      {Array.from({ length: pages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            aria-label={`Página ${i + 1}`}
                            isActive={current === i + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(i + 1);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          text="Siguiente"
                          href="#"
                          aria-label="Página siguiente"
                          aria-disabled={current === pages}
                          className={
                            current === pages
                              ? "pointer-events-none opacity-40"
                              : ""
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(Math.min(pages, current + 1));
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <SettingsForm
              value={data.settings}
              onSave={async (settings) => {
                await delay();
                setData((prev) => ({
                  ...prev,
                  settings,
                  activity: [
                    {
                      id: uid(),
                      text: "Preferencias del espacio actualizadas.",
                      at: new Date().toISOString(),
                    },
                    ...prev.activity,
                  ].slice(0, 30),
                }));
                setNotice(
                  "Configuración guardada. Se aplicaron el tema y el tamaño de página.",
                );
              }}
            />
          </TabsContent>
        </Tabs>
        <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t pt-5 text-xs text-muted-foreground">
          <span>nexo / Laboratorio 11</span>
          <span>Next.js · Tailwind CSS · shadcn/ui</span>
        </footer>
      </main>
      {editor && (
        <EntityForm
          key={`${editor.kind}-${editor.entity ? ("id" in editor.entity ? editor.entity.id : editor.entity.userId) : "new"}`}
          {...editor}
          data={data}
          onClose={() => setEditor(null)}
          onSave={(value) => save(editor.kind, value)}
        />
      )}
      {detail && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v) setDetail(null);
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{detail.name}</DialogTitle>
              <DialogDescription>
                {detail.description || "Sin descripción"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              <Status>{detail.status}</Status>
              <Status>{detail.priority}</Status>
              <Badge variant="outline">{detail.category}</Badge>
            </div>
            <h3 className="mt-3 font-semibold">Equipo del proyecto</h3>
            {detail.memberIds.length ? (
              detail.memberIds.map((id) => (
                <p key={id} className="text-sm">
                  {data.members.find((m) => m.userId === id)?.name}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin miembros asignados.
              </p>
            )}
            <h3 className="mt-3 font-semibold">
              Tareas y avance · {projectProgress(data, detail.id)}%
            </h3>
            {data.tasks
              .filter((t) => t.projectId === detail.id)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between gap-3 border-b pb-2 text-sm"
                >
                  <span>{t.description}</span>
                  <Status>{t.status}</Status>
                </div>
              ))}
            {!data.tasks.some((t) => t.projectId === detail.id) && (
              <p className="text-sm text-muted-foreground">
                Aún no hay tareas.
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}
      {removal && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v && !busy) setRemoval(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                Vas a eliminar «{removal.name}».{" "}
                {removal.kind === "project"
                  ? "También se eliminarán sus tareas. Los miembros se conservarán."
                  : removal.kind === "member"
                    ? "Sus tareas quedarán sin asignar y se retirará de los proyectos."
                    : "Esta tarea se retirará del proyecto."}{" "}
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setRemoval(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await delay();
                  setData((prev) =>
                    deleteEntity(prev, removal.kind, removal.id),
                  );
                  setRemoval(null);
                  setBusy(false);
                  setNotice("Registro eliminado correctamente.");
                }}
              >
                {busy && <Spinner />}Eliminar definitivamente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
function SettingsForm({
  value,
  onSave,
}: {
  value: Settings;
  onSave: (value: Settings) => Promise<void>;
}) {
  const [draft, setDraft] = useState(value),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Card className="max-w-2xl shadow-none">
      <CardHeader>
        <CardTitle>Configuración del espacio</CardTitle>
        <CardDescription>Personaliza cómo trabaja tu equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              draft.workspace.trim().length < 3 ||
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
            ) {
              setError(
                "Ingresa un nombre de espacio de al menos 3 caracteres y un correo válido.",
              );
              return;
            }
            setError("");
            setBusy(true);
            try {
              await onSave({ ...draft, workspace: draft.workspace.trim() });
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Revisa la configuración</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <fieldset disabled={busy} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workspace">Nombre del espacio *</Label>
              <Input
                id="workspace"
                value={draft.workspace}
                maxLength={100}
                onChange={(e) =>
                  setDraft({ ...draft, workspace: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Correo de contacto *</Label>
              <Input
                id="contact-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema de color</Label>
                <Choice
                  id="theme"
                  value={draft.theme}
                  options={[
                    { value: "teal", label: "Verde petróleo" },
                    { value: "indigo", label: "Índigo" },
                    { value: "rose", label: "Rosa" },
                  ]}
                  onChange={(v) => {
                    if (v) setDraft({ ...draft, theme: v });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-size">Tareas por página</Label>
                <Choice
                  id="page-size"
                  value={draft.pageSize}
                  options={["5", "10", "20"].map((x) => ({
                    value: x,
                    label: x,
                  }))}
                  onChange={(v) => {
                    if (v) setDraft({ ...draft, pageSize: v });
                  }}
                />
              </div>
            </div>
            {[
              {
                id: "notifications" as const,
                title: "Notificaciones",
                description: "Simular avisos sobre cambios del equipo.",
              },
              {
                id: "weeklyReport" as const,
                title: "Resumen semanal",
                description: "Simular el envío de un resumen por correo.",
              },
            ].map((x) => (
              <div
                key={x.id}
                className="flex items-center justify-between gap-4 border-t pt-5"
              >
                <div>
                  <Label htmlFor={x.id}>{x.title}</Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {x.description}
                  </p>
                </div>
                <Switch
                  id={x.id}
                  checked={draft[x.id]}
                  onCheckedChange={(v) => setDraft({ ...draft, [x.id]: v })}
                />
              </div>
            ))}
          </fieldset>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Las preferencias se guardan en este navegador. Los envíos y
            peticiones se simulan, sin conexión a un servidor.
          </p>
          <Button type="submit" disabled={busy}>
            {busy && <Spinner />}
            {busy ? "Guardando…" : "Guardar configuración"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
