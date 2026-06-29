import type { SelectionState } from '~/common/schemas';

import { useStore } from '../stores/create-store';
import { selectionStore } from '../stores/selection';

export function useSelection(): SelectionState {
    return useStore(selectionStore);
}
