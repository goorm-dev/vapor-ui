import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    transformFormOnClearErrors,
    transformHoverPropsToTrigger,
    transformHoverable,
    transformLoop,
    transformTrackAnchor,
} from './migrations';
import { hasTargetPackageImports } from './utils/import-verification';

/**
 * Codemod transform for migrating @vapor-ui/core components.
 *
 * This transform applies the following migrations to components imported from @vapor-ui/core:
 * - `loop` → `loopFocus`
 * - `trackAnchor` → `disableAnchorTracking` (with boolean inversion)
 * - `hoverable` → `disableHoverablePopup` (Tooltip only, with boolean inversion)
 * - Moves `openOnHover`, `delay`, `closeDelay` from Root to Trigger (Menu, Popover, Tooltip)
 * - Removes `onClearErrors` from Form (errors are now auto-cleared on value change)
 *
 * Components from other libraries (including @goorm-dev/vapor-core) are not transformed.
 * Supports aliased imports (e.g., `import { Tooltip as MyTooltip }`).
 */
const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Early return if no @vapor-ui/core imports (performance optimization)
    if (!hasTargetPackageImports(j, root)) {
        return fileInfo.source;
    }

    // Apply migration functions sequentially
    transformLoop(j, root);
    transformTrackAnchor(j, root);
    transformHoverable(j, root);
    transformHoverPropsToTrigger(j, root);
    transformFormOnClearErrors(j, root);

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
