# reference

`generate_palette.py` is the designer-owned reference script. Its output is the source of truth for `@vapor-ui/color-generator`; the TS port must match it hex for hex.

This copy carries one fix over the designer's original: `gamut_chroma` scans down from the requested chroma instead of bisecting, because blue hues have a split in-gamut chroma range (cobalt light-800 `001FAF` → `0100C6`, every other cell unchanged).

| File | Made by |
| --- | --- |
| `palette.json` | `python3 -I reference/generate_palette.py --yes` |
| `palette.teal.json` | `python3 -I reference/generate_palette.py --new teal=00838F --yes` |
| `gray.figma.json` | Figma "Primitive-test" final frame. The script does not generate gray. |

Regenerate from `packages/color-generator/` in a scratch directory (the script writes `palette.json` to the working directory), then copy the file here.
