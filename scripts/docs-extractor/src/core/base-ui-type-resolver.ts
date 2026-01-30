/**
 * Base-UI 타입 리졸버 모듈
 *
 * ImportDeclaration에서 base-ui 컴포넌트의 타입 정보를 추출하여
 * vapor-ui 타입 경로로 매핑합니다.
 */
import { type ImportSpecifier, type SourceFile, SyntaxKind, type Type } from 'ts-morph';

export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string; // "CollapsibleRoot.ChangeEventDetails"
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

/**
 * base-ui 타입의 텍스트에서 정규화된 경로를 추출합니다.
 * 예: import(".../@base-ui/.../CollapsibleRoot").CollapsibleRoot.ChangeEventDetails
 *   → "CollapsibleRoot.ChangeEventDetails"
 */
function normalizeBaseUiTypePath(typeText: string): string | null {
    // import("...").XXX.YYY.ZZZ 패턴에서 마지막 부분 추출
    const match = typeText.match(/\)\s*\.\s*(.+)$/);
    if (!match) return null;
    return match[1].trim();
}

/**
 * ImportSpecifier에서 하위 타입들을 재귀적으로 수집합니다.
 */
function collectNestedTypes(
    importSpecifier: ImportSpecifier,
    type: Type,
    basePath: string,
    map: BaseUiTypeMap,
    depth: number = 0,
): void {
    // 최대 깊이 제한 (무한 재귀 방지)
    if (depth > 3) return;

    const properties = type.getProperties();

    for (const prop of properties) {
        const propName = prop.getName();

        // 내부 속성 제외 (prototype, __proto__ 등)
        if (propName.startsWith('_') || propName === 'prototype') continue;

        const propType = prop.getTypeAtLocation(importSpecifier);
        const vaporPath = `${basePath}.${propName}`;

        // 타입 텍스트 가져오기
        const typeText = propType.getText();

        // base-ui 타입인 경우에만 맵에 추가
        if (typeText.includes('@base-ui')) {
            const normalizedPath = normalizeBaseUiTypePath(typeText);
            if (normalizedPath) {
                map[normalizedPath] = {
                    type: propType,
                    vaporPath,
                };
            }
        }

        // 더 깊은 레벨 탐색 (ChangeEventDetails, Props 등)
        collectNestedTypes(importSpecifier, propType, vaporPath, map, depth + 1);
    }
}

/**
 * 소스 파일에서 base-ui import를 찾아 타입 맵을 빌드합니다.
 */
export function buildBaseUiTypeMap(sourceFile: SourceFile): BaseUiTypeMap {
    const map: BaseUiTypeMap = {};

    // @base-ui/react import 찾기
    const baseUiImport = sourceFile.getImportDeclaration((decl) =>
        decl.getModuleSpecifierValue().includes('@base-ui'),
    );

    if (baseUiImport) {
        const namedImports = baseUiImport.getNamedImports();

        for (const namedImport of namedImports) {
            // alias가 있으면 alias 사용 (예: Collapsible as BaseCollapsible)
            const alias = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
            const importType = namedImport.getType();

            // 최상위 타입 등록
            const topLevelTypeText = importType.getText();
            if (topLevelTypeText.includes('@base-ui')) {
                const normalizedPath = normalizeBaseUiTypePath(topLevelTypeText);
                if (normalizedPath) {
                    map[normalizedPath] = {
                        type: importType,
                        vaporPath: alias,
                    };
                }
            }

            // 하위 properties 재귀 수집
            collectNestedTypes(namedImport, importType, alias, map);
        }
    }

    // namespace에서 re-export된 type alias 수집 (기존 맵을 덮어씀)
    collectNamespaceTypeAliases(sourceFile, map);

    return map;
}

/**
 * 타입 텍스트에서 base-ui 타입을 찾아 vapor-ui 경로로 변환합니다.
 */
export function resolveBaseUiType(typeText: string, map: BaseUiTypeMap): string | null {
    if (!typeText.includes('@base-ui')) return null;

    const normalizedPath = normalizeBaseUiTypePath(typeText);
    if (!normalizedPath) return null;

    const entry = map[normalizedPath];
    if (entry) {
        return entry.vaporPath;
    }

    return null;
}

/**
 * Fallback: base-ui 타입 경로에서 마지막 타입 이름만 추출합니다.
 * 예: import("...").CollapsibleRoot.ChangeEventDetails → ChangeEventDetails
 */
export function extractSimplifiedTypeName(typeText: string): string {
    // import("...").A.B.C 패턴에서 마지막 부분 추출
    const match = typeText.match(/\.(\w+)$/);
    return match ? match[1] : typeText;
}

/**
 * namespace에서 exported type alias를 수집하여 base-ui 타입 맵에 추가합니다.
 *
 * 예: export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
 * → "Collapsible.Root.ChangeEventDetails" 매핑 추가
 */
export function collectNamespaceTypeAliases(sourceFile: SourceFile, map: BaseUiTypeMap): void {
    const namespaces = sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported());

    for (const ns of namespaces) {
        const nsName = ns.getName();

        // namespace 내의 exported type alias 수집
        const typeAliases = ns.getTypeAliases().filter((ta) => ta.isExported());

        for (const typeAlias of typeAliases) {
            const aliasName = typeAlias.getName();
            const aliasType = typeAlias.getType();
            const typeText = aliasType.getText();

            // base-ui 타입을 참조하는 경우에만 매핑 추가
            // 1. typeText에 import 경로가 포함된 경우
            // 2. 또는 type alias 선언이 base-ui 타입을 참조하는 경우
            const declText = typeAlias.getText();
            const hasImportPath = typeText.includes('@base-ui');
            const isBaseUiAlias =
                (declText.includes('Base') && declText.includes('.Root.')) ||
                (declText.includes('Base') && declText.includes('.ChangeEventDetails'));

            if (hasImportPath || isBaseUiAlias) {
                // ComponentNameRoot → ComponentName.Root 형태로 변환
                const vaporPath = formatVaporTypePath(nsName, aliasName);

                if (hasImportPath) {
                    // import 경로가 있는 경우 정규화된 경로를 키로 사용
                    const normalizedPath = normalizeBaseUiTypePath(typeText);
                    if (normalizedPath) {
                        map[normalizedPath] = { type: aliasType, vaporPath };
                    }
                }

                // 항상 타입 이름으로도 키 추가 (fallback용)
                // 예: "CheckboxRoot.ChangeEventDetails" → "Checkbox.Root.ChangeEventDetails"
                map[`${nsName}.${aliasName}`] = { type: aliasType, vaporPath };
            }
        }
    }
}

/**
 * 내부 namespace 이름을 외부 접근 가능한 경로로 변환합니다.
 * 예: CollapsibleRoot.ChangeEventDetails → Collapsible.Root.ChangeEventDetails
 * 예: FloatingBarRoot.ChangeEventDetails → FloatingBar.Root.ChangeEventDetails
 */
function formatVaporTypePath(nsName: string, typeName: string): string {
    // 마지막 대문자 단어를 파트 이름으로 분리
    const match = nsName.match(/^(.+)([A-Z][a-z]+)$/);
    if (match) {
        const [, componentName, partName] = match;
        return `${componentName}.${partName}.${typeName}`;
    }
    // 변환 불가능한 경우 원본 그대로
    return `${nsName}.${typeName}`;
}
