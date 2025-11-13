/**
 * Component Mapper
 *
 * PRD 6.2.2: Figma Component/Instance → Vapor-UI Component
 */
import { extractVariantProps } from '../../../domain/rules';
import type { FigmaNode, RawIR } from '../../../domain/types';
import { extractComponentName } from '../../../utils';

/**
 * Component Node를 Raw IR로 매핑
 *
 * @param node - Figma Component/Instance 노드
 * @returns Raw IR
 */
export function mapComponentNode(node: FigmaNode): RawIR {
    // 컴포넌트 이름 추출 (💙Button → Button)
    const componentName = extractComponentName(node.name);

    // [1] Variant Props (논리적/시각적 상태만)
    const variantProps = extractVariantProps(node.componentProperties, componentName);

    // [2] Sprinkle Props (스타일 오버라이드)
    // const sprinkleProps = extractSprinkleProps(node);

    return {
        type: 'component',
        componentName,
        props: { ...variantProps },
        // props: { ...variantProps, ...sprinkleProps },
        children: [],
        metadata: {
            figmaNodeId: node.id,
            figmaNodeName: node.name,
            figmaNodeType: node.type,
        },
    };
}
