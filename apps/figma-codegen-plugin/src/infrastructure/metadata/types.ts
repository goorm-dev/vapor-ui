/**
 * Component Metadata Types
 *
 * PRD 5.3 & 10: component.metadata.json 스키마 정의
 * 메타데이터 기반 IR 보강을 위한 타입 정의
 */

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
     * 값 변환 규칙 (optional)
     * 예: { "fill": "solid", "outline": "outline" }
     */
    valueMapping?: Record<string, string>;

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
    type: 'Portal' | 'Panel' | 'Overlay' | 'Trigger' | 'Content';

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
     * 추가 props (optional)
     */
    props?: Record<string, unknown>;
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
     * 적용 대상 컴포넌트 (glob 패턴)
     * 예: "Dialog.*", "Tabs.Panel"
     */
    target: string;

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
 * PRD 10: component.metadata.json 스키마
 * 컴포넌트별 변환 규칙을 정의
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
 * Metadata 로더 옵션
 */
export interface MetadataLoaderOptions {
    /**
     * 메타데이터 파일 경로
     */
    path?: string;

    /**
     * 기본 메타데이터 (파일이 없을 경우)
     */
    defaultMetadata?: ComponentMetadata;
}
