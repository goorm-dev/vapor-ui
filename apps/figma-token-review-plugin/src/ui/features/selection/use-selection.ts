import type { SelectionState } from '~/common/schemas';

import { useStore } from '../../shared/create-store';
import { selectionStore } from './store';

export function useSelection(): SelectionState {
    return useStore(selectionStore);
}
