/**
 * Intermediate Representation (IR) 타입 정의
 *
 * Figma 노드와 React 코드 생성 사이의 중간 표현
 */

/**
 * Raw IR (Pass 1 출력)
 * Figma 노드를 1:1로 변환한 기본 IR 구조
 */
export interface RawIR {
    type: 'component' | 'element' | 'text';
    componentName: string;
    props: Record<string, unknown>;
    children: (RawIR | string)[];
    metadata: {
        figmaNodeId: string;
        figmaNodeName: string;
        figmaNodeType: string;
        isIcon?: boolean; // 아이콘 여부
    };
}

/**
 * Semantic IR (Pass 2 출력)
 * 메타데이터 기반 보강이 완료된 시맨틱 IR 구조
 */
export interface SemanticIR extends RawIR {
    imports: Set<string>;
    iconImports: Set<string>; // 아이콘 imports (@vapor-ui/icons)
    semanticType?: SemanticType;
}

export type SemanticType = 'trigger' | 'panel' | 'content' | 'portal' | 'overlay';
