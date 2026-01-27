import type { API, FileInfo, Transform } from 'jscodeshift';

import {
    transformHoverPropsToTrigger,
    transformHoverable,
    transformLoop,
    transformTrackAnchor,
} from './migrations';

/**
 * Codemod transform for migrating @base-ui-components/react@beta.4 to @base-ui/react@1.1.0.
 *
 * This transform applies the following migrations:
 * - dismissible → disablePointerDismissal (Dialog)
 * - loop → loopFocus
 * - trackAnchor → disableAnchorTracking (with boolean inversion)
 * - hoverable → disableHoverablePopup (Tooltip, with boolean inversion)
 * - openOnHover, delay, closeDelay position changes (Menu, Popover, Tooltip Root → Trigger)
 *
 * Future migrations to be added:
 * - Select.Placeholder → Select.Value placeholder prop
 */
const transform: Transform = (fileInfo: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // Apply migration functions sequentially
    transformLoop(j, root);
    transformTrackAnchor(j, root);
    transformHoverable(j, root);
    transformHoverPropsToTrigger(j, root);

    return root.toSource();
};

export default transform;
export const parser = 'tsx';
