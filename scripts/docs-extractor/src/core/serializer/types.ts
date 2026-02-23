/**
 * JSON Schema types - 최종 JSON 출력 형태
 *
 * 이 타입들은 외부 consumer가 사용하는 JSON 스키마 형태입니다.
 * 내부 메타데이터(source, category)는 제외됩니다.
 */

/**
 * JSON 출력용 Property
 */
export interface PropertyJson {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

/**
 * JSON 출력용 Component Props Info
 */
export interface PropsInfoJson {
    name: string;
    displayName: string;
    description?: string;
    props: PropertyJson[];
}

/**
 * JSON 출력용 File Result
 */
export interface FileResultJson {
    props: PropsInfoJson[];
}
