/**
 * Base-UI 타입 리졸버 모듈
 *
 * ImportDeclaration에서 base-ui 컴포넌트의 타입 정보를 추출하여
 * vapor-ui 타입 경로로 매핑합니다.
 */
import {
    type ImportSpecifier,
    type ModuleDeclaration,
    type SourceFile,
    SyntaxKind,
    type Type,
    type TypeAliasDeclaration,
} from 'ts-morph';

export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string; // "CollapsibleRoot.ChangeEventDetails"
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

/**
 * Type 객체에서 base-ui 모듈의 qualified path를 AST 기반으로 추출합니다.
 * getText() + regex 대신 Symbol.getFullyQualifiedName()을 사용하여
 * greedy 매칭 위험 없이 정확한 경로를 반환합니다.
 *
 * @example
 * // Type of import("@base-ui/react/collapsible").CollapsibleRoot.ChangeEventDetails
 * // → "CollapsibleRoot.ChangeEventDetails"
 *
 * @returns base-ui 타입이 아니거나 symbol이 없으면 null
 */
function getBaseUiQualifiedPath(type: Type): string | null {
    for (const symbol of [type.getSymbol(), type.getAliasSymbol()]) {
        if (!symbol) continue;

        const fqn = symbol.getFullyQualifiedName();

        // FQN 포맷: "module/path".Namespace.Type
        if (!fqn.startsWith('"')) continue;

        const closingQuote = fqn.indexOf('"', 1);
        if (closingQuote === -1) continue;

        // @base-ui 모듈에서 선언된 타입만 처리
        const modulePath = fqn.substring(1, closingQuote);
        if (!modulePath.includes('@base-ui')) continue;

        // "module/path".Namespace.Type → Namespace.Type
        if (closingQuote + 2 > fqn.length) continue;
        return fqn.substring(closingQuote + 2);
    }

    return null;
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

        // AST 기반으로 base-ui qualified path 추출
        const normalizedPath = getBaseUiQualifiedPath(propType);
        if (normalizedPath) {
            map[normalizedPath] = {
                type: propType,
                vaporPath,
            };
        }

        // 더 깊은 레벨 탐색 (ChangeEventDetails, Props 등)
        collectNestedTypes(importSpecifier, propType, vaporPath, map, depth + 1);
    }
}

// 파일 경로 기반 캐시 (동일 파일에 대한 중복 분석 방지)
const baseUiTypeMapCache = new Map<string, BaseUiTypeMap>();

/**
 * 소스 파일에서 base-ui import를 찾아 타입 맵을 빌드합니다.
 * 동일 파일에 대한 결과를 캐싱하여 중복 분석을 방지합니다.
 */
export function buildBaseUiTypeMap(sourceFile: SourceFile): BaseUiTypeMap {
    const filePath = sourceFile.getFilePath();
    const cached = baseUiTypeMapCache.get(filePath);
    if (cached) return cached;

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

            // 최상위 타입 등록 (AST 기반)
            const normalizedPath = getBaseUiQualifiedPath(importType);
            if (normalizedPath) {
                map[normalizedPath] = {
                    type: importType,
                    vaporPath: alias,
                };
            }

            // 하위 properties 재귀 수집
            collectNestedTypes(namedImport, importType, alias, map);
        }
    }

    // namespace에서 re-export된 type alias 수집 (기존 맵을 덮어씀)
    collectNamespaceTypeAliases(sourceFile, map);

    baseUiTypeMapCache.set(filePath, map);
    return map;
}

/**
 * Type 객체에서 base-ui 타입을 찾아 vapor-ui 경로로 변환합니다.
 * AST 기반으로 동작하여 getText() + regex 의존을 제거합니다.
 */
export function resolveBaseUiType(type: Type, map: BaseUiTypeMap): string | null {
    const normalizedPath = getBaseUiQualifiedPath(type);
    if (!normalizedPath) return null;

    return map[normalizedPath]?.vaporPath ?? null;
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

    // sibling namespace들에서 component prefix 자동 추출
    const componentPrefix = findComponentPrefix(namespaces);

    for (const ns of namespaces) {
        const nsName = ns.getName();

        // namespace 내의 exported type alias 수집
        const typeAliases = ns.getTypeAliases().filter((ta) => ta.isExported());

        for (const typeAlias of typeAliases) {
            const aliasName = typeAlias.getName();
            const aliasType = typeAlias.getType();

            // base-ui 타입을 참조하는 경우에만 매핑 추가
            // 1. AST에서 base-ui qualified path를 추출할 수 있는 경우
            // 2. 또는 type alias의 원본 타입이 @base-ui 패키지에서 선언된 경우
            const normalizedPath = getBaseUiQualifiedPath(aliasType);
            const isBaseUiAlias = !normalizedPath && isBaseUiTypeAlias(typeAlias);

            if (normalizedPath || isBaseUiAlias) {
                // ComponentNameRoot → ComponentName.Root 형태로 변환
                const vaporPath = formatVaporTypePath(nsName, aliasName, componentPrefix);

                if (normalizedPath) {
                    map[normalizedPath] = { type: aliasType, vaporPath };
                }

                // 항상 타입 이름으로도 키 추가 (fallback용)
                // 예: "CheckboxRoot.ChangeEventDetails" → "Checkbox.Root.ChangeEventDetails"
                map[`${nsName}.${aliasName}`] = { type: aliasType, vaporPath };
            }
        }
    }
}

/**
 * type alias가 @base-ui 패키지의 타입을 참조하는지 declaration source 기반으로 판별합니다.
 */
function isBaseUiTypeAlias(typeAlias: TypeAliasDeclaration): boolean {
    const aliasType = typeAlias.getType();

    // 심볼의 선언 위치가 @base-ui인지 확인
    const symbol = aliasType.getSymbol() ?? aliasType.getAliasSymbol();
    if (symbol) {
        for (const decl of symbol.getDeclarations()) {
            if (decl.getSourceFile().getFilePath().includes('@base-ui')) return true;
        }
    }

    // union/intersection 타입의 구성 타입 중 @base-ui에서 온 것이 있는지 확인
    if (aliasType.isUnion()) {
        return aliasType.getUnionTypes().some((t) => t.getText().includes('@base-ui'));
    }
    if (aliasType.isIntersection()) {
        return aliasType.getIntersectionTypes().some((t) => t.getText().includes('@base-ui'));
    }

    return false;
}

/**
 * 같은 파일의 namespace 목록에서 공통 component prefix를 추출합니다.
 *
 * 예: [DialogRoot, DialogTrigger, DialogPopup, ...] → "Dialog"
 * 예: [MultiSelectRoot, MultiSelectTrigger, ...] → "MultiSelect"
 * 예: [ToastProviderPrimitive, ToastPortalPrimitive, ...] → "Toast"
 */
export function findComponentPrefix(namespaces: ModuleDeclaration[]): string | null {
    const nsNames = namespaces.map((ns) => ns.getName());
    if (nsNames.length < 2) return null;

    // Strategy 1: 가장 짧은 *Root namespace에서 prefix 추출
    const rootNames = nsNames.filter((n) => n.endsWith('Root'));
    if (rootNames.length > 0) {
        rootNames.sort((a, b) => a.length - b.length);
        return rootNames[0].slice(0, -'Root'.length);
    }

    // Strategy 2: Common prefix (Root 없는 경우, 예: Toast)
    const pascalNames = nsNames.filter((n) => /^[A-Z]/.test(n));
    if (pascalNames.length < 2) return null;

    const sorted = [...pascalNames].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    let commonLen = 0;
    while (commonLen < first.length && commonLen < last.length && first[commonLen] === last[commonLen]) {
        commonLen++;
    }

    if (commonLen <= 1) return null;

    const prefix = first.substring(0, commonLen);

    // prefix 뒤의 문자가 모두 대문자인지 확인하여 PascalCase word boundary 검증
    const allValidBoundary = sorted.every(
        (name) =>
            name.length === prefix.length ||
            (name.length > prefix.length && name[prefix.length] >= 'A' && name[prefix.length] <= 'Z'),
    );

    if (allValidBoundary) return prefix;

    return null;
}

/**
 * 내부 namespace 이름을 외부 접근 가능한 경로로 변환합니다.
 * component prefix를 활용하여 정확하게 분리합니다.
 *
 * 예: ("DialogRoot", "ChangeEventDetails", "Dialog") → "Dialog.Root.ChangeEventDetails"
 * 예: ("SelectPositionerPrimitive", "Props", "Select") → "Select.PositionerPrimitive.Props"
 * 예: ("MultiSelectRoot", "ChangeEventDetails", "MultiSelect") → "MultiSelect.Root.ChangeEventDetails"
 */
export function formatVaporTypePath(
    nsName: string,
    typeName: string,
    componentPrefix: string | null,
): string {
    if (componentPrefix && nsName.startsWith(componentPrefix) && nsName.length > componentPrefix.length) {
        const partName = nsName.slice(componentPrefix.length);
        return `${componentPrefix}.${partName}.${typeName}`;
    }
    // prefix 없는 경우 원본 그대로
    return `${nsName}.${typeName}`;
}
