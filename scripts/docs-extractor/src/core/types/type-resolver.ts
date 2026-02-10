/**
 * 타입 Resolver 모듈
 *
 * ts-morph Type 객체를 실제 타입 문자열로 변환합니다.
 * import 경로 대신 실제 리터럴 값을 추출합니다.
 */
import { type Node, type Type, TypeFormatFlags } from 'ts-morph';

import {
    type BaseUiTypeMap,
    extractSimplifiedTypeName,
    resolveBaseUiType,
} from './base-ui-type-resolver';

/**
 * TypeFormatFlags 조합
 * - UseAliasDefinedOutsideCurrentScope: 외부 alias 이름 유지 (React.Ref → Ref)
 * - NoTruncation: 타입 잘림 방지
 * - WriteTypeArgumentsOfSignature: 제네릭 인수 유지
 */
const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

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
 * 함수 타입을 파싱하여 파라미터와 반환 타입을 재귀적으로 변환합니다.
 */
function resolveFunctionType(
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
): string | null {
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
            if (paramTypeText.includes('@base-ui')) {
                return `${paramName}: ${extractSimplifiedTypeName(paramTypeText)}`;
            }
            return `${paramName}: ${paramTypeText}`;
        }

        const paramType = param.getTypeAtLocation(node);

        // base-ui 타입인지 AST 기반으로 확인
        if (baseUiMap) {
            const vaporPath = resolveBaseUiType(paramType, baseUiMap);
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

        const resolvedParamType = resolveType(paramType, baseUiMap, contextNode);
        return `${paramName}: ${resolvedParamType}`;
    });

    // 반환 타입 변환
    const resolvedReturnType = resolveType(returnType, baseUiMap, contextNode);

    // 반환 타입이 유니온일 경우 괄호로 감싸서 splitTopLevelUnion에서 분리되지 않도록 함
    const needsParens = resolvedReturnType.includes(' | ');
    const wrappedReturn = needsParens ? `(${resolvedReturnType})` : resolvedReturnType;

    return `(${paramStrings.join(', ')}) => ${wrappedReturn}`;
}

/**
 * Ref<T> 타입을 감지하여 spread되지 않도록 유지합니다.
 * TypeScript 컴파일러가 Ref<T>를 union(RefCallback | RefObject | null)으로 풀어버리므로
 * getText() 결과에서 Ref 패턴을 감지하여 원본 형태로 유지합니다.
 *
 * @example
 * 'React.Ref<HTMLInputElement> | undefined' → 'Ref<HTMLInputElement>'
 * 'Ref<HTMLDivElement>' → 'Ref<HTMLDivElement>'
 */
function preserveRefType(typeText: string): string | null {
    const refMatch = typeText.match(/^(React\.)?Ref<([^>]+)>(\s*\|\s*undefined)?$/);
    if (refMatch) {
        return `Ref<${refMatch[2]}>`;
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

/**
 * Type resolver plugin interface.
 * 각 plugin은 특정 타입 패턴을 처리합니다.
 * chain 순서대로 실행되며, 첫 번째로 결과를 반환한 plugin이 우선합니다.
 */
export interface TypeResolverPlugin {
    name: string;
    resolve(ctx: TypeResolverContext): string | null;
}

export interface TypeResolverContext {
    type: Type;
    rawText: string;
    baseUiMap?: BaseUiTypeMap;
    contextNode?: Node;
}

// --- Built-in resolver plugins ---

const refTypeResolver: TypeResolverPlugin = {
    name: 'ref-type',
    resolve: ({ rawText }) => preserveRefType(rawText),
};

const reactAliasResolver: TypeResolverPlugin = {
    name: 'react-alias',
    resolve: ({ type }) => {
        const aliasSymbol = type.getAliasSymbol();
        if (aliasSymbol && PRESERVED_REACT_ALIASES.has(aliasSymbol.getName())) {
            return aliasSymbol.getName();
        }
        return null;
    },
};

const primitiveResolver: TypeResolverPlugin = {
    name: 'primitives',
    resolve: ({ type }) => {
        if (type.isBooleanLiteral()) return type.getText();
        if (type.isLiteral()) {
            const value = type.getLiteralValue();
            return typeof value === 'string' ? `"${value}"` : String(value);
        }
        if (type.isUndefined()) return 'undefined';
        if (type.isNull()) return 'null';
        if (type.isBoolean()) return 'boolean';
        if (type.isString()) return 'string';
        if (type.isNumber()) return 'number';
        return null;
    },
};

const reactElementResolver: TypeResolverPlugin = {
    name: 'react-element',
    resolve: ({ type }) => simplifyReactElementType(type),
};

const functionTypeResolver: TypeResolverPlugin = {
    name: 'function-type',
    resolve: ({ type, baseUiMap, contextNode }) => resolveFunctionType(type, baseUiMap, contextNode),
};

const baseUiTypeResolver: TypeResolverPlugin = {
    name: 'base-ui-type',
    resolve: ({ type, rawText, baseUiMap }) => {
        if (!rawText.includes('@base-ui')) return null;
        if (baseUiMap) {
            const vaporPath = resolveBaseUiType(type, baseUiMap);
            if (vaporPath) return vaporPath;
        }
        return simplifyNodeModulesImports(rawText);
    },
};

const importPathResolver: TypeResolverPlugin = {
    name: 'import-path',
    resolve: ({ rawText }) => {
        if (!rawText.includes('import(')) return null;
        return simplifyNodeModulesImports(rawText);
    },
};

/**
 * 기본 resolver chain. 순서가 결과에 영향을 줍니다.
 */
const DEFAULT_RESOLVER_CHAIN: TypeResolverPlugin[] = [
    refTypeResolver,
    reactAliasResolver,
    primitiveResolver,
    reactElementResolver,
    functionTypeResolver,
    baseUiTypeResolver,
    importPathResolver,
];

export function resolveType(type: Type, baseUiMap?: BaseUiTypeMap, contextNode?: Node): string {
    const rawText = contextNode ? type.getText(contextNode, TYPE_FORMAT_FLAGS) : type.getText();
    const ctx: TypeResolverContext = { type, rawText, baseUiMap, contextNode };

    for (const plugin of DEFAULT_RESOLVER_CHAIN) {
        const result = plugin.resolve(ctx);
        if (result !== null) return result;
    }

    // Fallback: ForwardRef/ReactElement generic 정리
    return simplifyReactElementGeneric(simplifyForwardRefType(rawText));
}

export function simplifyNodeModulesImports(typeText: string): string {
    return typeText.replace(/import\(["'].*?["']\)\./g, '');
}

/**
 * ReactElement의 두 번째 type parameter를 제거합니다.
 * TypeScript가 기본값을 자동으로 펼쳐서 출력하므로 이를 정리합니다.
 *
 * @example
 * 'ReactElement<X.Props, string | React.JSXElementConstructor<any>>' → 'ReactElement<X.Props>'
 * 'ReactElement<ComplexType<T>, string | React.JSXElementConstructor<any>>' → 'ReactElement<ComplexType<T>>'
 */
export function simplifyReactElementGeneric(typeText: string): string {
    // 두 번째 인자 패턴만 제거 (첫 번째 인자는 복잡한 중첩 타입일 수 있음)
    return typeText.replace(/,\s*string \| React\.JSXElementConstructor<any>>/g, '>');
}

/**
 * ForwardRefExoticComponent 타입을 Props로 단순화합니다.
 * typeof ComponentName이 ForwardRefExoticComponent<...Props...>로 확장되는 것을 방지합니다.
 *
 * @example
 * 'React.ForwardRefExoticComponent<Omit<X.Props, "ref"> & React.RefAttributes<HTMLDivElement>>' → 'X.Props'
 * 'ReactElement<React.ForwardRefExoticComponent<...>>' → 'ReactElement<X.Props>'
 */
export function simplifyForwardRefType(typeText: string): string {
    return typeText.replace(
        /React\.ForwardRefExoticComponent<Omit<([^,]+\.Props), "ref"> & React\.RefAttributes<[^>]+>>/g,
        '$1',
    );
}
