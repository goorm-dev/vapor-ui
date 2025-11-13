/**
 * Functional Component Injection Transformer
 *
 * PRD 7.2 & 8.2.2: 기능적 컴포넌트 자동 주입
 * 예: Dialog.Portal, Tabs.Panel 자동 생성
 */
import type { RawIR } from '../../../domain/types';
import type { ComponentMetadata, FunctionalComponentRule } from '../../../infrastructure/metadata';

/**
 * 컴포넌트 규칙 조회 헬퍼
 *
 * @param metadata - 메타데이터
 * @param componentName - 컴포넌트 이름
 * @returns 컴포넌트 규칙
 */
function getComponentRule(metadata: ComponentMetadata, componentName: string) {
    const parts = componentName.split('.');

    if (parts.length === 1) {
        return metadata.components[componentName];
    }

    const [parent, ...childParts] = parts;
    const childName = childParts.join('.');
    const parentRule = metadata.components[parent];

    if (!parentRule) {
        return undefined;
    }

    return parentRule.subComponents?.[childName];
}

/**
 * 기능 컴포넌트 주입 변환기
 *
 * @param ir - Raw IR
 * @param metadata - 컴포넌트 메타데이터
 * @returns 변환된 IR
 */
export function injectFunctionalComponents(ir: RawIR, metadata: ComponentMetadata): RawIR {
    // 재귀적으로 IR 트리 순회하며 주입 규칙 적용
    const result = applyInjection(ir, metadata);

    // Type guard: result가 string이면 오류 (이론적으로 발생하지 않아야 함)
    if (typeof result === 'string') {
        throw new Error('Unexpected string result in functional component injection');
    }

    return result;
}

/**
 * IR 노드에 주입 규칙 적용
 *
 * @param node - IR 노드
 * @param metadata - 메타데이터
 * @returns 변환된 노드
 */
function applyInjection(node: RawIR | string, metadata: ComponentMetadata): RawIR | string {
    // 문자열 노드는 그대로 반환
    if (typeof node === 'string') {
        return node;
    }

    // 자식 먼저 처리 (bottom-up)
    const transformedChildren = node.children.map((child) => applyInjection(child, metadata));

    // 현재 노드의 컴포넌트 규칙 조회
    const componentRule = getComponentRule(metadata, node.componentName);

    if (!componentRule?.augmentations) {
        // 규칙이 없으면 자식만 업데이트하고 반환
        return {
            ...node,
            children: transformedChildren,
        };
    }

    // Functional Component 주입 규칙만 필터링
    const injectionRules = componentRule.augmentations.filter(
        (aug) => aug.type === 'functional-component' && aug.functionalComponent,
    );

    // 주입 규칙이 없으면 반환
    if (injectionRules.length === 0) {
        return {
            ...node,
            children: transformedChildren,
        };
    }

    // 규칙 적용
    let result: RawIR = {
        ...node,
        children: transformedChildren,
    };

    for (const rule of injectionRules) {
        if (!rule.functionalComponent) continue;

        result = applyFunctionalComponentRule(result, rule.functionalComponent);
    }

    return result;
}

/**
 * Functional Component 규칙 적용
 *
 * @param node - 대상 노드
 * @param rule - 주입 규칙
 * @returns 변환된 노드
 */
function applyFunctionalComponentRule(node: RawIR, rule: FunctionalComponentRule): RawIR {
    const { componentName, position, props = {} } = rule;

    switch (position) {
        case 'wrap': {
            // 현재 노드를 새 컴포넌트로 감싸기
            return {
                type: 'component',
                componentName,
                props: { ...props },
                children: [node],
                metadata: {
                    figmaNodeId: node.metadata.figmaNodeId,
                    figmaNodeName: `${componentName}(wrap)`,
                    figmaNodeType: 'INJECTED',
                },
            };
        }

        case 'first-child': {
            // 현재 노드의 첫 번째 자식으로 추가
            // Trigger, Close 타입인 경우 기본 텍스트 추가
            const isTrigger = rule.type === 'Trigger';
            const isClose = rule.type === 'Close';
            const children = isTrigger
                ? ['Trigger(내용을 추가해주세요)']
                : isClose
                  ? ['Close(내용을 추가해주세요)']
                  : [];

            const functionalComponent: RawIR = {
                type: 'component',
                componentName,
                props: { ...props },
                children,
                metadata: {
                    figmaNodeId: node.metadata.figmaNodeId + '-first-child',
                    figmaNodeName: `${componentName}(first-child)`,
                    figmaNodeType: 'INJECTED',
                },
            };

            return {
                ...node,
                children: [functionalComponent, ...node.children],
            };
        }

        case 'last-child': {
            // 현재 노드의 마지막 자식으로 추가
            // Trigger, Close 타입인 경우 기본 텍스트 추가
            const isTrigger = rule.type === 'Trigger';
            const isClose = rule.type === 'Close';
            const children = isTrigger
                ? ['Trigger(내용을 추가해주세요)']
                : isClose
                  ? ['Close(내용을 추가해주세요)']
                  : [];

            const functionalComponent: RawIR = {
                type: 'component',
                componentName,
                props: { ...props },
                children,
                metadata: {
                    figmaNodeId: node.metadata.figmaNodeId + '-last-child',
                    figmaNodeName: `${componentName}(last-child)`,
                    figmaNodeType: 'INJECTED',
                },
            };

            return {
                ...node,
                children: [...node.children, functionalComponent],
            };
        }

        case 'before':
        case 'after': {
            // before/after는 부모 레벨에서 처리해야 하므로 현재 구현에서는 지원 안 함
            // 필요시 augment.ts에서 부모-자식 관계를 고려한 별도 로직 필요
            return node;
        }

        default:
            return node;
    }
}
