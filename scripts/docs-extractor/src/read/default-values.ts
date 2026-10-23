import { isBaseUiPath } from '#read/source-classifier';
import { Node, SyntaxKind, type Symbol as TsSymbol, type VariableDeclaration, ts } from 'ts-morph';

type DefaultValues = Record<string, string>;

/** A literal reads as its value, and so does a name that refers to one (`step = RESIZE_STEP` → `16`). */
function valueText(node: Node): string {
    if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
        return node.getLiteralText();
    }

    if (Node.isIdentifier(node) || Node.isPropertyAccessExpression(node)) {
        const type = node.getType();
        if (type.isStringLiteral() || type.isNumberLiteral()) return String(type.getLiteralValue());
        if (type.isBooleanLiteral()) return type.getText();
    }

    return node.getText();
}

function extractDestructuringDefaults(componentImplementation: VariableDeclaration): DefaultValues {
    const result: DefaultValues = {};

    componentImplementation.getInitializer()?.forEachDescendant((node) => {
        if (!node.isKind(SyntaxKind.BindingElement)) return;

        const initNode = node.getInitializer();
        if (!initNode) return;

        const nameNode = node.getNameNode();
        if (!nameNode.isKind(SyntaxKind.Identifier)) return;

        const propertyNameNode = node.getPropertyNameNode();
        const name = propertyNameNode?.isKind(SyntaxKind.Identifier)
            ? propertyNameNode.getText()
            : propertyNameNode?.isKind(SyntaxKind.StringLiteral)
              ? propertyNameNode.getLiteralText()
              : nameNode.getText();

        if (name in result) return;

        result[name] = valueText(initNode);
    });

    return result;
}

/**
 * One entry of a JSX element's attributes or of an object literal, in source order.
 * `literal` is set when the value is written as a literal; any other value leaves it unset.
 */
type PropsEntry = { name: string; literal?: string } | { spread: Node };

function literalText(value: Node | undefined): string | undefined {
    if (
        Node.isStringLiteral(value) ||
        Node.isNoSubstitutionTemplateLiteral(value) ||
        Node.isNumericLiteral(value) ||
        Node.isTrueLiteral(value) ||
        Node.isFalseLiteral(value) ||
        Node.isNullLiteral(value)
    ) {
        return valueText(value);
    }

    return undefined;
}

function readPropsEntries(node: Node): PropsEntry[] | undefined {
    if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
        return node.getAttributes().map((attribute): PropsEntry => {
            if (Node.isJsxSpreadAttribute(attribute)) return { spread: attribute.getExpression() };

            const name = attribute.getNameNode().getText();
            const initializer = attribute.getInitializer();
            // `<Trigger nativeButton />` is `nativeButton={true}`.
            if (!initializer) return { name, literal: 'true' };

            const value = Node.isJsxExpression(initializer)
                ? initializer.getExpression()
                : initializer;
            return { name, literal: literalText(value) };
        });
    }

    if (Node.isObjectLiteralExpression(node)) {
        return node.getProperties().map((property): PropsEntry => {
            if (Node.isSpreadAssignment(property)) return { spread: property.getExpression() };

            const nameNode = property.getNameNode();
            const name = Node.isStringLiteral(nameNode)
                ? nameNode.getLiteralText()
                : nameNode.getText();
            const value = Node.isPropertyAssignment(property)
                ? property.getInitializer()
                : undefined;
            return { name, literal: literalText(value) };
        });
    }

    return undefined;
}

/** Whether spreading `expression` passes the prop itself on, judged by a shared declaration. */
function spreadCarries(expression: Node, symbol: TsSymbol): boolean {
    const declarations = new Set(symbol.getDeclarations().map((node) => node.compilerNode));

    return (
        expression
            .getType()
            .getProperty(symbol.getName())
            ?.getDeclarations()
            .some((node) => declarations.has(node.compilerNode)) ?? false
    );
}

/**
 * What the implementation itself writes for the prop where it passes the props on:
 * - `default`: a literal before a spread that carries the prop, so the caller can still override it
 *   (`<Positioner positionMethod="fixed" {...props} />`).
 * - `set`: any other value it writes there, or a value after the spread that the caller can't override.
 *   The prop no longer behaves as declared, so a declared default no longer applies.
 */
type WrittenValue = { kind: 'default'; value: string } | { kind: 'set' } | undefined;

function createWrittenValueReader(componentImplementation: VariableDeclaration) {
    const entryLists: PropsEntry[][] = [];
    componentImplementation.getInitializer()?.forEachDescendant((node) => {
        const entries = readPropsEntries(node);
        if (entries?.some((entry) => 'spread' in entry)) entryLists.push(entries);
    });

    return (symbol: TsSymbol): WrittenValue => {
        const name = symbol.getName();
        let result: WrittenValue;

        for (const entries of entryLists) {
            if (!entries.some((entry) => 'name' in entry && entry.name === name)) continue;

            let lastCarrier = -1;
            for (const [index, entry] of entries.entries()) {
                if ('spread' in entry && spreadCarries(entry.spread, symbol)) lastCarrier = index;
            }
            if (lastCarrier === -1) continue;

            for (const [index, entry] of entries.entries()) {
                if (!('name' in entry) || entry.name !== name) continue;
                if (index > lastCarrier || entry.literal === undefined) return { kind: 'set' };
                result ??= { kind: 'default', value: entry.literal };
            }
        }

        return result;
    };
}

/**
 * `defaultVariants` of the `recipe()` / `componentRecipe()` whose `variants` declares the prop.
 * Following the declaration, not the recipe the component calls, reaches a default that a root
 * passes to its parts through context.
 */
function getDeclaringRecipeDefault(symbol: TsSymbol): string | undefined {
    const values = new Set<string | undefined>();

    for (const declaration of symbol.getDeclarations()) {
        if (!Node.isPropertyAssignment(declaration)) continue;

        const variantsProperty = declaration
            .getParentIfKind(SyntaxKind.ObjectLiteralExpression)
            ?.getParentIfKind(SyntaxKind.PropertyAssignment);
        if (variantsProperty?.getName() !== 'variants') continue;

        const config = variantsProperty.getParentIfKind(SyntaxKind.ObjectLiteralExpression);
        const callee = config
            ?.getParentIfKind(SyntaxKind.CallExpression)
            ?.getExpression()
            .getText();
        if (!config || (callee !== 'recipe' && callee !== 'componentRecipe')) continue;

        const defaultValue = config
            .getProperty('defaultVariants')
            ?.asKind(SyntaxKind.PropertyAssignment)
            ?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
            ?.getProperty(declaration.getName())
            ?.asKind(SyntaxKind.PropertyAssignment)
            ?.getInitializer();

        values.add(defaultValue && valueText(defaultValue));
    }

    // Recipes that declare the same variant with different defaults have no single answer.
    return values.size === 1 ? [...values][0] : undefined;
}

/**
 * The `@default` tag on Base UI's own declaration of the prop. A vapor-ui interface that re-declares
 * the prop to document it hides that declaration, so the interface's base types are searched too.
 * `undefined` means no default.
 */
function getBaseUiDefaultTag(symbol: TsSymbol): string | undefined {
    for (const declaration of symbol.getDeclarations()) {
        if (!isBaseUiPath(declaration.getSourceFile().getFilePath())) {
            const owner = declaration.getParentIfKind(SyntaxKind.InterfaceDeclaration);
            for (const base of owner?.getBaseTypes() ?? []) {
                const inherited = base.getProperty(symbol.getName());
                const text = inherited && getBaseUiDefaultTag(inherited);
                if (text) return text;
            }
            continue;
        }

        for (const tag of ts.getJSDocTags(declaration.compilerNode)) {
            if (tag.tagName.text !== 'default') continue;

            const text = ts
                .getTextOfJSDocComment(tag.comment)
                ?.trim()
                .replace(/^(['"`])(.*)\1$/s, '$2');
            if (text && text !== 'undefined') return text;
        }
    }

    return undefined;
}

/** README "Default values": the first source that has a value wins. */
export function createDefaultValueReader(componentImplementation: VariableDeclaration | undefined) {
    const destructuringDefaults = componentImplementation
        ? extractDestructuringDefaults(componentImplementation)
        : {};
    const readWrittenValue = componentImplementation
        ? createWrittenValueReader(componentImplementation)
        : () => undefined;

    return (symbol: TsSymbol): string | undefined => {
        const name = symbol.getName();
        if (name in destructuringDefaults) return destructuringDefaults[name];

        const written = readWrittenValue(symbol);
        if (written?.kind === 'default') return written.value;

        return (
            getDeclaringRecipeDefault(symbol) ??
            (written?.kind === 'set' ? undefined : getBaseUiDefaultTag(symbol))
        );
    };
}
