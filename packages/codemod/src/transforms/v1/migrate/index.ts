import type { API, FileInfo, Transform } from 'jscodeshift';

import { transformLoop, transformTrackAnchor } from './migrations';

/**
 * Codemod transform for migrating @base-ui-components/react@beta.4 to @base-ui/react@1.1.0.
 *
 * This transform applies the following migrations:
 * - dismissible → disablePointerDismissal (Dialog)
 * - loop → loopFocus
 * - trackAnchor → disableAnchorTracking (with boolean inversion)
 *
 * Future migrations to be added:
 * - hoverable → disableHoverablePopup (Tooltip)
 * - openOnHover, delay, closeDelay position changes (Menu, Popover)
 * - Select.Placeholder → Select.Value placeholder prop
 */
const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Apply migration functions sequentially
    transformLoop(j, root);
    transformTrackAnchor(j, root);

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
