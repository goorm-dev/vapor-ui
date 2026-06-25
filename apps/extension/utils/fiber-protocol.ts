// isolated content script ↔ MAIN world(fiber-reader) 사이의 postMessage 규약.
export const FIBER_TARGET_ATTR = 'data-vapor-qa-fiber-target';
export const FIBER_REQUEST = 'vapor-qa:fiber-request';
export const FIBER_RESPONSE = 'vapor-qa:fiber-response';

export interface FiberResponse {
    type: typeof FIBER_RESPONSE;
    components: string[];
}
