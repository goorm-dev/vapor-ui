import type { LlmContext, RawExtract, SelectionState } from './schemas';

export type ApiKeyState = { hasKey: boolean; key: string | null };

export type CodeMsg =
    | { type: 'selection'; state: SelectionState }
    | { type: 'extract-result'; payload: { extract: RawExtract; llmContext: LlmContext } }
    | { type: 'extract-error'; message: string }
    | { type: 'focus-result'; resolved: number; missing: number }
    | { type: 'focus-error'; message: string }
    | { type: 'api-key:state'; state: ApiKeyState };

export type UiMsg =
    | { type: 'request-selection' }
    | { type: 'scan'; frameId: string }
    | { type: 'focus'; nodeIds: string[] }
    | { type: 'resize'; width: number; height: number; commit?: boolean }
    | { type: 'api-key:get' }
    | { type: 'api-key:set'; value: string }
    | { type: 'api-key:clear' };

/* -------------------------------------------------------------------------------------------------
 * Envelope + RequestId (formerly src/shared/protocol.ts)
 * -----------------------------------------------------------------------------------------------*/

export type RequestId = string;

export type Envelope<T> = T & { requestId?: RequestId };

export type UiEnvelope = Envelope<UiMsg>;

export type CodeEnvelope = Envelope<CodeMsg>;

export function newRequestId(): RequestId {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* -------------------------------------------------------------------------------------------------
 * Post helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * UI → plugin direction. Uses `parent` (DOM iframe global).
 * Tree-shaken from plugin bundle when only types are imported.
 */
export function postToCode(msg: UiMsg | UiEnvelope): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

/**
 * Plugin → UI direction. Uses `figma.ui` (plugin sandbox global).
 * Tree-shaken from UI bundle when only types are imported.
 */
export function postToUi(msg: CodeEnvelope, requestId?: RequestId): void {
    figma.ui.postMessage(requestId ? { ...msg, requestId } : msg);
}
