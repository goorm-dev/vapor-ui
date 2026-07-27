import { isInteractionLayer } from './filters';

type ExportSettings = ExportSettingsImage | ExportSettingsSVG | ExportSettingsPDF;

type Cloneable = SceneNode & {
    clone: () => SceneNode;
    exportAsync: (settings: ExportSettings) => Promise<Uint8Array>;
    remove: () => void;
};

/**
 * clone 하위에서 🔶InteractionLayer 를 visible=false 로 표시.
 * clone 은 원본과 독립된 서브트리라 override 도 clone 에만 남는다 (원본 무영향).
 * INSTANCE 하위 자식은 `remove()` 가 막혀 있어 visibility 를 쓴다.
 */
function hideOnClone(root: SceneNode): void {
    const stack: SceneNode[] = [root];

    while (stack.length) {
        const node = stack.pop()!;

        if (isInteractionLayer(node)) {
            const toggle = node as SceneNode & { visible: boolean };
            toggle.visible = false;
            continue;
        }

        if ('children' in node) {
            for (const c of node.children as readonly SceneNode[]) stack.push(c);
        }
    }
}

/**
 * `node` 를 **clone** 한 뒤 🔶InteractionLayer 를 감춘 상태로 export.
 * - 원본 노드는 read-only 로 취급 → 사용자 파일 무손상.
 * - clone 은 화면 밖(-100000,-100000) 으로 이동시켜 캔버스 flash 방지.
 * - export 성공/실패와 무관하게 clone.remove() 로 정리 (try/finally).
 * - clone/remove 자체는 Figma undo 히스토리에 항목을 남긴다 (원본 구조는 유지).
 */
export async function exportWithoutInteractionLayers(
    node: SceneNode,
    settings: ExportSettings,
): Promise<Uint8Array> {
    const cloneable = node as Cloneable;
    if (typeof cloneable.clone !== 'function') {
        return cloneable.exportAsync(settings);
    }

    const clone = cloneable.clone() as Cloneable;

    try {
        const positioned = clone as unknown as { x?: number; y?: number };
        if (typeof positioned.x === 'number') positioned.x = -100000;
        if (typeof positioned.y === 'number') positioned.y = -100000;

        hideOnClone(clone);
        return await clone.exportAsync(settings);
    } finally {
        clone.remove();
    }
}
