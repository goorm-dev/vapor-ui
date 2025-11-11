/**
 * Layout Mapper
 *
 * PRD 6.2.1: Figma AutoLayout → Flex Component
 */

import type { FigmaNode, RawIR } from '../../../domain/types';
import { extractFlexboxProps, extractSprinkleProps } from '../../../domain/rules';

/**
 * Layout Node (AutoLayout)를 Raw IR로 매핑
 *
 * @param node - Figma AutoLayout 노드
 * @returns Raw IR
 */
export function mapLayoutNode(node: FigmaNode): RawIR {
    // [1] Flexbox Props (AutoLayout → Flex)
    const flexboxProps = extractFlexboxProps(node);

    // [2] Sprinkle Props (스타일 오버라이드)
    const sprinkleProps = extractSprinkleProps(node);

    return {
        type: 'element',
        componentName: 'Flex',
        props: { ...flexboxProps, ...sprinkleProps },
        children: [],
        metadata: {
            figmaNodeId: node.id,
            figmaNodeName: node.name,
            figmaNodeType: node.type,
        },
    };
}
