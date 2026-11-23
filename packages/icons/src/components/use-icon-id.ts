import * as React from 'react';

// Read through a computed key so bundlers on React 17, which has no useId, do not warn about a missing export.
const useReactId: () => string | undefined =
    (React as { useId?: () => string })[' useId '.trim() as 'useId'] ?? (() => undefined);

/**
 * Per-instance prefix for an icon's SVG ids. React 17 has no useId, so there every instance shares
 * `prefix` and ids repeat when one icon renders twice.
 */
const useIconId = (prefix: string) => {
    const id = useReactId();
    return id ? `${prefix}-${id}` : prefix;
};

export { useIconId };
