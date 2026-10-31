# Diseño de la tarea del laboratorio 11

El dashboard Nexo utiliza una composición propia para distinguirse del ejemplo de la guía: navegación lateral azul medianoche, área de trabajo clara, portada cobalto, indicadores con tonos suaves y tarjetas de proyectos con portadas geométricas.

## Paleta principal

| Color | Valor | Uso |
| --- | --- | --- |
| Azul medianoche | `#171D35` | Navegación y marca |
| Cobalto | `#4359E8` | Acciones principales y portada del resumen |
| Naranja suave | `#F8C49C` | Énfasis en portada y avance |
| Fondo frío | `#F6F7FB` | Área de trabajo |
| Texto oscuro | `#202640` | Títulos y datos |
| Lavanda | `#EBEDFF` | Proyectos y métricas de portafolio |
| Verde suave | `#E9F5EE` | Tareas completadas |
| Durazno | `#FFF0E4` | Tareas pendientes |
| Lila | `#F3ECFB` | Equipo y categorías |

## Composición y jerarquía

- Barra lateral con marca, espacio de trabajo, cinco secciones, contadores reales y avance del equipo.
- Encabezado con ruta de navegación y perfil. Cada sección tiene título y descripción propios.
- Acción principal visible para crear un proyecto, miembro o tarea según el contexto.
- Resumen con portada gráfica, avance circular calculado, cuatro métricas y agenda de entregas.
- Proyectos con monogramas, portadas geométricas, categorías, estados, avance y acciones.
- Equipo organizado como directorio de tarjetas con identidad visual y acciones separadas del contenido.
- Tareas en tabla con encabezado diferenciado, estados semánticos y paginación.
- Configuración con tres paletas: cobalto y medianoche, ciruela y lavanda, terracota y arena.

La tipografía usa Segoe UI y alternativas del sistema. Los números grandes destacan las métricas; los títulos, las etiquetas y los textos auxiliares tienen niveles diferenciados. Los iconos proceden de Lucide y las piezas de interfaz mantienen los componentes de shadcn/ui.

## Adaptación a pantallas pequeñas

La navegación lateral se transforma en una barra superior compacta. Las métricas usan dos columnas, los proyectos y las personas una columna, y la tabla se desplaza dentro de su contenedor sin ensanchar la página. Los formularios mantienen su desplazamiento vertical y las etiquetas asociadas a los controles.

## Funcionalidad conservada

Se mantienen el CRUD de las tres entidades, las validaciones, los calendarios, los estados de carga, las confirmaciones, la paginación, las métricas dinámicas y los datos guardados en el navegador. La agenda del resumen muestra las tres primeras tareas no completadas ordenadas por fecha y permite abrir su búsqueda en Tareas.
