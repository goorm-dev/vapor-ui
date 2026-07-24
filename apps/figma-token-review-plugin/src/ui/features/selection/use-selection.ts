import type { SelectionState } from '~/common/schemas';

import { useStore } from '../../shared/create-store';
import { selectionStore } from './store';

export type SelectionStrategy<T = void> = {
    [K in SelectionState['kind']]?: (sel: Extract<SelectionState, { kind: K }>) => T;
};

type UseSelectionReturn = {
    selection: SelectionState;
    buildAction: (strategy: SelectionStrategy) => () => void;
};

export function useSelection(): UseSelectionReturn {
    const selection = useStore(selectionStore);
    return {
        selection,
        buildAction: (strategy: SelectionStrategy) => () =>
            strategy[selection.kind]?.(selection as never),
    };
}
