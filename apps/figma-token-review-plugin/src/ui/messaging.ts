import type { CodeMsg, UiMsg } from '~/shared/schema';

export function postToCode(msg: UiMsg): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

export function subscribe(handler: (msg: CodeMsg) => void): () => void {
    const listener = (event: MessageEvent) => {
        const data = event.data?.pluginMessage as CodeMsg | undefined;
        if (!data || typeof data.type !== 'string') return;
        handler(data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
}
