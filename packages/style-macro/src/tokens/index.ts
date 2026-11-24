// Compiler-side barrel — assembles `tokens` from the per-axis modules in
// this folder. Runtime consumers should import directly from the sibling
// `runtime.ts` (published as `@vapor-ui/style-macro/__runtime__/tokens``
// so the bundler can tree-shake axes the app does not actually use.
import { backgroundColor } from './backgroundColor';
import { borderColor } from './borderColor';
import { color } from './color';
import { dimension } from './dimension';
import { fontFamily } from './fontFamily';
import { fontSize } from './fontSize';
import { fontWeight } from './fontWeight';
import { letterSpacing } from './letterSpacing';
import { lineHeight } from './lineHeight';
import { margin } from './margin';
import { radius } from './radius';
import { shadow } from './shadow';
import { space } from './space';

export { propertyToTokenAxis, type PropertyToTokenAxis } from './axis';

export const tokens = {
    color,
    backgroundColor,
    borderColor,
    space,
    margin,
    dimension,
    radius,
    shadow,
    fontSize,
    lineHeight,
    letterSpacing,
    fontWeight,
    fontFamily,
} as const;

export type Tokens = typeof tokens;
