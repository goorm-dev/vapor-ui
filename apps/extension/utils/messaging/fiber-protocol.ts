// isolated content script ↔ MAIN world(fiber-reader) 사이의 postMessage 규약.
export const FIBER_TARGET_ATTR = 'data-vapor-qa-fiber-target';
export const FIBER_REQUEST = 'vapor-qa:fiber-request';
export const FIBER_RESPONSE = 'vapor-qa:fiber-response';
export const FIBER_TIMEOUT_MS = 4_000;

export interface FiberRequest {
    type: typeof FIBER_REQUEST;
    requestId: string;
}

export interface FiberResponse {
    type: typeof FIBER_RESPONSE;
    requestId: string;
    components: string[];
}

export const isFiberResponseForRequest = (
    data: unknown,
    requestId: string,
): data is FiberResponse => {
    if (!data || typeof data !== 'object') return false;
    const response = data as Partial<FiberResponse>;
    return (
        response.type === FIBER_RESPONSE &&
        response.requestId === requestId &&
        Array.isArray(response.components) &&
        response.components.length <= 3 &&
        response.components.every((component) => typeof component === 'string')
    );
};
