/**
 * Component Metadata Types
 *
 * PRD 5.3 & 10: component.metadata.ts 스키마 정의
 * 메타데이터 기반 IR 보강을 위한 타입 정의
 *
 * ✅ TypeScript 지원: 함수형 변환 및 동적 로직 지원
 */
import type { RawIR } from '../../domain/types';

/**
 * Value Transform Function
 *
 * PRD 5.3 & 6.5: 함수형 값 변환 지원
 * Figma variant 값을 React prop 값으로 변환하는 함수
 *
 * @example
 * // "In Progress" → "inProgress"
 * (value) => value.split(' ').map((w, i) => i === 0 ? w.toLowerCase() : capitalize(w)).join('')
 */
export type ValueTransformFn = (value: string) => unknown;

/**
 * Value Transform Preset
 *
 * 자주 사용하는 변환 프리셋
 */
export type ValueTransformPreset = 'toLowerCase' | 'toUpperCase' | 'toBoolean' | 'toNumber';

/**
 * Target Matcher Function
 *
 * PRD 10.3: 함수형 타겟 매칭
 * 복잡한 매칭 로직을 함수로 표현
 *
 * @example
 * (node) => node.componentName === 'Tabs' && !['Tabs.Trigger', 'Tabs.List'].includes(node.name)
 */
export type TargetMatcherFn = (node: RawIR, context: AugmentContext) => boolean;

/**
 * Props Generator Function
 *
 * PRD 10.3: 동적 props 생성
 * 런타임에 props를 계산하는 함수
 *
 * @example
 * (child, index) => ({ value: `${index}` })
 */
export type PropGeneratorFn = (
    child: RawIR,
    index: number,
    siblings: RawIR[],
) => Record<string, unknown>;

/**
 * Augment Context
 *
 * Augmentation 실행 컨텍스트
 */
export interface AugmentContext {
    depth: number;
    parent?: RawIR;
    siblings: RawIR[];
}

/**
 * Variant Rule - Variant Props 매핑 규칙
 *
 * Props = Variants 원칙을 구현하는 규칙
 */
export interface VariantRule {
    /**
     * Figma의 componentProperty 키
     * 예: "size", "variant", "colorPalette"
     */
    figmaProperty: string;

    /**
     * React Props 이름
     * 예: "size", "variant", "colorPalette"
     */
    propName: string;

    /**
     * ✅ 값 변환 규칙 (optional)
     * - Record: 정적 매핑 (예: { "fill": "solid" })
     * - ValueTransformFn: 동적 변환 함수
     * - ValueTransformPreset: 프리셋 ('toLowerCase', 'toBoolean' 등)
     */
    valueMapping?: Record<string, string> | ValueTransformFn | ValueTransformPreset;

    /**
     * 이 variant를 포함할지 여부를 결정하는 조건 (optional)
     * 예: "!isDisabled" (disabled가 아닐 때만 포함)
     */
    condition?: string;
}

/**
 * Functional Component Injection Rule
 *
 * PRD 7.2 & 8.2.2: 기능적 컴포넌트 주입 규칙
 * 예: Dialog.Portal, Tabs.Panel 자동 주입
 */
export interface FunctionalComponentRule {
    /**
     * 주입할 컴포넌트 타입
     * 예: "Portal", "Panel", "Overlay"
     */
    type: 'Portal' | 'Panel' | 'Overlay' | 'Trigger' | 'Content' | 'Close';

    /**
     * 주입할 위치
     * - "wrap": 현재 노드를 감싸기
     * - "before": 현재 노드 이전에 형제로 추가
     * - "after": 현재 노드 이후에 형제로 추가
     * - "first-child": 현재 노드의 첫 번째 자식으로 추가
     * - "last-child": 현재 노드의 마지막 자식으로 추가
     */
    position: 'wrap' | 'before' | 'after' | 'first-child' | 'last-child';

    /**
     * 조건 (optional)
     * 예: "hasOverlay" - overlay가 있을 때만 주입
     */
    condition?: string;

    /**
     * 주입할 컴포넌트 이름
     * 예: "Dialog.Portal", "Tabs.Panel"
     */
    componentName: string;

    /**
     * ✅ 추가 props (optional)
     * - 정적 props: Record<string, unknown>
     * - 동적 props: PropGeneratorFn
     */
    props?: Record<string, unknown> | PropGeneratorFn;
}

/**
 * Nesting Optimization Rule
 *
 * 불필요한 중첩 구조를 최적화하는 규칙
 */
export interface NestingOptimizationRule {
    /**
     * 최적화 타입
     * - "flatten": 불필요한 래퍼 제거
     * - "merge": 동일한 컴포넌트 병합
     */
    type: 'flatten' | 'merge';

    /**
     * 적용 조건
     */
    condition?: string;
}

/**
 * Augmentation Rule - IR 보강 규칙
 *
 * PRD 7.1: Raw IR을 Semantic IR로 변환하는 규칙
 */
export interface AugmentRule {
    /**
     * 규칙 이름
     */
    name: string;

    /**
     * 규칙 타입
     */
    type: 'functional-component' | 'nesting-optimization';

    /**
     * ✅ 적용 대상 컴포넌트
     * - 문자열: glob 패턴 (예: "Dialog.*", "Tabs.Panel")
     * - 함수: 복잡한 매칭 로직 (예: (node) => node.componentName === 'Tabs')
     */
    target: string | TargetMatcherFn;

    /**
     * 기능 컴포넌트 주입 규칙 (type이 'functional-component'일 때)
     */
    functionalComponent?: FunctionalComponentRule;

    /**
     * Nesting 최적화 규칙 (type이 'nesting-optimization'일 때)
     */
    nestingOptimization?: NestingOptimizationRule;
}

/**
 * Component Metadata
 *
 * PRD 10: component.metadata.ts 스키마
 * 컴포넌트별 변환 규칙을 정의
 *
 * ✅ TypeScript로 작성하여 타입 안전성과 함수형 로직 지원
 */
export interface ComponentMetadata {
    /**
     * 메타데이터 스키마 버전
     */
    version: string;

    /**
     * 컴포넌트별 규칙 정의
     */
    components: Record<string, ComponentRule>;
}

/**
 * Component Rule
 *
 * 개별 컴포넌트에 대한 변환 규칙
 */
export interface ComponentRule {
    /**
     * 컴포넌트 이름
     * 예: "Button", "Dialog", "Tabs"
     */
    name: string;

    /**
     * Vapor-UI 컴포넌트 이름 (Figma와 다를 경우)
     * 예: Figma의 "💙Button" → Vapor-UI의 "Button"
     */
    vaporComponentName?: string;

    /**
     * Variant 매핑 규칙
     */
    variants?: VariantRule[];

    /**
     * IR 보강 규칙
     */
    augmentations?: AugmentRule[];

    /**
     * 하위 컴포넌트 규칙 (Compound Components)
     */
    subComponents?: Record<string, ComponentRule>;
}

/**
 * ⚠️ Deprecated: MetadataLoaderOptions
 *
 * PRD 9: 직접 import 방식으로 변경되어 더 이상 필요하지 않음
 *
 * @deprecated No longer needed with TypeScript metadata
 */
export interface MetadataLoaderOptions {
    /**
     * @deprecated
     */
    path?: string;

    /**
     * @deprecated
     */
    defaultMetadata?: ComponentMetadata;
}
