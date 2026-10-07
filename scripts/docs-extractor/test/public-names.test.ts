/**
 * Public names tests
 *
 * The module is asked two things: the public vapor-ui name of a Type, and the Type
 * behind a public name. Each test writes a component, its barrel and a stand-in Base UI
 * declaration (any path with `@base-ui` in it counts) into an in-memory project.
 */
import { createPublicNames } from '#read/public-names';
import type { Reporter } from '#reporter';
import { Project } from 'ts-morph';

const BASE_UI = `
export namespace BaseCollapsibleRoot {
    export type State = { open: boolean };
}
export namespace BaseCollapsiblePanel {
    export type State = { hidden: boolean };
}
export type OnResize = (data: { width: number }) => void;
export type Anchor = { rect: { width: number } };
`;

const COMPONENT = `
import type { BaseCollapsibleRoot } from '../../node_modules/@base-ui/react/collapsible';

export namespace CollapsibleRoot {
    export type State = BaseCollapsibleRoot.State;
}
export namespace CollapsibleTrigger {
    export type State = BaseCollapsibleRoot.State;
}
`;

const COMPOUND_BARREL = {
    '/src/collapsible/index.ts': `export * as Collapsible from './index.parts';`,
    '/src/collapsible/index.parts.ts': `export { CollapsibleRoot as Root, CollapsibleTrigger as Trigger } from './collapsible';`,
};

function setup(barrel: Record<string, string>, component = COMPONENT) {
    const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true } });
    const base = project.createSourceFile('/node_modules/@base-ui/react/collapsible.ts', BASE_UI);
    for (const [path, text] of Object.entries(barrel)) project.createSourceFile(path, text);
    const file = project.createSourceFile('/src/collapsible/collapsible.tsx', component);

    const warnings: string[] = [];
    const reporter: Reporter = {
        info: () => {},
        debug: () => {},
        warn: (message) => {
            warnings.push(message);
        },
    };
    const stateOf = (namespace: string) =>
        base.getModuleOrThrow(namespace).getTypeAliasOrThrow('State').getType();

    return { names: createPublicNames(file, reporter), base, stateOf, warnings };
}

it('names a Base UI type by its compound barrel path', () => {
    const { names, stateOf } = setup(COMPOUND_BARREL);
    const state = stateOf('BaseCollapsibleRoot');

    expect(names.nameOf(state, 'CollapsibleRoot')).toBe('Collapsible.Root.State');
    expect(names.typeOf('Collapsible.Root.State')).toBe(state);
});

it('names a Base UI type by its namespace when the barrel has no parts', () => {
    const { names, stateOf } = setup({
        '/src/collapsible/index.ts': `export * from './collapsible';`,
    });
    const state = stateOf('BaseCollapsibleRoot');

    expect(names.nameOf(state, 'CollapsibleRoot')).toBe('CollapsibleRoot.State');
    expect(names.typeOf('CollapsibleRoot.State')).toBe(state);
});

it('knows no names without a barrel', () => {
    const { names, stateOf } = setup({});

    expect(names.nameOf(stateOf('BaseCollapsibleRoot'), 'CollapsibleRoot')).toBeUndefined();
    expect(names.typeOf('Collapsible.Root.State')).toBeUndefined();
});

it("prefers the asking namespace's name when several namespaces alias one type", () => {
    const { names, stateOf } = setup(COMPOUND_BARREL);
    const state = stateOf('BaseCollapsibleRoot');

    expect(names.nameOf(state, 'CollapsibleTrigger')).toBe('Collapsible.Trigger.State');
    expect(names.nameOf(state, 'CollapsibleRoot')).toBe('Collapsible.Root.State');
});

it('warns once about a Base UI State with no public name', () => {
    const { names, stateOf, warnings } = setup(COMPOUND_BARREL);
    const panelState = stateOf('BaseCollapsiblePanel');

    expect(names.nameOf(panelState, 'CollapsibleRoot')).toBeUndefined();
    names.nameOf(panelState, 'CollapsibleRoot');

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('No public vapor-ui name for a Base UI type in CollapsibleRoot');
});

it('does not warn about an object Base UI writes straight into a parameter or a property', () => {
    const { names, base, warnings } = setup(COMPOUND_BARREL);
    const [signature] = base.getTypeAliasOrThrow('OnResize').getType().getCallSignatures();
    const data = signature.getParameters()[0].getValueDeclarationOrThrow().getType();
    const rect = base.getTypeAliasOrThrow('Anchor').getType().getPropertyOrThrow('rect');

    expect(names.nameOf(data, 'CollapsibleRoot')).toBeUndefined();
    expect(
        names.nameOf(rect.getValueDeclarationOrThrow().getType(), 'CollapsibleRoot'),
    ).toBeUndefined();
    expect(warnings).toEqual([]);
});
