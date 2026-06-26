// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { afterEach, describe, expect, it } from 'vitest';

import { MemoBubble } from './memo-bubble';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('MemoBubble', () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it('keeps the bubble inside a short viewport', () => {
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 });
        const container = document.createElement('div');
        document.body.append(container);
        const root = createRoot(container);

        act(() => {
            root.render(
                <MemoBubble
                    rect={{ top: 10, left: 10, width: 10, height: 10 }}
                    onSave={() => {}}
                    onCancel={() => {}}
                />,
            );
        });

        expect(document.querySelector<HTMLElement>('[data-vapor-qa-ui]')?.style.top).toBe('8px');

        act(() => root.unmount());
    });
});
