import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { addItem } from '~/utils/data/session-store';
import type { CapturedRect } from '~/utils/data/session-store';
import { buildSelector } from '~/utils/dom/selector';
import { extractStyle } from '~/utils/dom/style-extract';
import { onMessage, sendMessage } from '~/utils/messaging';
import {
    FIBER_REQUEST,
    FIBER_TARGET_ATTR,
    FIBER_TIMEOUT_MS,
    isFiberResponseForRequest,
} from '~/utils/messaging/fiber-protocol';
import type { FiberRequest } from '~/utils/messaging/fiber-protocol';

import { InspectorUi } from './inspector-ui';
import type { InspectorUiHandle } from './inspector-ui';
import { showLightbox } from './lightbox';
import { createOverlay } from './overlay';

const toCapturedRect = (rect: DOMRect): CapturedRect => ({
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
});

// rAF 콜백은 다음 페인트 *직전*에 돈다. 한 번만 기다리면 UI를 숨긴 DOM 변경이
// 아직 페인트되지 않은 채 captureVisibleTab이 오버레이/FAB를 잡을 수 있다.
// 이중 rAF로 한 페인트가 끝난 뒤를 보장한다.
const nextFrame = () =>
    new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

export default defineContentScript({
    matches: ['<all_urls>'],
    cssInjectionMode: 'ui',
    async main(ctx) {
        let uiHandle: InspectorUiHandle | undefined;
        let uiHost: HTMLElement | undefined;
        let overlay: ReturnType<typeof createOverlay> | undefined;
        let pinnedElement: Element | null = null;
        let pinnedRect: CapturedRect | null = null;
        let pinnedComponents: string[] = [];

        // fiber expando는 isolated에서 못 읽으므로, MAIN world의 fiber-reader에
        // 마킹된 노드를 읽어달라고 요청해 컴포넌트 계보를 받아온다.
        let readerInjected = false;
        const requestComponents = async (element: Element): Promise<string[]> => {
            if (!readerInjected) {
                await injectScript('/fiber-reader.js', { keepInDom: true });
                readerInjected = true;
            }
            const requestId = crypto.randomUUID();
            element.setAttribute(FIBER_TARGET_ATTR, requestId);
            try {
                return await new Promise<string[]>((resolve, reject) => {
                    const timeoutId = window.setTimeout(() => {
                        window.removeEventListener('message', onResponse);
                        reject(new Error('React 컴포넌트 정보를 읽지 못했습니다.'));
                    }, FIBER_TIMEOUT_MS);
                    const onResponse = (event: MessageEvent) => {
                        if (
                            event.source !== window ||
                            !isFiberResponseForRequest(event.data, requestId)
                        )
                            return;
                        window.clearTimeout(timeoutId);
                        window.removeEventListener('message', onResponse);
                        resolve(event.data.components);
                    };
                    window.addEventListener('message', onResponse);
                    const request: FiberRequest = { type: FIBER_REQUEST, requestId };
                    window.postMessage(request, '*');
                });
            } finally {
                if (element.getAttribute(FIBER_TARGET_ATTR) === requestId) {
                    element.removeAttribute(FIBER_TARGET_ATTR);
                }
            }
        };

        const lockScroll = (locked: boolean) => {
            document.documentElement.style.overflow = locked ? 'hidden' : '';
        };

        const saveItem = async (
            element: Element,
            rect: CapturedRect,
            memo: string,
            components: string[],
        ) => {
            const styleJSON = extractStyle(element);
            const { scrollX, scrollY, innerWidth: width } = window;
            const pageUrl = window.location.href;
            const pageTitle = document.title;

            // 캡처 직전 인스펙터 UI(박스·말풍선·FAB)를 숨겨 이미지에 안 찍히게 한다.
            overlay?.setVisible(false);
            if (uiHost) uiHost.style.display = 'none';
            await nextFrame();

            try {
                const { imageRef, index, tabId } = await sendMessage('captureAndStore', {
                    pageUrl,
                    scrollX,
                    scrollY,
                    width,
                });
                await addItem({
                    selector: buildSelector(element),
                    rect,
                    memo,
                    components,
                    styleJSON,
                    tabId,
                    pageUrl,
                    pageTitle,
                    imageRef,
                    index,
                    scrollX,
                    scrollY,
                    width,
                });
            } finally {
                if (uiHost) uiHost.style.display = '';
                overlay?.setVisible(true);
            }
        };

        const ui = await createShadowRootUi(ctx, {
            name: 'vapor-qa-fab',
            position: 'inline',
            anchor: 'body',
            append: 'last',
            onMount: (container, _shadow, host) => {
                host.dataset.vaporQaUi = '';
                uiHost = host;

                const wrapper = document.createElement('div');
                wrapper.dataset.vaporQaUi = '';
                wrapper.style.cssText =
                    'position:fixed;right:24px;bottom:24px;z-index:2147483647;font-size:16px;';
                container.append(wrapper);

                const root = createRoot(wrapper);
                root.render(
                    createElement(InspectorUi, {
                        bind: (handle) => {
                            uiHandle = handle;
                        },
                        onReview: () => {
                            void sendMessage('openReviewPanel').catch(console.error);
                        },
                        onSaveMemo: (memo) => {
                            if (!pinnedElement || !pinnedRect) return;
                            const element = pinnedElement;
                            const rect = pinnedRect;
                            const components = pinnedComponents;
                            // clearPinned가 onUnpin을 통해 pinnedElement/pinnedRect 초기화와
                            // lockScroll 해제까지 처리하므로, 캡처할 값은 미리 확보해 둔다.
                            overlay?.clearPinned();
                            void saveItem(element, rect, memo, components).catch(console.error);
                        },
                        onCancelMemo: () => {
                            overlay?.clearPinned();
                        },
                    }),
                );
                return { root, wrapper };
            },
            onRemove: (mounted) => {
                mounted?.root.unmount();
                mounted?.wrapper.remove();
                uiHost = undefined;
            },
        });

        let inspecting = false;

        const setInspecting = (on: boolean) => {
            if (on === inspecting) return;
            inspecting = on;

            if (on) {
                overlay = createOverlay({
                    onPin: (element, rect) => {
                        pinnedElement = element;
                        pinnedRect = toCapturedRect(rect);
                        pinnedComponents = [];
                        lockScroll(true);
                        uiHandle?.setPin({ rect: pinnedRect });
                        overlay?.setLabel('');
                        // 계보는 MAIN world 왕복이라 비동기. 회신이 늦게 와도
                        // 여전히 같은 요소가 pin된 상태일 때만 라벨에 반영한다.
                        void requestComponents(element)
                            .then((components) => {
                                if (pinnedElement !== element) return;
                                pinnedComponents = components;
                                overlay?.setLabel(components.join(' › '));
                            })
                            .catch(console.error);
                    },
                    onUnpin: () => {
                        pinnedElement = null;
                        pinnedRect = null;
                        pinnedComponents = [];
                        lockScroll(false);
                        uiHandle?.setPin(null);
                    },
                });
                ui.mount();
                return;
            }

            overlay?.teardown();
            overlay = undefined;
            pinnedElement = null;
            pinnedRect = null;
            pinnedComponents = [];
            lockScroll(false);
            uiHandle?.setPin(null);
            ui.remove();
        };

        const removeListener = onMessage('setInspecting', ({ data }) => {
            setInspecting(data.on);
        });

        // popup이 시작/멈춤 버튼 라벨을 정하려고 현재 탭의 인스펙팅 상태를 묻는다.
        const removeGetInspecting = onMessage('getInspecting', () => inspecting);

        // sidepanel 열림/닫힘에 따라 인스펙팅 차단·dim 토글.
        const removePanelOpenListener = onMessage('setPanelOpen', ({ data }) => {
            overlay?.setPanelOpen(data.open);
        });

        // 인스펙팅 여부와 무관하게 항상 받는다(sidepanel에서 확대 요청).
        const removeLightboxListener = onMessage('showLightbox', ({ data }) => {
            showLightbox(data.dataUrl, data.boxes, data.alt);
        });

        ctx.onInvalidated(() => {
            removeListener();
            removeGetInspecting();
            removePanelOpenListener();
            removeLightboxListener();
            setInspecting(false);
        });
    },
});
