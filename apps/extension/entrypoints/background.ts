import { getActiveTabId } from '~/utils/browser/active-tab';
import { blobToDataUrl, dataUrlToBlob, getImage, putImage } from '~/utils/data/image-store';
import { getItems } from '~/utils/data/session-store';
import { findSharedImage } from '~/utils/linear/image-sharing';
import { onMessage, sendMessage } from '~/utils/messaging';

export default defineBackground(() => {
    const panelWindowsKey = 'openPanelWindowIds';
    const openPanelWindows = browser.storage.session
        .get(panelWindowsKey)
        .then((stored) => new Set<number>((stored[panelWindowsKey] as number[] | undefined) ?? []));
    const savePanelWindows = (windows: Set<number>) =>
        browser.storage.session.set({ [panelWindowsKey]: [...windows] });
    const notifyTab = async (tabId: number, open: boolean) => {
        await sendMessage('setPanelOpen', { open }, tabId).catch(() => {});
    };

    browser.sidePanel.onOpened.addListener(async ({ windowId, tabId }) => {
        const windows = await openPanelWindows;
        windows.add(windowId);
        await savePanelWindows(windows);
        const targetTabId = tabId ?? (await getActiveTabId(windowId));
        if (targetTabId != null) await notifyTab(targetTabId, true);
    });

    browser.tabs.onActivated.addListener(async ({ windowId, tabId }) => {
        if ((await openPanelWindows).has(windowId)) await notifyTab(tabId, true);
    });

    browser.sidePanel.onClosed.addListener(async ({ windowId }) => {
        const windows = await openPanelWindows;
        windows.delete(windowId);
        await savePanelWindows(windows);
        const tabs = await browser.tabs.query({ windowId });
        await Promise.all(
            tabs.map((tab) => (tab.id == null ? undefined : notifyTab(tab.id, false))),
        );
    });

    onMessage('openReviewPanel', async ({ sender }) => {
        const tabId = sender.tab?.id;
        if (tabId != null) await browser.sidePanel.open({ tabId });
    });

    // 캡처와 이미지 저장을 모두 background(확장 origin)에서 수행한다.
    // content script의 IndexedDB는 주입된 페이지 origin이라 sidepanel(확장 origin)이
    // 읽지 못하므로, 저장을 background로 모아 origin을 일치시킨다.
    // 같은 탭·페이지·뷰포트면 이미지를 새로 찍지 않고 공유하며 index만 올린다.
    onMessage('captureAndStore', async ({ sender, data }) => {
        const tabId = sender.tab?.id;
        if (tabId == null) throw new Error('캡처할 탭을 찾지 못했습니다.');

        const shared = findSharedImage(
            await getItems(),
            tabId,
            data.pageUrl,
            data.scrollX,
            data.scrollY,
            data.width,
        );
        if (shared) return { imageRef: shared.imageRef, index: shared.nextIndex, tabId };

        const windowId = sender.tab?.windowId;
        const dataUrl =
            windowId != null
                ? await browser.tabs.captureVisibleTab(windowId, { format: 'png' })
                : await browser.tabs.captureVisibleTab({ format: 'png' });

        const imageRef = await putImage(await dataUrlToBlob(dataUrl));
        return { imageRef, index: 1, tabId };
    });

    // sidepanel은 자기 패널 폭을 못 벗어나므로, 이미지 확대는 활성 탭 페이지 위에
    // content script가 전체화면 오버레이로 그린다. blob은 background에서 dataURL로
    // 바꿔 넘긴다(content script는 확장 origin IndexedDB를 못 읽음).
    onMessage('openLightbox', async ({ data }) => {
        const blob = await getImage(data.imageRef);
        if (!blob) return;

        const tabId = data.tabId ?? (await getActiveTabId());
        if (tabId == null) return;

        await sendMessage(
            'showLightbox',
            { dataUrl: await blobToDataUrl(blob), boxes: data.boxes, alt: data.alt },
            tabId,
        );
    });
});
