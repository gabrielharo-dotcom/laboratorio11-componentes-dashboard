export const statuses = ["Pendiente", "En progreso", "Completado"] as const;
export const priorities = ["Baja", "Media", "Alta", "Urgente"] as const;
export const categories = [
  "Desarrollo Web",
  "Desarrollo Mobile",
  "Diseño",
  "Marketing",
  "Otro",
];
export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  memberIds: string[];
}
export interface Member {
  userId: string;
  role: string;
  name: string;
  email: string;
  position: string;
  birthdate: string;
  phone: string;
  projectId: string;
  isActive: boolean;
}
export interface Task {
  id: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  userId: string;
  dateline: string;
}
export interface Settings {
  workspace: string;
  email: string;
  notifications: boolean;
  weeklyReport: boolean;
  pageSize: string;
  theme: string;
}
export interface Activity {
  id: string;
  text: string;
  at: string;
}
export interface Data {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  settings: Settings;
  activity: Activity[];
}
export type Entity = Project | Member | Task;
export type Kind = "project" | "member" | "task";
export const uid = () => crypto.randomUUID();
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const initialData: Data = {
  projects: [
    {
      id: "p1",
      name: "E-commerce Platform",
      description: "Una experiencia de compra rápida y accesible con Next.js.",
      category: "Desarrollo Web",
      priority: "Alta",
      status: "En progreso",
      memberIds: ["m1", "m2"],
    },
    {
      id: "p2",
      name: "Mobile App",
      description:
        "Tu espacio de trabajo, donde estés. Aplicación con React Native.",
      category: "Desarrollo Mobile",
      priority: "Media",
      status: "En revisión",
      memberIds: ["m3"],
    },
    {
      id: "p3",
      name: "API Gateway",
      description:
        "Servicios conectados mediante una API segura y documentada.",
      category: "Desarrollo Web",
      priority: "Alta",
      status: "En progreso",
      memberIds: ["m4", "m5"],
    },
    {
      id: "p4",
      name: "Design System",
      description:
        "Un lenguaje visual compartido para crear mejores productos.",
      category: "Diseño",
      priority: "Media",
      status: "Completado",
      memberIds: [],
    },
    {
      id: "p5",
      name: "Dashboard Analytics",
      description: "Los indicadores del negocio en un solo lugar.",
      category: "Desarrollo Web",
      priority: "Baja",
      status: "Planificado",
      memberIds: [],
    },
    {
      id: "p6",
      name: "Marketing Website",
      description: "Una nueva presencia digital para nuestra marca.",
      category: "Marketing",
      priority: "Media",
      status: "En progreso",
      memberIds: [],
    },
  ],
  members: [
    {
      userId: "m1",
      name: "María García",
      email: "maria@example.com",
      role: "Colaborador",
      position: "Frontend Developer",
      birthdate: "1999-04-10",
      phone: "987654321",
      projectId: "p1",
      isActive: true,
    },
    {
      userId: "m2",
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "Colaborador",
      position: "Backend Developer",
      birthdate: "1998-08-20",
      phone: "987654322",
      projectId: "p1",
      isActive: true,
    },
    {
      userId: "m3",
      name: "Ana López",
      email: "ana@example.com",
      role: "Colaborador",
      position: "UI/UX Designer",
      birthdate: "2000-02-15",
      phone: "987654323",
      projectId: "p2",
      isActive: false,
    },
    {
      userId: "m4",
      name: "Carlos Ruiz",
      email: "carlos@example.com",
      role: "Administrador",
      position: "DevOps Engineer",
      birthdate: "1997-06-12",
      phone: "987654324",
      projectId: "p3",
      isActive: true,
    },
    {
      userId: "m5",
      name: "Laura Martínez",
      email: "laura@example.com",
      role: "Líder",
      position: "Project Manager",
      birthdate: "1996-11-25",
      phone: "987654325",
      projectId: "p3",
      isActive: true,
    },
  ],
  tasks: [
    {
      id: "t1",
      description: "Implementar autenticación",
      projectId: "p1",
      status: "En progreso",
      priority: "Alta",
      userId: "m1",
      dateline: "2026-11-15",
    },
    {
      id: "t2",
      description: "Diseñar pantalla de perfil",
      projectId: "p2",
      status: "Pendiente",
      priority: "Media",
      userId: "m3",
      dateline: "2026-11-20",
    },
    {
      id: "t3",
      description: "Configurar CI/CD",
      projectId: "p3",
      status: "Completado",
      priority: "Alta",
      userId: "m4",
      dateline: "2026-11-10",
    },
    {
      id: "t4",
      description: "Optimizar consultas SQL",
      projectId: "p1",
      status: "En progreso",
      priority: "Urgente",
      userId: "m2",
      dateline: "2026-11-12",
    },
    {
      id: "t5",
      description: "Documentar API endpoints",
      projectId: "p3",
      status: "Pendiente",
      priority: "Baja",
      userId: "m5",
      dateline: "2026-11-25",
    },
    {
      id: "t6",
      description: "Probar flujo de compra",
      projectId: "p1",
      status: "Pendiente",
      priority: "Alta",
      userId: "m1",
      dateline: "2026-11-18",
    },
    {
      id: "t7",
      description: "Definir tokens de diseño",
      projectId: "p4",
      status: "Completado",
      priority: "Media",
      userId: "",
      dateline: "2026-10-30",
    },
  ],
  settings: {
    workspace: "Estudio de desarrollo",
    email: "equipo@example.com",
    notifications: true,
    weeklyReport: false,
    pageSize: "5",
    theme: "teal",
  },
  activity: [
    {
      id: "a1",
      text: "Espacio de trabajo listo para comenzar.",
      at: "2026-10-31T09:00:00-05:00",
    },
  ],
};
export const blank = (kind: Kind): Entity =>
  kind === "project"
    ? {
        id: "",
        name: "",
        description: "",
        category: "",
        priority: "",
        status: "Planificado",
        memberIds: [],
      }
    : kind === "member"
      ? {
          userId: "",
          role: "Colaborador",
          name: "",
          email: "",
          position: "",
          birthdate: "",
          phone: "",
          projectId: "",
          isActive: true,
        }
      : {
          id: "",
          description: "",
          projectId: "",
          status: "Pendiente",
          priority: "Media",
          userId: "",
          dateline: "",
        };
export function validate(kind: Kind, entity: Entity, data: Data): string[] {
  const errors: string[] = [];
  if (kind === "project") {
    const p = entity as Project;
    if (p.name.trim().length < 3)
      errors.push("El nombre del proyecto debe tener al menos 3 caracteres.");
    if (
      data.projects.some(
        (x) =>
          x.id !== p.id &&
          x.name.trim().toLowerCase() === p.name.trim().toLowerCase(),
      )
    )
      errors.push("Ya existe un proyecto con ese nombre.");
    if (
      !categories.includes(p.category) ||
      !priorities.includes(p.priority as (typeof priorities)[number])
    )
      errors.push("Selecciona una categoría y una prioridad.");
    if (p.memberIds.some((id) => !data.members.some((m) => m.userId === id)))
      errors.push("Selecciona miembros existentes.");
  } else if (kind === "member") {
    const m = entity as Member;
    if (m.name.trim().length < 3)
      errors.push("El nombre del miembro debe tener al menos 3 caracteres.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))
      errors.push("Ingresa un correo electrónico válido.");
    if (
      data.members.some(
        (x) =>
          x.userId !== m.userId &&
          x.email.trim().toLowerCase() === m.email.trim().toLowerCase(),
      )
    )
      errors.push("Ya existe un miembro con ese correo.");
    if (!m.role || !m.position.trim())
      errors.push("El rol y el cargo son obligatorios.");
    if (!/^\+?[\d\s()-]{7,20}$/.test(m.phone))
      errors.push("Ingresa un teléfono válido de 7 a 20 caracteres.");
    if (!isDate(m.birthdate) || m.birthdate >= today())
      errors.push("La fecha de nacimiento debe ser válida y anterior a hoy.");
    if (m.projectId && !data.projects.some((p) => p.id === m.projectId))
      errors.push("El proyecto seleccionado no existe.");
  } else {
    const t = entity as Task;
    if (t.description.trim().length < 3)
      errors.push("La descripción debe tener al menos 3 caracteres.");
    if (!data.projects.some((p) => p.id === t.projectId))
      errors.push("Selecciona un proyecto existente.");
    if (
      !statuses.includes(t.status as (typeof statuses)[number]) ||
      !priorities.includes(t.priority as (typeof priorities)[number])
    )
      errors.push("Selecciona un estado y una prioridad válidos.");
    if (!isDate(t.dateline)) errors.push("Selecciona una fecha límite válida.");
    const project = data.projects.find((p) => p.id === t.projectId);
    if (
      !t.userId ||
      !data.members.some((m) => m.userId === t.userId) ||
      !project?.memberIds.includes(t.userId)
    )
      errors.push("Selecciona un responsable que pertenezca al proyecto.");
  }
  return errors;
}
export function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T12:00:00");
  return (
    !isNaN(d.getTime()) &&
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` ===
      value
  );
}
function log(data: Data, text: string): Data {
  return {
    ...data,
    activity: [
      { id: uid(), text, at: new Date().toISOString() },
      ...data.activity,
    ].slice(0, 30),
  };
}
export function saveEntity(data: Data, kind: Kind, entity: Entity): Data {
  const errors = validate(kind, entity, data);
  if (errors.length) throw new Error(errors.join(" "));
  let next = structuredClone(data);
  if (kind === "project") {
    const p = { ...(entity as Project) };
    p.id = p.id || uid();
    p.name = p.name.trim();
    next.projects = next.projects.filter((x) => x.id !== p.id).concat(p);
    // A member can participate in several projects; projectId is the primary project.
    next.members = next.members.map((m) =>
      p.memberIds.includes(m.userId)
        ? { ...m, projectId: m.projectId || p.id }
        : m.projectId === p.id
          ? {
              ...m,
              projectId:
                next.projects.find(
                  (q) => q.id !== p.id && q.memberIds.includes(m.userId),
                )?.id || "",
            }
          : m,
    );
    next.tasks = next.tasks.map((t) =>
      t.projectId === p.id && !p.memberIds.includes(t.userId)
        ? { ...t, userId: "" }
        : t,
    );
    next = log(next, `Proyecto guardado: ${p.name}`);
  } else if (kind === "member") {
    const m = { ...(entity as Member) };
    m.userId = m.userId || uid();
    m.name = m.name.trim();
    m.email = m.email.trim().toLowerCase();
    const old = next.members.find((x) => x.userId === m.userId);
    next.members = next.members.filter((x) => x.userId !== m.userId).concat(m);
    next.projects = next.projects.map((p) =>
      p.id === m.projectId
        ? { ...p, memberIds: [...new Set([...p.memberIds, m.userId])] }
        : p.id === old?.projectId && old.projectId !== m.projectId
          ? { ...p, memberIds: p.memberIds.filter((id) => id !== m.userId) }
          : p,
    );
    next.tasks = next.tasks.map((t) =>
      t.userId === m.userId &&
      !next.projects
        .find((p) => p.id === t.projectId)
        ?.memberIds.includes(m.userId)
        ? { ...t, userId: "" }
        : t,
    );
    next = log(next, `Miembro guardado: ${m.name}`);
  } else {
    const t = { ...(entity as Task) };
    t.id = t.id || uid();
    t.description = t.description.trim();
    next.tasks = next.tasks.filter((x) => x.id !== t.id).concat(t);
    next = log(next, `Tarea guardada: ${t.description}`);
  }
  return next;
}
export function deleteEntity(data: Data, kind: Kind, id: string): Data {
  const next = structuredClone(data);
  if (kind === "project") {
    next.projects = next.projects.filter((x) => x.id !== id);
    next.tasks = next.tasks.filter((x) => x.projectId !== id);
    next.members = next.members.map((m) =>
      m.projectId === id
        ? {
            ...m,
            projectId:
              next.projects.find((p) => p.memberIds.includes(m.userId))?.id ||
              "",
          }
        : m,
    );
  }
  if (kind === "member") {
    next.members = next.members.filter((x) => x.userId !== id);
    next.projects = next.projects.map((p) => ({
      ...p,
      memberIds: p.memberIds.filter((x) => x !== id),
    }));
    next.tasks = next.tasks.map((t) =>
      t.userId === id ? { ...t, userId: "" } : t,
    );
  }
  if (kind === "task") next.tasks = next.tasks.filter((x) => x.id !== id);
  return log(
    next,
    `${kind === "project" ? "Proyecto" : kind === "member" ? "Miembro" : "Tarea"} eliminado`,
  );
}
export function metrics(data: Data) {
  const completed = data.tasks.filter((t) => t.status === "Completado").length;
  return {
    projects: data.projects.length,
    completed,
    pending: data.tasks.length - completed,
    active: data.members.filter((m) => m.isActive).length,
    total: data.tasks.length,
    progress: data.tasks.length
      ? Math.round((completed / data.tasks.length) * 100)
      : 0,
  };
}
export function projectProgress(data: Data, id: string) {
  const tasks = data.tasks.filter((t) => t.projectId === id);
  return tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "Completado").length / tasks.length) *
          100,
      )
    : 0;
}

