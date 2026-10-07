/**
 * Public names module
 *
 * The docs print a Base UI type by the name vapor-ui exports it under
 * (`Collapsible.Root.State`), not by Base UI's own. Base UI declares its types in a
 * namespace merged with a forwardRef component, and ts-morph reports no exports for
 * such symbols, so the names come from the other side: vapor-ui's namespaces re-declare
 * the Base UI types they expose (`type State = BaseCollapsible.Root.State`), and the
 * component's barrel says what each namespace is called publicly.
 */
import { isBaseUiPath } from '#read/source-classifier';
import type { Reporter } from '#reporter';
import path from 'node:path';
import {
    Node,
    type SourceFile,
    SyntaxKind,
    type Type,
    type TypeAliasDeclaration,
    TypeFormatFlags,
} from 'ts-morph';

export interface PublicNames {
    /**
     * The public vapor-ui name of `type`, or undefined. When several namespaces alias the
     * type, `namespace`'s name wins. Warns (once per type and namespace) when a Base UI
     * type the docs name has none.
     */
    nameOf(type: Type, namespace: string): string | undefined;
    /** The type behind a public vapor-ui name. */
    typeOf(name: string): Type | undefined;
}

interface PublicNameEntry {
    name: string;
    type: Type;
    /** The vapor-ui namespace that declares the alias, e.g. `CollapsibleRoot`. */
    namespace: string;
}

function isDeclaredInBaseUi(type: Type): boolean {
    return [type.getSymbol(), type.getAliasSymbol()].some((symbol) =>
        symbol
            ?.getDeclarations()
            .some((declaration) => isBaseUiPath(declaration.getSourceFile().getFilePath())),
    );
}

/**
 * Only types a component documents by name are worth a warning: Base UI's anonymous
 * event details and per-part `State`s. Shared helpers like `BaseUIEvent` or `HTMLProps`
 * have no vapor-ui alias by design and print under their own name. An object Base UI
 * writes straight into a parameter or a property (`(data: { anchor: { width } }) => …`)
 * has no name in Base UI either, so there is nothing to re-export.
 */
function shouldHavePublicName(type: Type): boolean {
    const symbol = type.getAliasSymbol() ?? type.getSymbol();
    const name = symbol?.getName();
    if (name === '__type') {
        return !symbol!.getDeclarations().every((decl) => {
            const parent = decl.getParent();
            return Node.isParameterDeclaration(parent) || Node.isPropertySignature(parent);
        });
    }
    return !!name?.endsWith('State');
}

/**
 * Exported namespace → its public path, read from the barrel next to the source file.
 * Compound: `index.ts` has `export * as Collapsible from './index.parts'` and
 * `index.parts.ts` has `export { CollapsibleRoot as Root }` → `Collapsible.Root`.
 * Standalone: a namespace is public under its own name.
 */
function readBarrel(sourceFile: SourceFile): Map<string, string> {
    const dir = path.dirname(sourceFile.getFilePath());
    const project = sourceFile.getProject();
    const names = new Map<string, string>();

    const indexFile = project.addSourceFileAtPathIfExists(path.join(dir, 'index.ts'));
    if (!indexFile) return names;

    const publicName = indexFile
        .getExportDeclarations()
        .find(
            (decl) =>
                decl.getModuleSpecifierValue()?.includes('index.parts') &&
                decl.getNamespaceExport(),
        )
        ?.getNamespaceExport()
        ?.getName();

    if (!publicName) {
        for (const ns of sourceFile.getDescendantsOfKind(SyntaxKind.ModuleDeclaration)) {
            if (ns.isExported()) names.set(ns.getName(), ns.getName());
        }
        return names;
    }

    const partsFile = project.addSourceFileAtPathIfExists(path.join(dir, 'index.parts.ts'));
    for (const decl of partsFile?.getExportDeclarations() ?? []) {
        for (const named of decl.getNamedExports()) {
            const internalName = named.getName();
            const partName = named.getAliasNode()?.getText() ?? internalName;
            names.set(internalName, `${publicName}.${partName}`);
        }
    }
    return names;
}

/**
 * A namespace alias the docs print by name: any Base UI type, or a `State` or
 * `ChangeEventDetails` vapor-ui declares itself (`interface CheckboxRootState extends
 * BaseCheckbox.Root.State`, Pagination's `MakeChangeEventDetails<'item-press'>`).
 * vapor-ui's other aliases (`Props`, a `Size` union, a `ChangeEventReason`) stay out:
 * matching by type identity would print a prop typed `'sm' | 'md'` as the alias name.
 */
const OWN_PUBLIC_ALIASES = new Set(['State', 'ChangeEventDetails']);

function isPublicAlias(alias: TypeAliasDeclaration): boolean {
    return OWN_PUBLIC_ALIASES.has(alias.getName()) || isDeclaredInBaseUi(alias.getType());
}

/** Every exported public alias in an exported namespace the barrel names. */
function collectPublicNames(sourceFile: SourceFile): PublicNameEntry[] {
    const barrel = readBarrel(sourceFile);

    return sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((ns) => ns.isExported() && barrel.has(ns.getName()))
        .flatMap((ns) =>
            ns
                .getTypeAliases()
                .filter((alias) => alias.isExported() && isPublicAlias(alias))
                .map((alias) => ({
                    name: `${barrel.get(ns.getName())}.${alias.getName()}`,
                    type: alias.getType(),
                    namespace: ns.getName(),
                })),
        );
}

export function createPublicNames(sourceFile: SourceFile, reporter: Reporter): PublicNames {
    const entries = collectPublicNames(sourceFile);
    const warned = new Set<string>();

    /**
     * Matched by type identity, not by name: TypeScript evaluates Base UI event details
     * into anonymous objects with no name to look up, and several namespaces can alias
     * one Base UI type (Collapsible Root and Trigger sharing a State).
     */
    function nameOf(type: Type, namespace: string): string | undefined {
        const matches = entries.filter((entry) => entry.type.compilerType === type.compilerType);
        const found = matches.find((entry) => entry.namespace === namespace) ?? matches[0];
        if (found) return found.name;

        if (isDeclaredInBaseUi(type) && shouldHavePublicName(type)) {
            // Read from the component file, so the text names the type as the docs would.
            const text = type.getText(
                sourceFile,
                TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | TypeFormatFlags.NoTruncation,
            );
            const key = `${namespace}\0${text}`;
            if (!warned.has(key)) {
                warned.add(key);
                reporter.warn(
                    `No public vapor-ui name for a Base UI type in ${namespace}; printing ${text}. Re-export it from the component namespace to print it by name.`,
                );
            }
        }
        return undefined;
    }

    function typeOf(name: string): Type | undefined {
        return entries.find((entry) => entry.name === name)?.type;
    }

    return { nameOf, typeOf };
}
