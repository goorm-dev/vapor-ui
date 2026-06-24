const createBox = (kind: 'hover' | 'pinned') => {
    const box = document.createElement('div');
    box.dataset.vaporQaOverlay = '';
    box.dataset[`vaporQa${kind === 'hover' ? 'Hover' : 'Pinned'}`] = '';
    box.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'z-index:2147483646',
        'pointer-events:none',
        'box-sizing:border-box',
        `border:2px solid ${kind === 'hover' ? '#2a72e5' : '#058765'}`,
        `background:${kind === 'hover' ? 'rgba(42,114,229,0.1)' : 'rgba(5,135,101,0.14)'}`,
        'border-radius:2px',
        'transition:transform 60ms ease,width 60ms ease,height 60ms ease',
        'display:none',
    ].join(';');
    document.body.append(box);
    return box;
};

const drawBox = (box: HTMLElement, element: Element) => {
    const rect = element.getBoundingClientRect();
    box.style.display = 'block';
    box.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
};

const isInspectorElement = (element: Element) =>
    element.closest('[data-vapor-qa-overlay], [data-vapor-qa-ui]') !== null;

interface OverlayCallbacks {
    onPin?: (element: Element, rect: DOMRect) => void;
    onUnpin?: () => void;
}

export const createOverlay = (callbacks: OverlayCallbacks = {}) => {
    const hoverBox = createBox('hover');
    const pinnedBox = createBox('pinned');
    let hovered: Element | null = null;
    let pinned: Element | null = null;

    const clearPinned = () => {
        if (!pinned) return;
        pinned = null;
        pinnedBox.style.display = 'none';
        callbacks.onUnpin?.();
    };

    const onMove = (event: MouseEvent) => {
        const element = document.elementFromPoint(event.clientX, event.clientY);
        if (!element || isInspectorElement(element)) {
            hovered = null;
            hoverBox.style.display = 'none';
            return;
        }

        hovered = element;
        drawBox(hoverBox, element);
    };

    const onClick = (event: MouseEvent) => {
        const clickedInspectorUi = event
            .composedPath()
            .some((target) => target instanceof Element && isInspectorElement(target));
        if (!hovered || clickedInspectorUi) return;

        event.preventDefault();
        event.stopPropagation();

        if (pinned === hovered) {
            clearPinned();
            return;
        }

        pinned = hovered;
        drawBox(pinnedBox, hovered);
        callbacks.onPin?.(hovered, hovered.getBoundingClientRect());
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') clearPinned();
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    return {
        getHovered: () => hovered,
        getPinned: () => pinned,
        // 캡처 직전 박스를 숨겨 이미지에 안 찍히게 한다. 복원 시 pinned만 다시 그린다
        // (hover는 다음 mousemove에 자동 갱신).
        setVisible: (visible: boolean) => {
            if (!visible) {
                hoverBox.style.display = 'none';
                pinnedBox.style.display = 'none';
                return;
            }
            if (pinned) drawBox(pinnedBox, pinned);
        },
        teardown: () => {
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKeyDown, true);
            hoverBox.remove();
            pinnedBox.remove();
        },
    };
};
