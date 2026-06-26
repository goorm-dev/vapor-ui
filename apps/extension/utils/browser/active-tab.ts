/** 현재 창의 활성 탭 id. 없으면(예: chrome:// 전용 창) undefined. */
export const getActiveTabId = async (windowId?: number): Promise<number | undefined> => {
    const [tab] = await browser.tabs.query(
        windowId == null ? { active: true, currentWindow: true } : { active: true, windowId },
    );
    return tab?.id;
};
