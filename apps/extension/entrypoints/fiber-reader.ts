import { extractComponentAncestry } from '~/utils/dom/fiber-component';
import { FIBER_REQUEST, FIBER_RESPONSE, FIBER_TARGET_ATTR } from '~/utils/messaging/fiber-protocol';

// MAIN world에서 실행 — isolated content script는 fiber expando를 못 읽으므로,
// 마킹된 노드의 컴포넌트 계보를 여기서 읽어 postMessage로 돌려준다.
export default defineUnlistedScript(() => {
    window.addEventListener('message', (event) => {
        if (event.source !== window || event.data?.type !== FIBER_REQUEST) return;

        const target = document.querySelector(`[${FIBER_TARGET_ATTR}]`);
        const components = target ? extractComponentAncestry(target) : [];
        window.postMessage({ type: FIBER_RESPONSE, components }, '*');
    });
});
