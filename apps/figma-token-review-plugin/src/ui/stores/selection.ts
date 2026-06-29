import type { SelectionState } from '~/common/schemas';

import { createStore } from './create-store';

export const selectionStore = createStore<SelectionState>({ kind: 'none' });
