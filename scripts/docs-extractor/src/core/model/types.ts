/**
 * Domain Model types - 정규화된 도메인 모델
 *
 * Raw 데이터에서 변환되어 비즈니스 로직이 적용된 타입들입니다.
 * 다른 consumer(JSON, YAML, IDE 플러그인 등)가 재사용할 수 있습니다.
 */

export type PropSource = 'base-ui' | 'custom' | 'variants';

export type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

/**
 * 정규화된 Prop 모델
 */
export interface PropModel {
    name: string;
    types: string[]; // 타입 배열로 정규화됨
    required: boolean;
    description?: string;
    defaultValue?: string;
    source: PropSource;
    category: PropCategory;
}

/**
 * 정규화된 Component 모델
 */
export interface ComponentModel {
    name: string;
    displayName: string;
    description?: string;
    props: PropModel[];
}

/**
 * 파일 추출 결과 모델
 */
export interface FileResultModel {
    filePath: string;
    components: ComponentModel[];
}
