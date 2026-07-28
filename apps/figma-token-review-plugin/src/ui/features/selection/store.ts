import type { SelectionState } from '~/common/schemas';

import { createStore } from '../../shared/create-store';

export const selectionStore = createStore<SelectionState>({ kind: 'none' });
