/**
 * Type printer tests
 *
 * The printer is asked two things: `members(type, location)` and
 * `definition(type, location)`. Each test puts a source string in an in-memory
 * project and asks about one declared type.
 */
import { createTypePrinter } from '#read/type-printer/printer';
import { silentReporter } from '#reporter';
import { joinTypeMembers } from '#type-text';
import { Project } from 'ts-morph';

/** `type ReactNode` stands in for React's: the printer keeps it by its alias name. */
const PRELUDE = 'type ReactNode = string | number | boolean | null | undefined;\n';

function setup(source: string) {
    const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: { strict: true },
    });
    const file = project.createSourceFile('fixture.ts', PRELUDE + source);
    const printer = createTypePrinter({
        baseUiMap: {},
        namespace: 'Fixture',
        reporter: silentReporter,
    });
    return { file, printer };
}

/** The prop's type on one line, as `detailedType` reads it. */
function printProp(source: string, prop: string): string {
    const { file, printer } = setup(source);
    const declaration = file.getInterfaceOrThrow('Props').getPropertyOrThrow(prop);
    return joinTypeMembers(printer.members(declaration.getType(), declaration));
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
