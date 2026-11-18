import { createRef } from 'react';

import { composeRefs } from './compose-refs';

describe('composeRefs', () => {
    const node = document.createElement('div');

    describe('on attach', () => {
        it('assigns the node to object refs and calls callback refs', () => {
            const objectRef = createRef<HTMLDivElement>();
            const callbackRef = vi.fn();

            composeRefs(objectRef, callbackRef, undefined)(node);

            expect(objectRef.current).toBe(node);
            expect(callbackRef).toHaveBeenCalledWith(node);
        });
    });

    describe('on detach', () => {
        it('resets object refs and calls callback refs with `null`', () => {
            const objectRef = createRef<HTMLDivElement>();
            const callbackRef = vi.fn();
            const composed = composeRefs(objectRef, callbackRef);

            composed(node);
            composed(null);

            expect(objectRef.current).toBeNull();
            expect(callbackRef).toHaveBeenLastCalledWith(null);
        });

        it('runs the cleanup a callback ref returned instead of calling it with `null`', () => {
            const cleanup = vi.fn();
            const callbackRef = vi.fn(() => cleanup);
            const composed = composeRefs(callbackRef);

            composed(node);
            composed(null);

            expect(cleanup).toHaveBeenCalledTimes(1);
            expect(callbackRef).toHaveBeenCalledTimes(1);
            expect(callbackRef).not.toHaveBeenCalledWith(null);
        });

        it('runs each cleanup once when attached to a new node', () => {
            const cleanup = vi.fn();
            const composed = composeRefs(() => cleanup);

            composed(node);
            composed(document.createElement('div'));

            expect(cleanup).toHaveBeenCalledTimes(1);
        });
    });
});
