const Z = 2147483646;
const HOVER = '#2a72e5';
const PINNED = '#058765';

// 페이지 CSS와 충돌하지 않도록 모두 인라인 스타일. data-vapor-qa-overlay로 마킹해
// isInspectorElement가 자기 오버레이를 걸러낸다.
const create = (tag: string, css: string) => {
    const el = document.createElement(tag);
    el.dataset.vaporQaOverlay = '';
    el.style.cssText = css;
    return el;
};

const createBox = (kind: 'hover' | 'pinned') => {
    const color = kind === 'hover' ? HOVER : PINNED;
    const fill = kind === 'hover' ? 'rgba(42,114,229,0.1)' : 'rgba(5,135,101,0.14)';
    const box = create(
        'div',
        `position:fixed;top:0;left:0;z-index:${Z};pointer-events:none;box-sizing:border-box;` +
            `border:2px solid ${color};background:${fill};border-radius:2px;display:none;` +
            'transition:transform 60ms ease,width 60ms ease,height 60ms ease',
    );
    box.dataset[`vaporQa${kind === 'hover' ? 'Hover' : 'Pinned'}`] = '';
    document.body.append(box);
    return box;
};

const createLabel = (box: HTMLElement) => {
    const label = create(
        'span',
        `position:absolute;left:0;bottom:100%;margin-bottom:2px;padding:1px 6px;background:${PINNED};` +
            'color:#fff;font-size:11px;line-height:16px;border-radius:2px;white-space:nowrap;display:none',
    );
    box.append(label);
    return label;
};

const createDim = () => {
    const dim = create(
        'div',
        `position:fixed;inset:0;z-index:${Z};background:rgba(0,0,0,0.4);display:none;` +
            'align-items:center;justify-content:center;color:#fff;font-size:14px;text-align:center;padding:24px',
    );
    dim.textContent = '사이드패널을 닫으면 인스펙팅을 계속합니다';
    document.body.append(dim);
    return dim;
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
    const pinnedLabel = createLabel(pinnedBox);
    const dim = createDim();
    let hovered: Element | null = null;
    let pinned: Element | null = null;
    let panelOpen = false;

    const clearPinned = () => {
        if (!pinned) return;
        pinned = null;
        pinnedBox.style.display = 'none';
        pinnedLabel.style.display = 'none';
        callbacks.onUnpin?.();
    };

    const onMove = (event: MouseEvent) => {
        if (panelOpen) return;
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
        if (panelOpen) return;
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
        clearPinned,
        setLabel: (text: string) => {
            pinnedLabel.textContent = text;
            pinnedLabel.style.display = text ? 'block' : 'none';
        },
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
        // sidepanel 열림 동안 인스펙팅을 막고 dim으로 비활성 상태를 알린다.
        // 열릴 때 진행 중이던 핀도 해제(clearPinned가 onUnpin 경유로 메모 모달까지 닫는다).
        setPanelOpen: (open: boolean) => {
            panelOpen = open;
            dim.style.display = open ? 'flex' : 'none';
            if (open) {
                hoverBox.style.display = 'none';
                clearPinned();
            }
        },
        teardown: () => {
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKeyDown, true);
            hoverBox.remove();
            pinnedBox.remove();
            dim.remove();
        },
    };
};
