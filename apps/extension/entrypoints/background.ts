import { getActiveTabId } from '~/utils/browser/active-tab';
import { blobToDataUrl, dataUrlToBlob, getImage, putImage } from '~/utils/data/image-store';
import { getItems } from '~/utils/data/session-store';
import { findSharedImage } from '~/utils/linear/image-sharing';
import { onMessage, sendMessage } from '~/utils/messaging';

export default defineBackground(() => {
    // sidepanel ↔ background port. Chrome엔 sidePanel.onClosed가 없어,
    // port 수명으로 열림/닫힘을 감지해 활성 탭 content에 통보한다.
    browser.runtime.onConnect.addListener((port) => {
        if (port.name !== 'sidepanel') return;

        const notify = async (open: boolean) => {
            const tabId = await getActiveTabId();
            if (tabId != null) await sendMessage('setPanelOpen', { open }, tabId);
        };

        void notify(true).catch(console.error);
        port.onDisconnect.addListener(() => void notify(false).catch(console.error));
    });

    onMessage('openReviewPanel', async ({ sender }) => {
        const tabId = sender.tab?.id;
        if (tabId != null) await browser.sidePanel.open({ tabId });
    });

    // 캡처와 이미지 저장을 모두 background(확장 origin)에서 수행한다.
    // content script의 IndexedDB는 주입된 페이지 origin이라 sidepanel(확장 origin)이
    // 읽지 못하므로, 저장을 background로 모아 origin을 일치시킨다.
    // 같은 스크롤 좌표(=같은 뷰포트)면 이미지를 새로 찍지 않고 공유하며 index만 올린다.
    onMessage('captureAndStore', async ({ sender, data }) => {
        const shared = findSharedImage(await getItems(), data.scrollX, data.scrollY, data.width);
        if (shared) return { imageRef: shared.imageRef, index: shared.nextIndex };

        const windowId = sender.tab?.windowId;
        const dataUrl =
            windowId != null
                ? await browser.tabs.captureVisibleTab(windowId, { format: 'png' })
                : await browser.tabs.captureVisibleTab({ format: 'png' });

        const imageRef = await putImage(await dataUrlToBlob(dataUrl));
        return { imageRef, index: 1 };
    });

    // sidepanel은 자기 패널 폭을 못 벗어나므로, 이미지 확대는 활성 탭 페이지 위에
    // content script가 전체화면 오버레이로 그린다. blob은 background에서 dataURL로
    // 바꿔 넘긴다(content script는 확장 origin IndexedDB를 못 읽음).
    onMessage('openLightbox', async ({ data }) => {
        const blob = await getImage(data.imageRef);
        if (!blob) return;

        const tabId = await getActiveTabId();
        if (tabId == null) return;

        await sendMessage(
            'showLightbox',
            { dataUrl: await blobToDataUrl(blob), boxes: data.boxes, alt: data.alt },
            tabId,
        );
    });
});
