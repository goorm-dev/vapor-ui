import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

import type { Nodes } from 'hast';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';

export function hastToReact(hast: Nodes): ReactNode {
    return toJsxRuntime(hast, { Fragment, jsx, jsxs });
}
