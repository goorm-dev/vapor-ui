import type { SelectionState } from '~/common/messages';

import { createStore } from './create-store';

export const selectionStore = createStore<SelectionState>({ kind: 'none' });
