# Fitness Line Color Token System

## Audit Result

The previous stylesheet mixed brand pinks, warm whites, dark neutrals, tinted shadows, and isolated functional colors directly inside components. This made the rendered design visually rich but difficult to maintain consistently.

The color architecture now has one approved global source of truth:

| Token | Role | Current value |
| --- | --- | --- |
| `--color-primary` | Main Fitness Line brand color | `#e50069` |
| `--color-primary-soft` | Soft brand support derived from primary | `color-mix(...)` |
| `--color-primary-hover` | Hover state derived from primary | `color-mix(...)` |
| `--color-neutral-100` | Primary light neutral | `#ffffff` |
| `--color-neutral-200` | Warm surface neutral | `#f8f6f7` |
| `--color-neutral-300` | Border neutral | `#d6d3d1` |
| `--color-dark` | Text and dark surfaces | `#0c0a09` |
| `--surface-base` | Main editorial surface | `#fcfaf8` |
| `--surface-soft` | Secondary editorial surface | `#f7f4f1` |
| `--surface-mid` | Intermediate products surface | `color-mix(...)` |
| `--surface-contrast` | Medium-contrast categories surface | `color-mix(...)` |
| `--surface-dark` | Premium dark footer surface | `color-mix(...)` |
| `--border-subtle` | Quiet border on light editorial surfaces | Relative dark neutral |
| `--border-dark-subtle` | Quiet border on dark editorial surfaces | Relative light neutral |
| `--shadow-warm-sm` | Controls and compact cards | Warm neutral shadow |
| `--shadow-warm-md` | Interactive and highlighted cards | Warm neutral shadow |
| `--shadow-warm-lg` | Editorial media and section depth | Warm neutral shadow |
| `--shadow-dark` | Depth on premium dark surfaces | Dark neutral shadow |

## Usage Rules

- Components may reference only the approved global color tokens.
- Exact legacy shades are preserved with CSS relative colors derived from an approved token.
- Raw hexadecimal, named colors, and traditional `rgb()`/`rgba()` declarations are not allowed inside component styles.
- New visual shades must be derived from the approved palette instead of introducing another base color.
- Pure white is reserved for contrast details. Header, sections, cards, and the light footer use the editorial surface tokens.
- The Fitness Line pink is the only interface accent. Buttons, badges, highlights, active icons, and CTAs must use its primary, soft, or hover token.
- Brand pink is a signal, never ambient lighting. Shadows and section atmosphere must remain neutral and warm.
- Depth comes from the approved border and shadow tokens, supported by tonal surface changes rather than glow effects.
- `npm test` validates the token architecture.

This architecture supports controlled emotional contrast and luxury editorial color grading without changing layout, content, typography, spacing, or motion.
