// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createOverlay } from './overlay';

const rect = {
    bottom: 100,
    height: 80,
    left: 20,
    right: 140,
    top: 20,
    width: 120,
    x: 20,
    y: 20,
    toJSON: () => ({}),
};

describe('createOverlay', () => {
    const overlays: ReturnType<typeof createOverlay>[] = [];
    const createTestOverlay = () => {
        const overlay = createOverlay();
        overlays.push(overlay);
        return overlay;
    };

    afterEach(() => {
        overlays.splice(0).forEach((overlay) => {
            overlay.teardown();
        });
        document.body.replaceChildren();
        vi.restoreAllMocks();
    });

    it('tracks the hovered element and draws its bounds', () => {
        const target = document.createElement('button');
        document.body.append(target);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);

        const overlay = createTestOverlay();
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));

        const hoverBox = document.querySelector<HTMLElement>('[data-vapor-qa-hover]');
        expect(overlay.getHovered()).toBe(target);
        expect(hoverBox?.style.display).toBe('block');
        expect(hoverBox?.style.transform).toBe('translate(20px, 20px)');
        expect(hoverBox?.style.width).toBe('120px');
        expect(hoverBox?.style.height).toBe('80px');
    });

    it('pins the hovered element, blocks page clicks, and unpins on a second click', () => {
        const target = document.createElement('a');
        document.body.append(target);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);

        const overlay = createTestOverlay();
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));

        const firstClick = new MouseEvent('click', { bubbles: true, cancelable: true });
        document.dispatchEvent(firstClick);

        const pinnedBox = document.querySelector<HTMLElement>('[data-vapor-qa-pinned]');
        expect(firstClick.defaultPrevented).toBe(true);
        expect(overlay.getPinned()).toBe(target);
        expect(pinnedBox?.style.display).toBe('block');

        document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(overlay.getPinned()).toBeNull();
        expect(pinnedBox?.style.display).toBe('none');
    });

    it('unpins with Escape and removes all overlay elements on teardown', () => {
        const target = document.createElement('div');
        document.body.append(target);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);

        const overlay = createTestOverlay();
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));
        document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(overlay.getPinned()).toBeNull();

        overlay.teardown();

        expect(document.querySelector('[data-vapor-qa-overlay]')).toBeNull();
    });

    it('invokes onPin when an element is pinned and onUnpin when cleared', () => {
        const target = document.createElement('button');
        document.body.append(target);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);

        const onPin = vi.fn();
        const onUnpin = vi.fn();
        overlays.push(createOverlay({ onPin, onUnpin }));

        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));
        document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(onPin).toHaveBeenCalledTimes(1);
        expect(onPin).toHaveBeenCalledWith(target, rect);
        expect(onUnpin).not.toHaveBeenCalled();

        // second click unpins
        document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(onUnpin).toHaveBeenCalledTimes(1);
    });

    it('hides both boxes on setVisible(false) and redraws the pinned box on setVisible(true)', () => {
        const target = document.createElement('div');
        document.body.append(target);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);

        const overlay = createTestOverlay();
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));
        document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        const pinnedBox = document.querySelector<HTMLElement>('[data-vapor-qa-pinned]');
        expect(pinnedBox?.style.display).toBe('block');

        overlay.setVisible(false);
        expect(document.querySelector<HTMLElement>('[data-vapor-qa-hover]')?.style.display).toBe(
            'none',
        );
        expect(pinnedBox?.style.display).toBe('none');

        overlay.setVisible(true);
        expect(pinnedBox?.style.display).toBe('block');
    });

    it('does not call onUnpin via Escape when nothing is pinned', () => {
        const onUnpin = vi.fn();
        const overlay = createOverlay({ onUnpin });
        overlays.push(overlay);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(onUnpin).not.toHaveBeenCalled();
    });

    it('does not intercept clicks from inspector UI', () => {
        const target = document.createElement('div');
        const inspectorButton = document.createElement('button');
        inspectorButton.dataset.vaporQaUi = '';
        document.body.append(target, inspectorButton);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);

        createTestOverlay();
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));

        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        inspectorButton.dispatchEvent(click);

        expect(click.defaultPrevented).toBe(false);
    });
});
