/**
 * Parser Layer Types
 *
 * Parser에서 사용하는 입력/출력 타입들입니다.
 */
import type { Type } from 'ts-morph';

// ============================================================
// Parser Input Types
// ============================================================

/**
 * Props 추출 옵션
 */
export interface ExtractOptions {
    filterExternal?: boolean;
    filterHtml?: boolean;
    filterSprinkles?: boolean;
    includeHtmlWhitelist?: Set<string>;
    include?: string[];
    verbose?: boolean;
}

/**
 * Base-UI 타입 엔트리 - vapor-ui 경로 매핑 정보
 */
export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string; // "CollapsibleRoot.ChangeEventDetails"
}

/**
 * Base-UI 타입 맵 - normalized path를 키로 사용
 */
export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

// ============================================================
// Parser Output Types (Raw)
// ============================================================

/**
 * AST Symbol에서 추출한 raw prop 정보
 */
export interface RawProp {
    name: string;
    typeString: string;
    isOptional: boolean;
    description?: string;
    defaultValue?: string;
    declarationFilePath?: string;
}

/**
 * Namespace에서 추출한 raw 컴포넌트 정보
 */
export interface RawComponent {
    name: string;
    description?: string;
    props: RawProp[];
}

/**
 * 파일에서 추출한 raw 결과
 */
export interface RawFileResult {
    filePath: string;
    components: RawComponent[];
}
