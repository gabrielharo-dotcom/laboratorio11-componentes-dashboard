import test from "node:test";
import assert from "node:assert/strict";
import {
  initialData,
  blank,
  saveEntity,
  deleteEntity,
  validate,
  metrics,
  projectProgress,
  isDate,
} from "../src/lib/domain.ts";
const seed = () => structuredClone(initialData);
test("las métricas se calculan desde los registros", () => {
  assert.deepEqual(metrics(seed()), {
    projects: 6,
    completed: 2,
    pending: 5,
    active: 4,
    total: 7,
    progress: 29,
  });
  assert.equal(projectProgress(seed(), "p1"), 0);
});
test("crear y editar proyectos conserva los identificadores y relaciones", () => {
  let d = seed();
  d = saveEntity(d, "project", {
    ...blank("project"),
    name: "Portal educativo",
    category: "Desarrollo Web",
    priority: "Alta",
    memberIds: ["m1"],
  });
  const p = d.projects.at(-1);
  assert.ok(p.id);
  assert.equal(metrics(d).projects, 7);
  d = saveEntity(d, "project", { ...p, name: "Portal académico" });
  assert.equal(d.projects.length, 7);
  assert.equal(d.projects.at(-1).name, "Portal académico");
  assert.equal(metrics(seed()).projects, 6);
});
test("validaciones rechazan vacíos, duplicados y fechas imposibles", () => {
  assert.ok(validate("project", blank("project"), seed()).length);
  assert.ok(
    validate("member", { ...seed().members[0], userId: "" }, seed()).some((x) =>
      x.includes("correo"),
    ),
  );
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2024-02-29"), true);
  assert.throws(() => saveEntity(seed(), "task", blank("task")));
});
test("miembros tienen CRUD y sincronizan su proyecto principal", () => {
  let d = saveEntity(seed(), "member", {
    ...blank("member"),
    name: "Lucía Torres",
    email: "lucia@example.com",
    phone: "999888777",
    birthdate: "2001-01-12",
    position: "Tester",
    projectId: "p1",
  });
  const m = d.members.at(-1);
  assert.ok(d.projects[0].memberIds.includes(m.userId));
  d = saveEntity(d, "member", { ...m, projectId: "p2", isActive: false });
  assert.ok(
    !d.projects.find((p) => p.id === "p1").memberIds.includes(m.userId),
  );
  assert.ok(d.projects.find((p) => p.id === "p2").memberIds.includes(m.userId));
  d = deleteEntity(d, "member", m.userId);
  assert.equal(d.members.length, 5);
  assert.ok(d.projects.every((p) => !p.memberIds.includes(m.userId)));
});
test("tareas tienen CRUD y actualizan el avance", () => {
  let d = saveEntity(seed(), "task", {
    ...blank("task"),
    description: "Nueva prueba",
    projectId: "p1",
    userId: "m1",
    dateline: "2026-11-10",
  });
  const t = d.tasks.at(-1);
  assert.equal(metrics(d).total, 8);
  d = saveEntity(d, "task", { ...t, status: "Completado" });
  assert.equal(metrics(d).completed, 3);
  assert.equal(projectProgress(d, "p1"), 25);
  d = deleteEntity(d, "task", t.id);
  assert.equal(metrics(d).total, 7);
});
test("no admite responsables ajenos al proyecto", () => {
  const t = { ...seed().tasks[0], userId: "m4" };
  assert.ok(validate("task", t, seed()).some((x) => x.includes("responsable")));
});
test("eliminar un proyecto elimina sus tareas y conserva miembros", () => {
  const d = deleteEntity(seed(), "project", "p1");
  assert.ok(d.tasks.every((t) => t.projectId !== "p1"));
  assert.equal(d.members.length, 5);
  assert.ok(d.members.every((m) => m.projectId !== "p1"));
  assert.equal(d.projects.length, 5);
});
test("eliminar un miembro deja sus tareas sin asignar", () => {
  const d = deleteEntity(seed(), "member", "m1");
  assert.equal(d.tasks.find((t) => t.id === "t1").userId, "");
  assert.ok(!d.projects[0].memberIds.includes("m1"));
});
test("retirar un miembro de un proyecto limpia responsables incompatibles", () => {
  const d = saveEntity(seed(), "project", {
    ...seed().projects[0],
    memberIds: ["m2"],
  });
  assert.equal(d.tasks.find((t) => t.id === "t1").userId, "");
  assert.equal(d.members.find((m) => m.userId === "m1").projectId, "");
});
