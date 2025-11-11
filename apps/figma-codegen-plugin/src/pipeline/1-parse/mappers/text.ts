/**
 * Text Mapper
 *
 * PRD 6.2.3: Figma TextNode → Text Component
 */

import type { FigmaNode, RawIR } from '../../../domain/types';

/**
 * Text Node를 Raw IR로 매핑
 *
 * @param node - Figma Text 노드
 * @returns Raw IR
 */
export function mapTextNode(node: FigmaNode): RawIR {
    const textProps: Record<string, unknown> = {};

    // Text Align
    if (node.textAlignHorizontal) {
        textProps.textAlign = node.textAlignHorizontal.toLowerCase();
    }

    // Font Size
    if (node.fontSize) {
        textProps.fontSize = `${node.fontSize}px`;
    }

    // Font Weight
    if (node.fontWeight) {
        textProps.fontWeight = node.fontWeight;
    }

    // Line Height
    if (node.lineHeight && node.lineHeight.unit === 'PIXELS') {
        textProps.lineHeight = `${node.lineHeight.value}px`;
    }

    return {
        type: 'text',
        componentName: 'Text',
        props: textProps,
        children: [node.characters ?? ''],
        metadata: {
            figmaNodeId: node.id,
            figmaNodeName: node.name,
            figmaNodeType: 'TEXT',
        },
    };
}
