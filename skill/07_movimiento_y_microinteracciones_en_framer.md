\# 07. Animación, Ritmo y Microinteracciones en Framer



BONT aprovecha las capacidades de animación basadas en físicas reales de Framer para crear transiciones fluidas que guían la atención del usuario sin entorpecer su experiencia.



\## Principios de Movimiento



\### 1. Animación Basada en Físicas (Springs)

BONT evita el uso de curvas de velocidad estándar (\*linear\* o \*ease-in\* simples) para elementos interactivos primarios. En su lugar, utiliza animaciones de muelle (\*springs\*) calibradas con precisión:

\*   \*\*Stiffness (Rigidez):\*\* Alta, para un inicio de movimiento rápido.

\*   \*\*Damping (Amortiguación):\*\* Equilibrada, para que el elemento se detenga suavemente sin oscilar excesivamente, lo que transmitiría un tono poco profesional o infantil.



\### 2. Transiciones de Entrada en Cascada (Staggered Animations)

Cuando se carga una página o sección, los elementos no aparecen todos a la vez. BONT configura un retraso escalonado (generalmente de entre 0.05 y 0.1 segundos entre elementos):

1\.  Aparece el titular principal.

2\.  Le sigue el subtítulo o texto secundario.

3\.  Finalmente, emergen los botones de acción y los elementos visuales complementarios.



\### 3. Microinteracciones de Hover

\*   \*\*Efecto Escala:\*\* Incremento muy sutil del tamaño de un botón (ej. de `scale: 1` a `scale: 1.02`).

\*   \*\*Desplazamiento del Cursor personalizado:\*\* Uso de cursores dinámicos interactivos que reaccionan cambiando de tamaño o mostrando texto descriptivo cuando flotan sobre elementos con los que se puede interactuar.

