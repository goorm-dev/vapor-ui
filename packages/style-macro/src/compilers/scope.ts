import type { AnyProp } from '~/models/types';

/**
 * `name` 을 `ancestors`(top-down 조상 체인) 위치에서 참조할 때, 모듈 스코프가 아닌 바깥 스코프
 * 중 하나가 같은 이름을 선언해 모듈 바인딩을 가리는지.
 *
 * ES 모듈은 strict mode 라 `with`·sloppy 블록 함수가 없어, 스코프는 문법만으로 정해진다.
 * 이 체인 위의 스코프 노드만 보면 된다 — 참조 위치를 포함하지 않는 스코프의 선언은 그 위치에
 * 보이지 않는다. 선언이 참조보다 뒤에 있어도(TDZ) 같은 스코프면 가린다.
 */
export function isShadowed(name: string, ancestors: readonly AnyProp[]): boolean {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const node = ancestors[i];
        if (node?.type === 'Program') return false;
        if (declares(node, name)) return true;
    }
    return false;
}

function declares(node: AnyProp, name: string): boolean {
    switch (node?.type) {
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
            // 함수 이름은 선언이면 바깥 스코프(아래 블록 검사)에, 표현식이면 자기 스코프에 묶인다.
            if (node.type === 'FunctionExpression' && node.id?.name === name) return true;
            return paramsOf(node).some((p) => patternHas(p, name)) || varHoisted(node.body, name);
        case 'ClassExpression':
            return node.id?.name === name;
        case 'BlockStatement':
        case 'StaticBlock':
            return statementsDeclare(node.body, name);
        case 'SwitchStatement':
            return node.cases.some((c: AnyProp) => statementsDeclare(c.consequent, name));
        case 'ForStatement':
            return lexicalDeclares(node.init, name);
        case 'ForInStatement':
        case 'ForOfStatement':
            return lexicalDeclares(node.left, name);
        case 'CatchClause':
            return patternHas(node.param, name);
        default:
            return false;
    }
}

function paramsOf(fn: AnyProp): AnyProp[] {
    const params = Array.isArray(fn.params) ? fn.params : (fn.params?.items ?? []);
    return fn.params?.rest ? [...params, fn.params.rest] : params;
}

/** 블록 직속 문장이 `let`/`const`/`class`/함수 선언으로 이름을 묶는지. */
function statementsDeclare(statements: AnyProp[] | undefined, name: string): boolean {
    for (const s of statements ?? []) {
        if (lexicalDeclares(s, name)) return true;
        if (
            (s?.type === 'FunctionDeclaration' || s?.type === 'ClassDeclaration') &&
            s.id?.name === name
        ) {
            return true;
        }
    }
    return false;
}

function lexicalDeclares(decl: AnyProp, name: string): boolean {
    return (
        decl?.type === 'VariableDeclaration' &&
        decl.kind !== 'var' &&
        decl.declarations.some((d: AnyProp) => patternHas(d.id, name))
    );
}

/** 함수 본문 어디서든(중첩 함수 제외) `var` 로 선언되면 함수 스코프 전체에 묶인다. */
function varHoisted(node: AnyProp, name: string): boolean {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some((n) => varHoisted(n, name));
    if (typeof node.type !== 'string') return false;
    if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'ClassDeclaration' ||
        node.type === 'ClassExpression'
    ) {
        return false;
    }
    if (
        node.type === 'VariableDeclaration' &&
        node.kind === 'var' &&
        node.declarations.some((d: AnyProp) => patternHas(d.id, name))
    ) {
        return true;
    }
    for (const key of Object.keys(node)) {
        if (key === 'loc' || key === 'range' || key === 'type') continue;
        const child = node[key];
        if (child && typeof child === 'object' && varHoisted(child, name)) return true;
    }
    return false;
}

/** 바인딩 패턴(`a`, `{ a }`, `[a]`, `a = 1`, `...a`, TS parameter property)이 이름을 묶는지. */
export function patternHas(node: AnyProp, name: string): boolean {
    if (!node) return false;
    switch (node.type) {
        case 'Identifier':
            return node.name === name;
        case 'ObjectPattern':
            return (node.properties ?? []).some((p: AnyProp) =>
                patternHas(p.type === 'RestElement' ? p.argument : p.value, name),
            );
        case 'ArrayPattern':
            return (node.elements ?? []).some((e: AnyProp) => patternHas(e, name));
        case 'AssignmentPattern':
            return patternHas(node.left, name);
        case 'RestElement':
            return patternHas(node.argument, name);
        case 'TSParameterProperty':
            return patternHas(node.parameter, name);
        default:
            return false;
    }
}
