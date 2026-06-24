import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { onMessage, sendMessage } from '../../utils/messaging';
import { buildSelector } from '../../utils/selector';
import { addItem } from '../../utils/session-store';
import type { CapturedRect } from '../../utils/session-store';
import { extractStyle } from '../../utils/style-extract';
import { InspectorUi } from './InspectorUi';
import type { InspectorUiHandle } from './InspectorUi';
import { createOverlay } from './overlay';

const toCapturedRect = (rect: DOMRect): CapturedRect => ({
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
});

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export default defineContentScript({
    matches: ['<all_urls>'],
    cssInjectionMode: 'ui',
    async main(ctx) {
        let uiHandle: InspectorUiHandle | undefined;
        let uiHost: HTMLElement | undefined;
        let overlay: ReturnType<typeof createOverlay> | undefined;
        let pinnedElement: Element | null = null;
        let pinnedRect: CapturedRect | null = null;

        const lockScroll = (locked: boolean) => {
            document.documentElement.style.overflow = locked ? 'hidden' : '';
        };

        const saveItem = async (element: Element, rect: CapturedRect, memo: string) => {
            const styleJSON = extractStyle(element);
            const { scrollX, scrollY } = window;

            // 캡처 직전 인스펙터 UI(박스·말풍선·FAB)를 숨겨 이미지에 안 찍히게 한다.
            overlay?.setVisible(false);
            if (uiHost) uiHost.style.display = 'none';
            await nextFrame();

            try {
                const { imageRef, index } = await sendMessage('captureAndStore', {
                    scrollX,
                    scrollY,
                });
                await addItem({
                    selector: buildSelector(element),
                    rect,
                    memo,
                    styleJSON,
                    imageRef,
                    index,
                    scrollX,
                    scrollY,
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
                            pinnedElement = null;
                            pinnedRect = null;
                            lockScroll(false);
                            void saveItem(element, rect, memo).catch(console.error);
                        },
                        onCancelMemo: () => {
                            pinnedElement = null;
                            pinnedRect = null;
                            lockScroll(false);
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
                        lockScroll(true);
                        uiHandle?.setPin({ rect: pinnedRect });
                    },
                    onUnpin: () => {
                        pinnedElement = null;
                        pinnedRect = null;
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
            lockScroll(false);
            uiHandle?.setPin(null);
            ui.remove();
        };

        const removeListener = onMessage('setInspecting', ({ data }) => {
            setInspecting(data.on);
        });

        ctx.onInvalidated(() => {
            removeListener();
            setInspecting(false);
        });

        // ponytail: temporary Step 3 bootstrap; popup owns this trigger in Step 4+.
        setInspecting(true);
    },
});
