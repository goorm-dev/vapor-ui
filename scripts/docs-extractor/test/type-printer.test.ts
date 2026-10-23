/**
 * Type printer tests
 *
 * The printer is asked two things: `members(type, location)` (the prop's members
 * and the public names it chose) and `definition(type, location)`. Each test puts a
 * source string in an in-memory project and asks about one declared type.
 */
import { joinTypeMembers } from '#model';
import type { PublicNames } from '#read/public-names';
import { createTypePrinter } from '#read/type-printer/printer';
import { Project, type SourceFile } from 'ts-morph';

/** `type ReactNode` stands in for React's: the printer keeps it by its alias name. */
const PRELUDE = 'type ReactNode = string | number | boolean | null | undefined;\n';

/** Every type alias in the fixture whose name starts with `Public` is public under `X.<name>`. */
function fixturePublicNames(file: SourceFile): PublicNames {
    const entries = file
        .getTypeAliases()
        .filter((alias) => alias.getName().startsWith('Public'))
        .map((alias) => ({ name: `X.${alias.getName()}`, type: alias.getType() }));

    return {
        nameOf: (type) => entries.find((entry) => entry.type === type)?.name,
        typeOf: (name) => entries.find((entry) => entry.name === name)?.type,
    };
}

function setup(source: string) {
    const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: { strict: true },
    });
    const file = project.createSourceFile('fixture.ts', PRELUDE + source);
    const printer = createTypePrinter({
        publicNames: fixturePublicNames(file),
        namespace: 'Fixture',
    });
    return { file, printer };
}

function readProp(source: string, prop: string) {
    const { file, printer } = setup(source);
    const declaration = file.getInterfaceOrThrow('Props').getPropertyOrThrow(prop);
    return printer.members(declaration.getType(), declaration);
}

/** The prop's type on one line, as `detailedType` reads it. */
function printProp(source: string, prop: string): string {
    return joinTypeMembers(readProp(source, prop).typeMembers);
}

function printDefinition(source: string, name: string): string {
    const { file, printer } = setup(source);
    const alias = file.getTypeAliasOrThrow(name);
    return printer.definition(alias.getType(), alias);
}

describe('members', () => {
    it('keeps ReactNode by name at the top level', () => {
        expect(printProp('interface Props { a?: ReactNode }', 'a')).toBe('ReactNode');
    });

    it('reads true | false as boolean at the top level', () => {
        expect(printProp('interface Props { a: boolean | (() => void) }', 'a')).toBe(
            'boolean | (() => void)',
        );
    });
});

describe('type refs', () => {
    const source = `
type PublicInner = { a: string };
type PublicState = { inner: PublicInner };
interface Props { a?: PublicState | ((state: PublicState, x: PublicInner) => string) }`;

    it('lists each public name the prop prints once, in print order', () => {
        const { typeMembers, typeRefs } = readProp(source, 'a');

        expect(joinTypeMembers(typeMembers)).toBe(
            'X.PublicState | ((state: X.PublicState, x: X.PublicInner) => string) | undefined',
        );
        expect(typeRefs).toEqual(['X.PublicState', 'X.PublicInner']);
    });

    it('names a public type passed as a type argument, such as actionsRef', () => {
        const { typeMembers, typeRefs } = readProp(
            `
interface RefObject<T> { current: T }
type PublicActions = { close: () => void };
interface Props { a?: RefObject<PublicActions | null> }`,
            'a',
        );

        expect(joinTypeMembers(typeMembers)).toBe('RefObject<X.PublicActions | null> | undefined');
        expect(typeRefs).toEqual(['X.PublicActions']);
    });

    it('lists none for a prop that prints no public name', () => {
        expect(readProp('interface Props { a: string }', 'a').typeRefs).toEqual([]);
    });

    it('does not count names printed inside a definition', () => {
        const { file, printer } = setup(`
type PublicInner = { a: string };
type PublicState = { inner: PublicInner };
interface Props { a: PublicState }`);
        const declaration = file.getInterfaceOrThrow('Props').getPropertyOrThrow('a');
        const state = file.getTypeAliasOrThrow('PublicState');

        expect(printer.definition(state.getType(), state)).toBe(`{
  inner: X.PublicInner;
}`);
        expect(printer.members(declaration.getType(), declaration).typeRefs).toEqual([
            'X.PublicState',
        ]);
    });
});

describe('members inside a callback follow the top-level rules', () => {
    it('keeps ReactNode by name in a parameter', () => {
        expect(
            printProp('interface Props { a: (node: ReactNode | (() => void)) => void }', 'a'),
        ).toBe('(node: ReactNode | (() => void)) => void');
    });

    it('reads boolean | fn in a parameter as boolean, not false | true', () => {
        expect(
            printProp('interface Props { a: (open: boolean | (() => void)) => void }', 'a'),
        ).toBe('(open: boolean | (() => void)) => void');
    });

    it('keeps | undefined on a required parameter', () => {
        expect(
            printProp('interface Props { a: (cb: (() => void) | undefined) => void }', 'a'),
        ).toBe('(cb: (() => void) | undefined) => void');
    });

    it('prints an optional parameter as cb?: without | undefined', () => {
        expect(printProp('interface Props { a: (cb?: () => void) => void }', 'a')).toBe(
            '(cb?: () => void) => void',
        );
    });
});

describe('a named union of other types reads the same wherever it appears', () => {
    const source = `
type Padding = number | { x: number };
type ClassName<S> = string | ((state: S) => string);
interface Props {
    a: Padding;
    b: (p: Padding) => void;
    c?: Padding;
    d: (p?: Padding) => void;
    e: () => Padding;
    f: { q: Padding };
    g: ClassName<{ open: boolean }>;
    h: (c: ClassName<number>) => void;
    i: () => ClassName<number>;
    j: { q: ClassName<number> };
    k?: ClassName<number>;
}`;

    it.each([
        ['a', 'Padding'],
        ['b', '(p: Padding) => void'],
        ['c', 'Padding | undefined'],
        ['d', '(p?: Padding) => void'],
        ['e', '() => Padding'],
        ['f', '{ q: Padding; }'],
    ])('keeps a union alias without type arguments by name (%s)', (prop, expected) => {
        expect(printProp(source, prop)).toBe(expected);
    });

    it.each([
        ['g', 'string | ((state: { open: boolean; }) => string)'],
        ['h', '(c: string | ((state: number) => string)) => void'],
        ['i', '() => (string | ((state: number) => string))'],
        ['j', '{ q: string | ((state: number) => string); }'],
        ['k', 'string | ((state: number) => string) | undefined'],
    ])('opens a generic union alias (%s)', (prop, expected) => {
        expect(printProp(source, prop)).toBe(expected);
    });
});

describe('definition', () => {
    it('prints an object one property per line, optional ones without undefined', () => {
        expect(printDefinition('type Details = { reason: "a" | "b"; event?: Event };', 'Details'))
            .toBe(`{
  reason: "a" | "b";
  event?: Event;
}`);
    });

    it('pulls the properties every member of an object union shares into one & { … }', () => {
        const source = `
type Common = { event: Event; cancel: () => void };
type Details = ({ reason: "a"; index: number } | { reason: "b" }) & Common;`;

        expect(printDefinition(source, 'Details')).toBe(`(
  | { reason: "a"; index: number; }
  | { reason: "b"; }
) & {
  event: Event;
  cancel: () => void;
}`);
    });

    it('prints anything else as its members on one line', () => {
        expect(printDefinition('type Side = "top" | "bottom";', 'Side')).toBe('"top" | "bottom"');
    });
});
