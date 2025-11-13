/**
 * Text Mapper
 *
 * PRD 6.2.3: Figma TextNode → Text Component
 */
import { mapToTypographyStyle, mapToTypographyStyleLoose } from '../../../domain/rules';
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

    // Text Color
    if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.visible && fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            // RGB를 hex로 변환
            const toHex = (val: number) =>
                Math.round(val * 255)
                    .toString(16)
                    .padStart(2, '0');
            const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            textProps.color = hexColor;
        }
    }

    // Typography 스타일 매핑 시도
    const fontSize = node.fontSize;
    const fontWeight = node.fontWeight;
    const lineHeight =
        node.lineHeight && node.lineHeight.unit === 'PIXELS' ? node.lineHeight.value : undefined;

    if (fontSize && fontWeight && lineHeight) {
        // 정확히 일치하는 typography 스타일 찾기
        const typographyStyle = mapToTypographyStyle(fontSize, fontWeight, lineHeight);

        if (typographyStyle) {
            // Typography 스타일 사용
            textProps.typography = typographyStyle;
        } else {
            // LineHeight가 다른 경우, fontSize와 fontWeight만으로 매칭 시도
            const looseMatch = mapToTypographyStyleLoose(fontSize, fontWeight);

            if (looseMatch) {
                // Typography 스타일 사용하되, lineHeight는 override
                textProps.typography = looseMatch;
                textProps.lineHeight = `${lineHeight}px`;
            } else {
                // 매칭되는 스타일이 없으면 개별 속성 사용
                textProps.fontSize = `${fontSize}px`;
                textProps.fontWeight = fontWeight;
                textProps.lineHeight = `${lineHeight}px`;
            }
        }
    } else {
        // 일부 속성만 있는 경우 개별 설정
        if (fontSize) {
            textProps.fontSize = `${fontSize}px`;
        }
        if (fontWeight) {
            textProps.fontWeight = fontWeight;
        }
        if (lineHeight) {
            textProps.lineHeight = `${lineHeight}px`;
        }
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
