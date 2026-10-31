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
  Sparkles,
  ChevronRight,
  Command,
  CircleDot,
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
      className={`status-badge status-${children.toLowerCase().replaceAll(" ", "-")}`}
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
    <div data-theme={data.settings.theme} className="dashboard-design">
      <Tabs
        value={tab}
        orientation="vertical"
        onValueChange={(v) => {
          setTab(v);
          setSearch("");
          setNotice("");
        }}
        className="app-shell"
      >
        <aside className="workspace-sidebar">
          <a href="/dashboard" className="brand-lockup">
            <span className="brand-mark">
              <Layers3 />
            </span>
            <span>
              nexo<span className="brand-period">.</span>
              <small>PROJECT WORKSPACE</small>
            </span>
          </a>
          <div className="workspace-name">
            <span className="workspace-initial">E</span>
            <div>
              <strong>{data.settings.workspace}</strong>
              <small>Espacio personal</small>
            </div>
          </div>
          <p className="nav-eyebrow">WORKSPACE</p>
          <TabsList
            aria-label="Secciones del dashboard"
            className="workspace-nav"
          >
            {[
              {
                id: "overview",
                name: "Resumen",
                icon: LayoutDashboard,
                count: null,
              },
              {
                id: "projects",
                name: "Proyectos",
                icon: FolderKanban,
                count: stats.projects,
              },
              {
                id: "team",
                name: "Equipo",
                icon: Users,
                count: data.members.length,
              },
              {
                id: "tasks",
                name: "Tareas",
                icon: ListTodo,
                count: stats.pending,
              },
              {
                id: "settings",
                name: "Configuración",
                icon: Settings2,
                count: null,
              },
            ].map((x) => (
              <TabsTrigger
                key={x.id}
                value={x.id}
                className="workspace-nav-item"
              >
                <x.icon />
                <span>{x.name}</span>
                {x.count !== null && (
                  <span className="nav-count">{x.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="sidebar-bottom">
            <div className="sidebar-progress">
              <span className="sidebar-progress-icon">
                <Sparkles />
              </span>
              <strong>El progreso se construye.</strong>
              <p>
                {stats.completed} de {stats.total} tareas completadas
              </p>
              <div className="sidebar-progress-track">
                <span style={{ width: `${stats.progress}%` }} />
              </div>
              <span className="sidebar-progress-caption">
                Cada entrega cuenta.
              </span>
            </div>
            <div className="sidebar-profile">
              <Avatar>
                <AvatarFallback>GH</AvatarFallback>
              </Avatar>
              <div>
                <strong>Gabriel Haro</strong>
                <small>Mi espacio de trabajo</small>
              </div>
              <span className="online-dot" aria-label="Disponible" />
            </div>
          </div>
        </aside>
        <div className="workspace-body">
          <header className="workspace-topbar">
            <div className="topbar-breadcrumb">
              <span className="topbar-home">
                <Command />
              </span>
              <span>Workspace</span>
              <ChevronRight />
              <strong>
                {
                  {
                    overview: "Resumen",
                    projects: "Proyectos",
                    team: "Equipo",
                    tasks: "Tareas",
                    settings: "Configuración",
                  }[tab]
                }
              </strong>
            </div>
            <div className="topbar-right">
              <span className="workspace-label">
                <span />
                Mi espacio personal
              </span>
              <Avatar>
                <AvatarFallback>GH</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="workspace-main">
            <div className="page-heading">
              <div>
                <p className="section-eyebrow">VISTA DE TRABAJO</p>
                <h1>
                  {
                    {
                      overview: "Resumen general",
                      projects: "Tus proyectos",
                      team: "Personas que suman",
                      tasks: "Cada tarea cuenta",
                      settings: "A tu manera",
                    }[tab]
                  }
                </h1>
                <p className="page-description">
                  {
                    {
                      overview:
                        "Una mirada clara a todo lo que estás construyendo.",
                      projects: "Dale forma a tus ideas, de principio a fin.",
                      team: "Un gran trabajo empieza con un gran equipo.",
                      tasks:
                        "Prioriza, organiza y lleva cada entrega a la meta.",
                      settings: "Un espacio de trabajo que se adapta a ti.",
                    }[tab]
                  }
                </p>
              </div>
              <Button
                className="create-button"
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
                <Plus />
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
            {["projects", "team", "tasks"].includes(tab) && (
              <div className="section-toolbar">
                <div>
                  <span className="toolbar-dot" />
                  {
                    {
                      projects: "Portafolio de proyectos",
                      team: "Directorio del equipo",
                      tasks: "Tablero de entregas",
                    }[tab]
                  }
                </div>
                <div className="section-search">
                  <Search />
                  <Input
                    placeholder="Buscar…"
                    aria-label="Buscar registros"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            )}
            <TabsContent
              value="overview"
              className="overview-content space-y-6"
            >
              <section className="overview-hero">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <span />
                    LA VISIÓN COMPLETA
                  </span>
                  <h2>
                    Tu equipo,
                    <br />
                    <em>en sincronía.</em>
                  </h2>
                  <p>
                    {stats.projects} proyectos. {stats.pending} tareas por
                    completar.
                    <br />
                    Todo lo que necesitas, en el mismo lugar.
                  </p>
                  <button onClick={() => setTab("projects")}>
                    Explorar proyectos <ArrowUpRight />
                  </button>
                </div>
                <div className="hero-orbit" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="hero-progress">
                  <div className="hero-progress-label">
                    <CircleDot /> AVANCE DEL EQUIPO
                  </div>
                  <div
                    className="hero-meter"
                    style={{
                      background: `conic-gradient(#fbbf81 ${stats.progress}%, #ffffff22 0)`,
                    }}
                  >
                    <div>
                      <strong>
                        {stats.progress}
                        <span>%</span>
                      </strong>
                      <small>completado</small>
                    </div>
                  </div>
                  <p>
                    <strong>{stats.completed}</strong> de {stats.total} tareas
                    finalizadas
                  </p>
                </div>
              </section>
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
                  <Card key={s.label} className={`metric-card metric-${i}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-0">
                      <CardTitle className="text-sm font-medium">
                        {s.label}
                      </CardTitle>
                      <span className="metric-icon">
                        <s.icon />
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p
                        className="mt-3 text-4xl font-semibold tracking-tight"
                        data-testid={`metric-${i}`}
                      >
                        {s.value}
                      </p>
                      <p className="metric-description">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
                <Card className="shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <div className="panel-kicker">PORTAFOLIO</div>
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
                    {data.projects.slice(0, 4).map((p, index) => (
                      <div
                        key={p.id}
                        className={`focus-project project-color-${index % 4}`}
                      >
                        <span className="project-monogram">
                          {p.name.slice(0, 2).toUpperCase()}
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
                            <span className="text-muted-foreground">
                              Avance
                            </span>
                            <span>{projectProgress(data, p.id)}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${projectProgress(data, p.id)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!data.projects.length && empty("Aún no hay proyectos")}
                  </CardContent>
                </Card>
                <Card className="agenda-card">
                  <CardHeader>
                    <div className="panel-kicker">MANTÉN EL FOCO</div>
                    <CardTitle>Agenda de entregas</CardTitle>
                    <CardDescription>
                      Lo próximo en la lista de tu equipo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="agenda-list">
                      {data.tasks
                        .filter((t) => t.status !== "Completado")
                        .sort((a, b) => a.dateline.localeCompare(b.dateline))
                        .slice(0, 3)
                        .map((t) => (
                          <button
                            key={t.id}
                            className="agenda-item"
                            onClick={() => {
                              setTab("tasks");
                              setSearch(t.description);
                              setPage(1);
                            }}
                          >
                            <span className="agenda-date">
                              <strong>
                                {new Date(t.dateline + "T12:00:00").getDate()}
                              </strong>
                              <small>
                                {new Date(t.dateline + "T12:00:00")
                                  .toLocaleDateString("es-PE", {
                                    month: "short",
                                  })
                                  .replace(".", "")}
                              </small>
                            </span>
                            <span className="agenda-text">
                              <strong>{t.description}</strong>
                              <small>
                                {
                                  data.projects.find(
                                    (p) => p.id === t.projectId,
                                  )?.name
                                }
                              </small>
                            </span>
                            <ChevronRight />
                          </button>
                        ))}
                      {!stats.pending && (
                        <p className="agenda-empty">
                          <CheckCircle2 /> Todo al día. No hay tareas
                          pendientes.
                        </p>
                      )}
                    </div>
                    <Button
                      className="agenda-link"
                      variant="ghost"
                      onClick={() => setTab("tasks")}
                    >
                      Ver todas las tareas <ArrowRight />
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <Card className="activity-card">
                <CardHeader>
                  <div className="panel-kicker">EN TU ESPACIO</div>
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
            <TabsContent value="projects" className="projects-content">
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
                {projects.map((p, index) => (
                  <Card
                    key={p.id}
                    className={`portfolio-card project-color-${index % 4}`}
                  >
                    <div className="portfolio-cover">
                      <div className="cover-grid" aria-hidden="true" />
                      <span className="cover-category">{p.category}</span>
                      <span className="cover-monogram">
                        {p.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="cover-number">
                        {String(index + 1).padStart(2, "0")} / PROJECT
                      </span>
                      <span className="cover-symbol" aria-hidden="true">
                        <ArrowUpRight />
                      </span>
                    </div>
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="portfolio-category">{p.category}</span>
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
            <TabsContent value="team" className="team-content">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Miembros del equipo</CardTitle>
                  <CardDescription>
                    {members.length} personas. El talento detrás de cada
                    proyecto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {members.map((m) => (
                    <div key={m.userId} className="team-member">
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
            <TabsContent value="tasks" className="tasks-content">
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
            <TabsContent value="settings" className="settings-content">
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
            <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t pt-5 text-xs text-muted-foreground">
              <span className="footer-brand">
                nexo. <span>Hecho para avanzar.</span>
              </span>
              <span>Diseñado por Gabriel Haro · 2026</span>
            </footer>
          </main>
        </div>
      </Tabs>
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
                    { value: "teal", label: "Cobalto y medianoche" },
                    { value: "indigo", label: "Ciruela y lavanda" },
                    { value: "rose", label: "Terracota y arena" },
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
