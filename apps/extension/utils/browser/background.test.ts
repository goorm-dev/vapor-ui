import { beforeEach, describe, expect, it, vi } from 'vitest';

import background from '~/entrypoints/background';

const mocks = vi.hoisted(() => ({
    getActiveTabId: vi.fn(),
    onMessage: vi.fn(),
    sendMessage: vi.fn(),
}));

vi.mock('~/utils/browser/active-tab', () => ({ getActiveTabId: mocks.getActiveTabId }));
vi.mock('~/utils/data/image-store', () => ({
    blobToDataUrl: vi.fn(),
    dataUrlToBlob: vi.fn(),
    getImage: vi.fn(),
    putImage: vi.fn(),
}));
vi.mock('~/utils/data/session-store', () => ({ getItems: vi.fn() }));
vi.mock('~/utils/linear/image-sharing', () => ({ findSharedImage: vi.fn() }));
vi.mock('~/utils/messaging', () => ({
    onMessage: mocks.onMessage,
    sendMessage: mocks.sendMessage,
}));

const event = <T extends unknown[]>() => {
    const listeners: Array<(...args: T) => unknown> = [];
    return {
        addListener: (listener: (...args: T) => unknown) => listeners.push(listener),
        trigger: async (...args: T) => Promise.all(listeners.map((listener) => listener(...args))),
    };
};

describe('background side panel state', () => {
    beforeEach(async () => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        await browser.storage.session.clear();
    });

    it('follows the panel across tabs and clears every tab when it closes', async () => {
        const onOpened = event<[{ windowId: number; path: string }]>();
        const onClosed = event<[{ windowId: number; path: string }]>();
        const onActivated = event<[{ windowId: number; tabId: number }]>();

        mocks.getActiveTabId.mockResolvedValue(11);
        mocks.sendMessage.mockResolvedValue(undefined);
        vi.spyOn(browser.tabs.onActivated, 'addListener').mockImplementation((listener) => {
            onActivated.addListener(listener);
        });
        const query = vi.spyOn(browser.tabs, 'query');
        (
            query as unknown as {
                mockResolvedValue: (value: Array<{ id: number }>) => void;
            }
        ).mockResolvedValue([{ id: 11 }, { id: 12 }]);
        Object.defineProperty(browser, 'sidePanel', {
            configurable: true,
            value: { onOpened, onClosed, open: vi.fn() },
        });

        background.main?.();

        await onOpened.trigger({ windowId: 7, path: 'sidepanel.html' });
        expect(mocks.sendMessage).toHaveBeenCalledWith('setPanelOpen', { open: true }, 11);

        await onActivated.trigger({ windowId: 7, tabId: 12 });
        expect(mocks.sendMessage).toHaveBeenCalledWith('setPanelOpen', { open: true }, 12);

        await onClosed.trigger({ windowId: 7, path: 'sidepanel.html' });
        expect(mocks.sendMessage).toHaveBeenCalledWith('setPanelOpen', { open: false }, 11);
        expect(mocks.sendMessage).toHaveBeenCalledWith('setPanelOpen', { open: false }, 12);
    });

    it('remembers an open panel after the service worker restarts', async () => {
        const firstOpened = event<[{ windowId: number; path: string }]>();
        Object.defineProperty(browser, 'sidePanel', {
            configurable: true,
            value: { onOpened: firstOpened, onClosed: event(), open: vi.fn() },
        });
        vi.spyOn(browser.tabs.onActivated, 'addListener').mockImplementation(() => {});
        mocks.getActiveTabId.mockResolvedValue(11);
        mocks.sendMessage.mockResolvedValue(undefined);
        background.main?.();
        await firstOpened.trigger({ windowId: 7, path: 'sidepanel.html' });

        vi.restoreAllMocks();
        mocks.sendMessage.mockClear();
        mocks.sendMessage.mockResolvedValue(undefined);
        const restartedActivated = event<[{ windowId: number; tabId: number }]>();
        Object.defineProperty(browser, 'sidePanel', {
            configurable: true,
            value: { onOpened: event(), onClosed: event(), open: vi.fn() },
        });
        vi.spyOn(browser.tabs.onActivated, 'addListener').mockImplementation((listener) => {
            restartedActivated.addListener(listener);
        });
        background.main?.();

        await restartedActivated.trigger({ windowId: 7, tabId: 12 });

        expect(mocks.sendMessage).toHaveBeenCalledWith('setPanelOpen', { open: true }, 12);
    });
});
