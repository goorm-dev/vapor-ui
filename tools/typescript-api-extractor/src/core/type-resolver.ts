/**
 * 타입 Resolver 모듈
 *
 * ts-morph Type 객체를 실제 타입 문자열로 변환합니다.
 * import 경로 대신 실제 리터럴 값을 추출합니다.
 */
import type { Type } from 'ts-morph';

import {
    type BaseUiTypeMap,
    extractSimplifiedTypeName,
    resolveBaseUiType,
} from './base-ui-type-resolver';

function extractPropsName(typeText: string): string | null {
    // Omit<...ComponentName.Props, "ref"> 패턴에서 Props 이름 추출
    const match = typeText.match(/["']([^"']+)["']\)\.(\w+)\.Props/);
    if (match) {
        return `${match[2]}.Props`;
    }
    return null;
}

function simplifyReactElementType(type: Type): string | null {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    if (!symbol) return null;

    const name = symbol.getName();
    if (name !== 'ReactElement') return null;

    const typeArgs = type.getTypeArguments();
    if (typeArgs.length === 0) return 'ReactElement';

    const innerType = typeArgs[0];
    const innerText = innerType.getText();

    // ForwardRefExoticComponent 패턴 확인
    if (innerText.includes('ForwardRefExoticComponent')) {
        const propsName = extractPropsName(innerText);
        if (propsName) {
            return `ReactElement<${propsName}>`;
        }
    }

    return 'ReactElement';
}

/**
 * 타입의 원본 alias 텍스트를 가져옵니다.
 * type alias가 있으면 declaration에서 원본 타입 텍스트를 추출합니다.
 */
function getOriginalTypeText(type: Type): string | null {
    const aliasSymbol = type.getAliasSymbol();
    if (aliasSymbol) {
        const declarations = aliasSymbol.getDeclarations();

        if (declarations.length > 0) {
            const decl = declarations[0];
            const filePath = decl.getSourceFile().getFilePath();

            // base-ui 파일에 선언된 타입인 경우
            if (filePath.includes('@base-ui-components')) {
                // import("...").Namespace.TypeName 형태로 반환
                return type.getText();
            }
        }
    }
    return null;
}

/**
 * 함수 타입을 파싱하여 파라미터와 반환 타입을 재귀적으로 변환합니다.
 */
function resolveFunctionType(type: Type, baseUiMap?: BaseUiTypeMap): string | null {
    const callSignatures = type.getCallSignatures();
    if (callSignatures.length === 0) return null;

    // 첫 번째 call signature 사용
    const signature = callSignatures[0];
    const params = signature.getParameters();
    const returnType = signature.getReturnType();

    // 파라미터 타입 변환
    const paramStrings = params.map((param) => {
        const paramName = param.getName();
        const declarations = param.getDeclarations();

        // declaration이 없으면 valueDeclaration 사용
        const node = declarations[0] ?? param.getValueDeclaration();
        if (!node) {
            // fallback: 타입 텍스트에서 단순화
            const paramTypeText = param.getTypeAtLocation(signature.getDeclaration()!).getText();
            if (paramTypeText.includes('@base-ui-components')) {
                return `${paramName}: ${extractSimplifiedTypeName(paramTypeText)}`;
            }
            return `${paramName}: ${paramTypeText}`;
        }

        const paramType = param.getTypeAtLocation(node);

        // 먼저 원본 타입이 base-ui alias인지 확인
        const originalText = getOriginalTypeText(paramType);
        if (originalText && baseUiMap) {
            const vaporPath = resolveBaseUiType(originalText, baseUiMap);
            if (vaporPath) {
                return `${paramName}: ${vaporPath}`;
            }
        }

        // alias가 없는 경우, 파라미터 선언에서 타입 이름을 추출하여 매핑 시도
        if (baseUiMap && !paramType.getAliasSymbol()) {
            const paramDecls = param.getDeclarations();
            if (paramDecls.length > 0) {
                const declText = paramDecls[0].getText();
                // "eventDetails: ChangeEventDetails" 패턴에서 타입 이름 추출
                const typeMatch = declText.match(/:\s*(\w+)$/);
                if (typeMatch) {
                    const typeName = typeMatch[1];
                    // baseUiMap에서 이 타입 이름으로 끝나는 키 찾기
                    const matchingKey = Object.keys(baseUiMap).find((key) =>
                        key.endsWith(`.${typeName}`),
                    );
                    if (matchingKey) {
                        return `${paramName}: ${baseUiMap[matchingKey].vaporPath}`;
                    }
                }
            }
        }

        const resolvedParamType = resolveType(paramType, baseUiMap);
        return `${paramName}: ${resolvedParamType}`;
    });

    // 반환 타입 변환
    const resolvedReturnType = resolveType(returnType, baseUiMap);

    // 반환 타입이 유니온일 경우 괄호로 감싸서 splitTopLevelUnion에서 분리되지 않도록 함
    const needsParens = resolvedReturnType.includes(' | ');
    const wrappedReturn = needsParens ? `(${resolvedReturnType})` : resolvedReturnType;

    return `(${paramStrings.join(', ')}) => ${wrappedReturn}`;
}

/**
 * React.Ref<T> 타입을 텍스트에서 감지하여 단순화합니다.
 * 예: React.Ref<HTMLInputElement> | undefined → React.Ref<HTMLInputElement>
 */
function simplifyReactRefType(typeText: string): string | null {
    // React.Ref<...> 패턴 매칭
    const refMatch = typeText.match(/React\.Ref<([^>]+)>/);
    if (refMatch) {
        return `React.Ref<${refMatch[1]}>`;
    }
    return null;
}

// spread하지 않고 유지할 React 타입 alias 목록
const PRESERVED_REACT_ALIASES = new Set([
    'ReactNode',
    'ReactElement',
    'ReactChild',
    'ReactFragment',
]);

export function resolveType(type: Type, baseUiMap?: BaseUiTypeMap): string {
    // 먼저 원본 타입 텍스트 확인
    const rawText = type.getText();

    // React.Ref<T> 타입은 확장하지 않고 유지
    const reactRef = simplifyReactRefType(rawText);
    if (reactRef) return reactRef;

    // Union 타입 처리 전에 alias 확인 (ReactNode 등은 spread하지 않음)
    const aliasSymbol = type.getAliasSymbol();
    if (aliasSymbol) {
        const aliasName = aliasSymbol.getName();
        if (PRESERVED_REACT_ALIASES.has(aliasName)) {
            return aliasName;
        }
    }

    // Union 타입 처리
    if (type.isUnion()) {
        const unionTypes = type.getUnionTypes();
        const resolvedTypes = unionTypes.map((t) => resolveType(t, baseUiMap));

        // true | false → boolean으로 합치기
        const hasTrue = resolvedTypes.includes('true');
        const hasFalse = resolvedTypes.includes('false');
        if (hasTrue && hasFalse) {
            const filtered = resolvedTypes.filter((t) => t !== 'true' && t !== 'false');
            filtered.push('boolean');
            return filtered.join(' | ');
        }

        return resolvedTypes.join(' | ');
    }

    if (type.isBooleanLiteral()) {
        return type.getText();
    }

    if (type.isLiteral()) {
        const value = type.getLiteralValue();
        return typeof value === 'string' ? `"${value}"` : String(value);
    }

    if (type.isUndefined()) return 'undefined';
    if (type.isNull()) return 'null';
    if (type.isBoolean()) return 'boolean';
    if (type.isString()) return 'string';
    if (type.isNumber()) return 'number';

    // ReactElement<ComplexType> 단순화
    const simplified = simplifyReactElementType(type);
    if (simplified) return simplified;

    // 함수 타입 처리 (base-ui 타입 포함 여부와 관계없이)
    const functionResult = resolveFunctionType(type, baseUiMap);
    if (functionResult) return functionResult;

    // base-ui 타입 변환
    if (rawText.includes('@base-ui-components')) {
        if (baseUiMap) {
            const vaporPath = resolveBaseUiType(rawText, baseUiMap);
            if (vaporPath) return vaporPath;
        }
        // Fallback: 모든 import 경로를 단순화된 이름으로 대체
        return simplifyNodeModulesImports(rawText);
    }

    // @floating-ui 등 다른 node_modules import 경로 단순화
    if (rawText.includes('import(')) {
        return simplifyNodeModulesImports(rawText);
    }

    return rawText;
}

/**
 * 타입 문자열에서 node_modules import 경로를 단순화된 이름으로 대체합니다.
 * 예: import(".../@base-ui-components/.../types").HTMLProps<any> → HTMLProps<any>
 * 예: import(".../@floating-ui/dom/...").VirtualElement → VirtualElement
 */
function simplifyNodeModulesImports(typeText: string): string {
    // import("...").TypeName 또는 import("...").TypeName<...> 패턴 매칭
    return typeText.replace(/import\([^)]+\)\.(\w+)/g, '$1');
}
