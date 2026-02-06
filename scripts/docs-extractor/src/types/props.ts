export interface Property {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface PropsInfo {
    name: string;
    displayName: string;
    description?: string;
    props: Property[];
    defaultElement?: string;
    /** Compound component의 부모 컴포넌트 이름 */
    parentComponent?: string;
    /** Compound component의 하위 컴포넌트 목록 */
    subComponents?: PropsInfo[];
}

export interface ExtractDiagnostic {
    type: 'missing-description' | 'missing-default' | 'unresolved-type';
    componentName: string;
    propName?: string;
    message: string;
}

export interface FilePropsResult {
    props: PropsInfo[];
    /** Compound component를 계층적으로 그룹핑한 결과 */
    hierarchy?: PropsInfo[];
    /** 추출 과정에서 발견된 진단 정보 */
    diagnostics?: ExtractDiagnostic[];
}
