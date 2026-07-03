import type { CodeEnvelope } from '~/shared/protocol';

type Listener = (msg: CodeEnvelope) => void;

const listeners = new Set<Listener>();
let attached = false;

function handleWindowMessage(event: MessageEvent) {
    const data = event.data?.pluginMessage as CodeEnvelope | undefined;
    if (!data || typeof data.type !== 'string') return;
    listeners.forEach((fn) => {
        fn(data);
    });
}

function ensureAttached() {
    if (attached) return;
    window.addEventListener('message', handleWindowMessage);
    attached = true;
}

export function onMessage(fn: Listener): () => void {
    ensureAttached();
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}
