# Laboratorio 11 de Desarrollo Web Avanzado

Componentes reutilizables, CSS Modules, Tailwind CSS y shadcn/ui. Se desarrollaron los dos ejercicios y la tarea de lógica del dashboard de la guía GLAB-S11-EAREVALO-2026-1.

## Ejecución

Requisito: Node.js 22.18 o superior (recomendado 24 LTS). Cada proyecto es independiente y tiene su propio `package-lock.json`.

Dashboard, terminal 1:

```powershell
cd next-shadcn-ui
npm ci
npm run dev
```

Abrir http://localhost:3000/dashboard.

Galería de componentes, terminal 2:

```powershell
cd next-components-styling
npm ci
npm run dev -- --port 3001
```

Abrir http://localhost:3001/styling. También se puede ejecutar `INICIAR-LAB.cmd` desde Windows. Las páginas de inicio redirigen a la ruta de su ejercicio.

## Ejercicio 1

`next-components-styling/src/components` contiene Button, Badge, Input y Card. Button usa CSS Modules para ondas, gradientes y spinner. Input combina etiqueta flotante, animación de error y estilos de foco con utilidades de Tailwind. Card y Badge usan Tailwind para diseño, tamaños, colores y adaptación de pantalla. La página `/styling` muestra todas las variantes, carga simulada, tarjetas y validación de correo. La ilustración es local, sin dependencia de servicios de imágenes. Los labels están asociados a los campos y los errores tienen semántica accesible.

## Ejercicio 2 y tarea

El dashboard Nexo tiene un tema verde petróleo, con alternativas índigo y rosa en Configuración. Usa componentes oficiales generados por el CLI shadcn/ui, basados en Radix UI.

| Requisito | Implementación |
| --- | --- |
| Spinner | Guardar y eliminar simulan una petición de 700 ms y bloquean envíos repetidos. |
| Alert | Validaciones de formularios y avisos de guardado. |
| Calendar | Fecha de nacimiento y fecha límite, con selección de mes y año. |
| Pagination | Tareas, cinco registros por página inicialmente; 5, 10 o 20 desde Configuración. |
| Proyectos | Crear, listar, editar, detalles y eliminar. Categoría, prioridad, estado y miembros. |
| Equipo | CRUD con userId, role, name, email, position, birthdate, phone, projectId, isActive. |
| Tareas | CRUD con description, projectId, status, priority, userId, dateline. Búsqueda, filtro y selección de filas. |
| Configuración | Espacio, correo, tema, tamaño de página, notificaciones y resumen semanal simulados. |
| Resumen | Conteos y porcentajes derivados de los datos actuales; actividad reciente. |

### Reglas de negocio

- Los identificadores se generan con `crypto.randomUUID()`.
- Los nombres de proyectos y correos de miembros no se repiten.
- Las tareas requieren un proyecto y un responsable que pertenezca a su equipo.
- Un miembro puede participar en varios proyectos. `projectId` representa su proyecto principal; `memberIds` registra el equipo completo de cada proyecto.
- Al cambiar el proyecto principal de un miembro se actualiza la pertenencia correspondiente. Los responsables de tareas que dejan de pertenecer a un proyecto quedan sin asignar.
- Eliminar un proyecto elimina sus tareas y conserva sus miembros. Eliminar un miembro conserva sus tareas sin responsable. Cada eliminación muestra una confirmación explícita.
- El avance es el porcentaje de tareas completadas por proyecto; un proyecto sin tareas muestra 0 %. El estado del proyecto se gestiona por separado.
- Se usa `projectId` como nombre canónico del campo escrito como `prjectId` en la guía. Se conserva `dateline` para la fecha límite.
- El estado reside en memoria y se conserva adicionalmente en `localStorage` bajo `lab11-nexo-v1`. No hay backend real, autenticación ni sincronización entre usuarios. Para recuperar los datos iniciales, borrar esa clave desde las herramientas del navegador y recargar.
- Las preferencias de notificación y resumen semanal se guardan y simulan; no envían correos.

## Estructura

```text
semana11/
  next-components-styling/    Ejercicio 1
  next-shadcn-ui/
    src/app/dashboard/       Ruta del dashboard
    src/components/ui/       Componentes oficiales shadcn/ui
    src/components/          Dashboard, EntityForm, DateField
    src/lib/domain.ts        Modelos, validaciones, CRUD y métricas
    tests/domain.test.mjs    Pruebas de reglas de negocio
  evidencias/                Capturas reales de la aplicación
  informe/                   Informe del laboratorio
```

Los formularios de proyectos, miembros y tareas se concentran en `EntityForm.tsx` para compartir validaciones, controles y estados de carga. La tabla de tareas se integra en `Dashboard.tsx`, resolviendo la inconsistencia TaskTable/TasksTable del ejemplo de la guía.

## Verificación

En ambos proyectos:

```powershell
npm run lint
npm run build
```

En el dashboard:

```powershell
npm test
```

Las nueve pruebas cubren métricas, CRUD de las tres entidades, fechas, duplicados, pertenencia del responsable, eliminación en cascada y limpieza de relaciones. Las capturas y el informe documentan las comprobaciones en navegador.

## Publicación

Repositorio: https://github.com/gabrielharo-dotcom/laboratorio11-componentes-dashboard

Para Vercel, importar este repositorio dos veces, usando como Root Directory `next-shadcn-ui` y `next-components-styling`, respectivamente. Framework Preset: Next.js. Build: `npm run build`. No se necesitan variables de entorno. Cada despliegue mantiene sus datos en el navegador del visitante.

## Referencias

- Guía de laboratorio GLAB-S11-EAREVALO-2026-1, Edwin William Arévalo Sermeño.
- https://nextjs.org/docs/app/getting-started/installation
- https://ui.shadcn.com/docs/components/spinner
- https://ui.shadcn.com/docs/components/alert
- https://ui.shadcn.com/docs/components/calendar
- https://ui.shadcn.com/docs/components/pagination
