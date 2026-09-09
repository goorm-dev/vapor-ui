import type {
    ArrowFunctionExpression,
    CallExpression,
    JSXElement,
    Node,
    ObjectExpression,
    ObjectProperty,
    Program,
    Statement,
    VariableDeclarator,
} from '@oxc-project/types';
import MagicString from 'magic-string';
import path from 'node:path';
import type { RolldownPlugin } from 'rolldown';

const SLOT_ATTR = 'data-slots';
const PRIMITIVE_SUFFIX = 'Primitive';
const DEFAULT_INCLUDE = /\/src\/components\/.+\.tsx$/;
// Filename variant has no `.displayName` marker; gate on component shape.
const COMPONENT_MARKER = /\b(forwardRef|useRenderElement)\b/;
const HOC_CALLEES = new Set(['forwardRef', 'memo']);
const NESTED_SCOPE = new Set([
    'ArrowFunctionExpression',
    'FunctionExpression',
    'FunctionDeclaration',
    'ObjectMethod',
    'ClassMethod',
    'ClassPrivateMethod',
]);
const AST_META_KEYS = new Set([
    'type',
    'start',
    'end',
    'range',
    'loc',
    'parent',
    'leadingComments',
    'trailingComments',
    'innerComments',
    'comments',
    'directives',
    'tokens',
    'extra',
]);

interface Options {
    include?: RegExp;
}

export const dataSlots = ({ include = DEFAULT_INCLUDE }: Options = {}): RolldownPlugin => ({
    name: 'vapor-data-slots-filename',
    transform: {
        filter: {
            id: include,
            code: COMPONENT_MARKER,
        },
        handler(code, id) {
            const namespace = deriveNamespace(id);
            if (!namespace) return null;

            const program = this.parse(code, { lang: 'tsx' });
            const declarators = collectDeclarators(program);
            if (declarators.size === 0) return null;

            const magic = new MagicString(code);
            let touched = false;

            for (const [name, declarator] of declarators) {
                const slot = deriveSlot(namespace, name);
                if (!slot) continue;

                const fn = resolveCallback(declarator);
                if (!fn) continue;

                if (inject(fn, slot, magic)) touched = true;
            }

            if (!touched) return null;
            return {
                code: magic.toString(),
                map: magic.generateMap({ hires: true, source: id }),
            };
        },
    },
});

/* -----------------------------------------------------------------------------------------------*/

/** Extract namespace from an absolute tsx path. `radio-group.tsx` → `RadioGroup`. */
function deriveNamespace(id: string): string | null {
    const base = path.basename(id).replace(/\.tsx$/, '');
    return pascalize(base);
}

/** kebab-case → PascalCase. Handles `-` and `_` boundaries. */
function pascalize(input: string): string | null {
    const segments = input.split(/[-_]+/).filter(Boolean);
    if (segments.length === 0) return null;
    return segments.map((seg) => seg[0].toUpperCase() + seg.slice(1)).join('');
}

/** Derive slot from `namespace` and top-level variable `name`.
 *
 *  Convention: variable MUST start with `namespace`. `rest` is the tail after
 *  namespace. Trailing `Primitive` is stripped from `rest`. When `rest` is
 *  empty (standalone with variable name === namespace) the slot is just the
 *  namespace. Otherwise `${namespace}.${rest}`.
 *
 *  Variables not starting with namespace are skipped — probably internal
 *  helpers, not public parts.
 *
 *  Examples (namespace='Dialog'):
 *    DialogRoot              → Dialog.Root
 *    DialogPortalPrimitive   → Dialog.Portal
 *    Dialog                  → Dialog
 *    someHelper              → null (skip) */
function deriveSlot(namespace: string, name: string): string | null {
    if (!name.startsWith(namespace)) return null;

    const rest = stripPrimitiveSuffix(name.slice(namespace.length));
    return rest ? `${namespace}.${rest}` : namespace;
}

/** Strip trailing `Primitive` unless the string equals `Primitive`. */
function stripPrimitiveSuffix(rest: string): string {
    if (!rest.endsWith(PRIMITIVE_SUFFIX)) return rest;
    if (rest === PRIMITIVE_SUFFIX) return rest;
    return rest.slice(0, -PRIMITIVE_SUFFIX.length);
}

/* -----------------------------------------------------------------------------------------------*/

function collectDeclarators(program: Program): Map<string, VariableDeclarator> {
    const declarators = new Map<string, VariableDeclarator>();
    for (const item of program.body) {
        const stmt = unwrapExport(item as Statement);
        if (stmt.type === 'VariableDeclaration') {
            for (const decl of stmt.declarations) {
                if (decl.id.type === 'Identifier') declarators.set(decl.id.name, decl);
            }
        }
    }
    return declarators;
}

function unwrapExport(item: Statement): Statement {
    if (item.type === 'ExportNamedDeclaration' && item.declaration) {
        return item.declaration as Statement;
    }
    return item;
}

/* -----------------------------------------------------------------------------------------------*/

type Callback = ArrowFunctionExpression;

function resolveCallback(decl: VariableDeclarator): Callback | null {
    const init = decl.init;
    if (!init) return null;
    if (init.type === 'ArrowFunctionExpression') return init;
    if (init.type !== 'CallExpression') return null;

    const callee = init.callee;
    const calleeName =
        callee.type === 'Identifier'
            ? callee.name
            : callee.type === 'MemberExpression' &&
                !callee.computed &&
                callee.property.type === 'Identifier'
              ? callee.property.name
              : null;

    if (!calleeName || !HOC_CALLEES.has(calleeName)) return null;

    const first = init.arguments[0];
    return first && first.type === 'ArrowFunctionExpression' ? first : null;
}

/* -----------------------------------------------------------------------------------------------*/

type RefCarrier = { kind: 'jsx'; element: JSXElement } | { kind: 'render'; call: CallExpression };

function inject(fn: Callback, slot: string, magic: MagicString): boolean {
    const carriers = collectRefCarriers(fn);
    if (carriers.length !== 1) return false;

    const target = carriers[0];
    return target.kind === 'jsx'
        ? injectJsxAttribute(target.element, slot, magic)
        : injectIntoRenderElement(target.call, slot, magic);
}

function collectRefCarriers(fn: Callback): RefCarrier[] {
    const carriers: RefCarrier[] = [];
    walkScope(fn.body, (node) => {
        if (node.type === 'JSXElement') {
            if (jsxHasRefAttribute(node)) carriers.push({ kind: 'jsx', element: node });
            return;
        }
        if (
            node.type === 'CallExpression' &&
            isUseRenderElementCall(node) &&
            renderOptionsHaveRef(node)
        ) {
            carriers.push({ kind: 'render', call: node });
        }
    });
    return carriers;
}

function isUseRenderElementCall(call: CallExpression): boolean {
    return call.callee.type === 'Identifier' && call.callee.name === 'useRenderElement';
}

function jsxHasRefAttribute(element: JSXElement): boolean {
    for (const attr of element.openingElement.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attr.name.type === 'JSXIdentifier' && attr.name.name === 'ref') return true;
    }
    return false;
}

function renderOptionsHaveRef(call: CallExpression): boolean {
    const arg = call.arguments[0];
    if (!arg || arg.type !== 'ObjectExpression') return false;
    for (const property of arg.properties) {
        if (property.type !== 'Property' || property.computed) continue;
        const key = property.key;
        if (key.type === 'Identifier' && key.name === 'ref') return true;
        if (key.type === 'Literal' && key.value === 'ref') return true;
    }
    return false;
}

/* -----------------------------------------------------------------------------------------------*/

function injectJsxAttribute(element: JSXElement, slot: string, magic: MagicString): boolean {
    magic.appendLeft(element.openingElement.name.end, ` ${SLOT_ATTR}="${slot}"`);
    return true;
}

/* -----------------------------------------------------------------------------------------------*/

function injectIntoRenderElement(call: CallExpression, slot: string, magic: MagicString): boolean {
    const arg = call.arguments[0];
    if (!arg || arg.type !== 'ObjectExpression') return false;

    const propsProperty = findProperty(arg, 'props');
    if (!propsProperty) {
        return insertAtObjectHead(arg, `props: { '${SLOT_ATTR}': '${slot}' }`, magic);
    }
    if (propsProperty.shorthand) return false;

    const value = propsProperty.value;
    if (value.type === 'ObjectExpression') {
        return insertAtObjectHead(value, `'${SLOT_ATTR}': '${slot}'`, magic);
    }

    magic.appendLeft(value.start, `{ '${SLOT_ATTR}': '${slot}', ...(`);
    magic.appendRight(value.end, `) }`);
    return true;
}

function findProperty(obj: ObjectExpression, name: string): ObjectProperty | null {
    for (const property of obj.properties) {
        if (property.type !== 'Property' || property.computed) continue;
        const key = property.key;
        if (key.type === 'Identifier' && key.name === name) return property;
        if (key.type === 'Literal' && key.value === name) return property;
    }
    return null;
}

function insertAtObjectHead(obj: ObjectExpression, entry: string, magic: MagicString): boolean {
    const opener = obj.start + 1;
    const suffix = obj.properties.length > 0 ? ',' : ' ';
    magic.appendRight(opener, ` ${entry}${suffix} `);
    return true;
}

/* -----------------------------------------------------------------------------------------------*/

function walkScope(root: Node, visit: (node: Node) => void): void {
    const stack: unknown[] = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        if (Array.isArray(current)) {
            for (let i = current.length - 1; i >= 0; i--) stack.push(current[i]);
            continue;
        }
        if (!current || typeof current !== 'object') continue;
        const node = current as Node;
        if (typeof node.type !== 'string') continue;
        if (node !== root && NESTED_SCOPE.has(node.type)) continue;

        visit(node);

        if (node.type === 'JSXElement') {
            const jsx = node as JSXElement;
            if (jsx.openingElement) stack.push(jsx.openingElement);
            if (!jsxHasRefAttribute(jsx)) stack.push(jsx.children);
            continue;
        }

        for (const key of Object.keys(node)) {
            if (AST_META_KEYS.has(key)) continue;
            stack.push((node as unknown as Record<string, unknown>)[key]);
        }
    }
}
