/**
 * Component Name Mapping Transformer
 *
 * Figma 컴포넌트 이름을 Vapor-UI 컴포넌트 이름으로 매핑
 * 예: Figma의 "Dialog" → Vapor-UI의 "Dialog.Root"
 *     Figma의 "Dialog.Content" → Vapor-UI의 "Dialog.Popup"
 */

import type { RawIR } from '../../../domain/types';
import type { ComponentMetadata } from '../../../infrastructure/metadata';
import { getComponentRule } from '../../../infrastructure/metadata';

/**
 * 컴포넌트 이름 매핑 적용
 *
 * @param ir - Raw IR
 * @param metadata - 컴포넌트 메타데이터
 * @returns 이름이 매핑된 IR
 */
export function applyComponentNameMapping(ir: RawIR, metadata: ComponentMetadata): RawIR {
    // 재귀적으로 IR 트리 순회
    return mapComponentName(ir, metadata);
}

/**
 * 노드의 컴포넌트 이름 매핑 (재귀)
 *
 * @param node - IR 노드
 * @param metadata - 메타데이터
 * @returns 매핑된 노드
 */
function mapComponentName(node: RawIR | string, metadata: ComponentMetadata): RawIR | string {
    // 문자열 노드는 그대로 반환
    if (typeof node === 'string') {
        return node;
    }

    // 현재 노드의 컴포넌트 규칙 조회
    const componentRule = getComponentRule(metadata, node.componentName);

    // vaporComponentName이 있으면 매핑, 없으면 원래 이름 사용
    const mappedName = componentRule?.vaporComponentName || node.componentName;

    // 자식들도 재귀적으로 매핑
    const mappedChildren = node.children.map((child) => mapComponentName(child, metadata));

    return {
        ...node,
        componentName: mappedName,
        children: mappedChildren,
    };
}
