/** 현재 창의 활성 탭 id. 없으면(예: chrome:// 전용 창) undefined. */
export const getActiveTabId = async (): Promise<number | undefined> => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab?.id;
};
