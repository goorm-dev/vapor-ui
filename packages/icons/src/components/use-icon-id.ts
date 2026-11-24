import * as React from 'react';

// Read through a computed key so bundlers on React 17, which has no useId, do not warn about a missing export.
const useReactId: () => string | undefined =
    (React as { useId?: () => string })[' useId '.trim() as 'useId'] ?? (() => undefined);

const useIconId = (prefix: string) => {
    const id = useReactId();
    return id ? `${prefix}-${id}` : prefix;
};

export { useIconId };
