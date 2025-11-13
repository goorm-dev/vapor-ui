/**
 * Icon Mapper
 *
 * Figma VECTOR/LINE/STAR/ELLIPSE 노드 → Icon Component
 */
import { FIGMA_LAYER_PREFIX } from '../../../domain/constants';
import type { FigmaNode, RawIR } from '../../../domain/types';

/**
 * 아이콘 노드를 Raw IR로 매핑
 *
 * @param node - Figma Vector/Icon 노드
 * @returns Raw IR
 */
export function mapIconNode(node: FigmaNode): RawIR {
    // 아이콘 이름 추출
    const iconName = extractIconName(node.name);

    return {
        type: 'component',
        componentName: iconName,
        props: {},
        children: [],
        metadata: {
            figmaNodeId: node.id,
            figmaNodeName: node.name,
            figmaNodeType: node.type,
            isIcon: true, // 아이콘임을 표시
        },
    };
}

/**
 * Figma 노드 이름에서 아이콘 이름 추출
 *
 * @param nodeName - Figma 노드 이름
 * @returns 아이콘 컴포넌트 이름
 *
 * @example
 * extractIconName("❤️HeartIcon") → "HeartIcon"
 * extractIconName("❤️CloseOutlineIcon") → "CloseOutlineIcon"
 */
function extractIconName(nodeName: string): string {
    // ❤️ prefix 제거 (빨간 하트만 제거)
    if (nodeName.startsWith(FIGMA_LAYER_PREFIX.ICON)) {
        return nodeName.substring(FIGMA_LAYER_PREFIX.ICON.length);
    }

    // ❤️가 없으면 그대로 반환
    return nodeName;
}
