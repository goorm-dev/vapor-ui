import type { SelectionState } from '~/common/schemas';

import type { SelectionStrategy } from './use-selection';

type FrameSelection = Extract<SelectionState, { kind: 'frame' }>;
type InvalidSelection = Extract<SelectionState, { kind: 'invalid' }>;

export function pluginFrame<T>(handler: (sel: FrameSelection) => T): SelectionStrategy<T> {
    return { frame: handler };
}

export function pluginNone<T>(handler: () => T): SelectionStrategy<T> {
    return { none: handler };
}

export function pluginMulti<T>(handler: () => T): SelectionStrategy<T> {
    return { multi: handler };
}

export function pluginInvalid<T>(handler: (sel: InvalidSelection) => T): SelectionStrategy<T> {
    return { invalid: handler };
}
