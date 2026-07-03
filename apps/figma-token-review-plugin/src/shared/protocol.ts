import type { CodeMsg, UiMsg } from './schema';

export type RequestId = string;

export type Envelope<T> = T & { requestId?: RequestId };

export type UiEnvelope = Envelope<UiMsg>;
export type CodeEnvelope = Envelope<CodeMsg>;

export function newRequestId(): RequestId {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
