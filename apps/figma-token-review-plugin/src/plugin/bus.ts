import type { CodeEnvelope, RequestId, UiEnvelope } from '~/shared/protocol';
import type { UiMsg } from '~/shared/schema';

type Handler = (msg: UiEnvelope) => void | Promise<void>;

const handlers = new Map<UiMsg['type'], Handler>();

export function on(type: UiMsg['type'], handler: Handler): void {
    handlers.set(type, handler);
}

export function start(): void {
    figma.ui.onmessage = (msg: UiEnvelope) => {
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

export function postToUi(msg: CodeEnvelope, requestId?: RequestId): void {
    figma.ui.postMessage(requestId ? { ...msg, requestId } : msg);
}
