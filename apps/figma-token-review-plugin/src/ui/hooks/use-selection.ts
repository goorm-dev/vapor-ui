import type { SelectionState } from '~/shared/schema';

import { useStore } from '../store/create-store';
import { selectionStore } from '../store/selection';

export function useSelection(): SelectionState {
    return useStore(selectionStore);
}
