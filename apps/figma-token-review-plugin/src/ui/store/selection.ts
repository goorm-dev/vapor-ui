import type { SelectionState } from '~/shared/schema';

import { createStore } from './create-store';

export const selectionStore = createStore<SelectionState>({ kind: 'none' });
