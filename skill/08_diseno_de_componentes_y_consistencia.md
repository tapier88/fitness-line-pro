\# 08. Diseño de Componentes: Reglas de Diseño de Interfaz (UI)



La consistencia es lo que separa a un diseño amateur de un trabajo profesional. BONT mantiene un control sistemático sobre la apariencia de los componentes individuales de su interfaz.



\## Reglas de Construcción de Componentes



\### 1. El Sistema de Espaciado (8px Grid System)

Todos los valores de margen, relleno (\*padding\*) y tamaño de elementos se calculan utilizando múltiplos de 8px (8, 16, 24, 32, 48, 64, etc.):

\*   Garantiza que la relación espacial entre elementos sea intuitiva y mantenga una armonía matemática.

\*   Facilita la adaptabilidad responsiva en pantallas de diferentes tamaños.



\### 2. Bordes y Contenedores Sutiles

\*   \*\*Grosores constantes:\*\* Uso generalizado de bordes de 1px.

\*   \*\*Color de borde:\*\* Colores de borde que contrastan muy poco con el fondo (ej. en un fondo #F5F5F3, se utilizaría un borde #E4E4E2). El objetivo es insinuar la separación de componentes sin añadir peso visual.

\*   \*\*Radios de Esquina (\*Border-Radius\*):\*\* BONT suele usar esquinas ligeramente redondeadas (de 6px a 12px) para componentes de interfaz estándar como tarjetas e inputs, evitando bordes demasiado redondos que rompan la estética editorial geométrica.



\### 3. El Tratamiento de las Sombras (Shadows)

Las sombras en el diseño de BONT son casi invisibles:

\*   Gran distancia de desenfoque (\*blur\*) combinada con opacidades extremadamente bajas (por ejemplo, un valor de difusión de 20px a 40px con solo un 2% o 3% de opacidad de color oscuro). Esto crea un efecto de elevación sutil y natural.

