import type { UiMsg } from '~/common/messages';

type Handler = (msg: UiMsg) => void | Promise<void>;

const handlers = new Map<UiMsg['type'], Handler>();

export function on(type: UiMsg['type'], handler: Handler): void {
    handlers.set(type, handler);
}

export function start(): void {
    figma.ui.onmessage = (msg: UiMsg) => {
        const handler = handlers.get(msg.type);
        if (!handler) return;

        const result = handler(msg);

        if (result instanceof Promise) {
            result.catch((err) => {
                console.error(`[plugin handler:${msg.type}]`, err);
            });
        }
    };
}
