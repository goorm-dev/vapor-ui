import type { NodeInfo } from '~/common/schemas';

import { shouldSkipNode } from './filters';
import { classifyTextNode } from './text';

/**
 * LLM 컨텍스트용 노드 트리를 DFS 로 평탄화.
 * - 숨겨진 노드/하위 제외
 * - `shouldSkipNode` 이름 필터에 걸린 노드는 자기 자신은 스킵하되 자식은 원래 부모 밑에 이어 붙임
 * - TEXT 노드는 characters(60자 컷) + textStyle 부착
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

        const info: NodeInfo = {
            id: node.id,
            type: node.type,
            name: node.name,
            parentId,
            childIds: children.map((c) => c.id),
            x: 'x' in node ? (node as { x: number }).x : 0,
            y: 'y' in node ? (node as { y: number }).y : 0,
            w: 'width' in node ? (node as { width: number }).width : 0,
            h: 'height' in node ? (node as { height: number }).height : 0,
        };

        if (node.type === 'TEXT') {
            const textNode = node as TextNode;
            info.characters = (textNode.characters || '').slice(0, 60);

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
