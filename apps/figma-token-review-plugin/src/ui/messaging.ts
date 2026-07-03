import type { UiEnvelope } from '~/shared/protocol';
import type { CodeMsg, UiMsg } from '~/shared/schema';

import { onMessage } from './bus/client';

export function postToCode(msg: UiMsg | UiEnvelope): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

export function subscribe(handler: (msg: CodeMsg) => void): () => void {
    return onMessage((env) => handler(env as CodeMsg));
}
