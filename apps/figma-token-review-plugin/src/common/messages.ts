import type { LlmContext, RawExtract, SelectionState } from './schemas';

export type ApiKeyState = { hasKey: boolean; key: string | null };

export type RequestId = string;

/* -------------------------------------------------------------------------------------------------
 * Message shapes
 *
 * `requestId` is declared inline only on variants that need request/response correlation
 * (scan/focus and their result/error responses). Fire-and-forget notifications omit it.
 * -----------------------------------------------------------------------------------------------*/

export type UiMsg =
    | { type: 'scan'; requestId: RequestId; frameId: string }
    | { type: 'focus'; requestId: RequestId; nodeIds: string[] }
    | { type: 'request-selection' }
    | { type: 'resize'; width: number; height: number }
    | { type: 'api-key:get' }
    | { type: 'api-key:set'; value: string }
    | { type: 'api-key:clear' };

export type CodeMsg =
    | { type: 'selection'; state: SelectionState }
    | {
          type: 'extract-result';
          requestId: RequestId;
          payload: { extract: RawExtract; llmContext: LlmContext };
      }
    | { type: 'extract-error'; requestId: RequestId; message: string }
    | { type: 'focus-result'; requestId: RequestId; resolved: number; missing: number }
    | { type: 'focus-error'; requestId: RequestId; message: string }
    | { type: 'api-key:state'; state: ApiKeyState };

export function newRequestId(): RequestId {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* -------------------------------------------------------------------------------------------------
 * Post helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * UI → plugin. Uses `parent` (DOM iframe global).
 * Tree-shaken from plugin bundle when only types are imported.
 */
export function postToCode(msg: UiMsg): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

/**
 * Plugin → UI. Uses `figma.ui` (plugin sandbox global).
 * Tree-shaken from UI bundle when only types are imported.
 */
export function postToUi(msg: CodeMsg): void {
    figma.ui.postMessage(msg);
}
