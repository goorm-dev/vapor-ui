import '@testing-library/jest-dom/vitest';

import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);

// Base UI waits for CSS exit animations before unmounting popups. happy-dom reports no
// pending animations but defers the completion callback to the next rAF, which never fires
// under fake timers in the same tick as the close trigger. Short-circuit the wait in tests.
(globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean }).BASE_UI_ANIMATIONS_DISABLED = true;
