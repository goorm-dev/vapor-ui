import type { NodeInfo } from '~/common/schemas';

import { shouldSkipNode } from './filters';
import { classifyTextNode } from './text';

/** LLM 판정에 무의미한 벡터·리프 도형. nodeTree 에서 제외. */
const NOISE_LEAF_TYPES: ReadonlySet<string> = new Set([
    'VECTOR',
    'LINE',
    'ELLIPSE',
    'POLYGON',
    'STAR',
    'BOOLEAN_OPERATION',
]);

const TEXT_CHAR_CAP = 30;

/**
 * LLM 컨텍스트용 노드 트리를 DFS 로 평탄화.
 * - 숨겨진 노드/하위 제외
 * - `shouldSkipNode` 이름 필터에 걸린 노드는 자기 자신은 스킵하되 자식은 원래 부모 밑에 이어 붙임
 * - NOISE_LEAF_TYPES(벡터/리프 도형) 는 자기 스킵 + 자식은 스크린샷에 이미 반영되므로 무시
 * - TEXT 노드는 characters(30자 컷) + textStyle 부착
 * - 위치·크기(x/y/w/h) 는 스크린샷이 대체. childIds 는 parentId 의 역함수 → 생략.
 */
export async function walkTree(root: SceneNode): Promise<NodeInfo[]> {
    const out: NodeInfo[] = [];
    const stack: Array<{ node: SceneNode; parentId: string | null }> = [
        { node: root, parentId: null },
    ];

    while (stack.length) {
        const { node, parentId } = stack.pop()!;

        if (node.visible === false) continue;

        const children = 'children' in node ? (node.children as readonly SceneNode[]) : [];

        if (shouldSkipNode(node.name)) {
            for (const c of children) stack.push({ node: c, parentId });
            continue;
        }

        // 노이즈 리프 도형은 자기 자신·자식 모두 스킵. 시각 정보는 스크린샷에 있음.
        if (NOISE_LEAF_TYPES.has(node.type)) continue;

        const info: NodeInfo = {
            id: node.id,
            type: node.type,
            name: node.name,
            parentId,
        };

        if (node.type === 'TEXT') {
            const textNode = node as TextNode;
            info.characters = (textNode.characters || '').slice(0, TEXT_CHAR_CAP);

            try {
                const { textStyle } = await classifyTextNode(textNode);

                if (textStyle) info.textStyle = textStyle;
            } catch {
                /* textStyle 없이 characters 만 노출 */
            }
        }

        out.push(info);

        for (const c of children) {
            stack.push({ node: c, parentId: node.id });
        }
    }
    return out;
}
