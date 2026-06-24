import { findSharedImage } from '../utils/image-sharing';
import { dataUrlToBlob, putImage } from '../utils/image-store';
import { onMessage, sendMessage } from '../utils/messaging';
import { getItems } from '../utils/session-store';

export default defineBackground(() => {
    onMessage('startInspecting', async () => {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab?.id != null) await sendMessage('setInspecting', { on: true }, tab.id);
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
        const shared = findSharedImage(await getItems(), data.scrollX, data.scrollY);
        if (shared) return { imageRef: shared.imageRef, index: shared.nextIndex };

        const windowId = sender.tab?.windowId;
        const dataUrl =
            windowId != null
                ? await browser.tabs.captureVisibleTab(windowId, { format: 'png' })
                : await browser.tabs.captureVisibleTab({ format: 'png' });

        const imageRef = await putImage(await dataUrlToBlob(dataUrl));
        return { imageRef, index: 1 };
    });
});
