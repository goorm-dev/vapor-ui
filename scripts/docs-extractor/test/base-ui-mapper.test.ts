/**
 * Base-UI mapper tests
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ModuleKind, ModuleResolutionKind, Project, ScriptTarget } from 'ts-morph';

import { buildBaseUiTypeMap, resolveBaseUiType } from '~/core/parser/type/base-ui-mapper';

function createProject(): Project {
    return new Project({
        compilerOptions: {
            target: ScriptTarget.ES2022,
            module: ModuleKind.ESNext,
            moduleResolution: ModuleResolutionKind.Bundler,
            strict: true,
            skipLibCheck: true,
        },
    });
}

function createFixtureRoot(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'docs-extractor-mapper-'));
}

function writeFixtureFiles(root: string) {
    const componentDir = path.join(root, 'components', 'collapsible');
    const baseUiDir = path.join(componentDir, '@base-ui');

    fs.mkdirSync(baseUiDir, { recursive: true });

    fs.writeFileSync(
        path.join(baseUiDir, 'CollapsibleRoot.d.ts'),
        `
        export namespace Root {
            export interface State {
                open: boolean;
            }

            export interface ChangeEventDetails {
                source: 'keyboard' | 'pointer';
            }
        }
        `,
    );

    fs.writeFileSync(
        path.join(componentDir, 'index.ts'),
        `export * as Collapsible from './index.parts';`,
    );

    fs.writeFileSync(
        path.join(componentDir, 'index.parts.ts'),
        `export { CollapsibleRoot as Root } from './collapsible';`,
    );

    fs.writeFileSync(
        path.join(componentDir, 'collapsible.tsx'),
        `
        import type * as BaseCollapsible from './@base-ui/CollapsibleRoot';

        export namespace CollapsibleRoot {
            export type State = BaseCollapsible.Root.State;
            export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;

            type LocalOnly = { hidden: boolean };
            export type LocalAlias = LocalOnly;
        }

        export type ExternalState = BaseCollapsible.Root.State;
        `,
    );

    return {
        componentFile: path.join(componentDir, 'collapsible.tsx'),
    };
}

describe('buildBaseUiTypeMap', () => {
    it('builds mapping from barrel public names and namespace aliases', () => {
        const root = createFixtureRoot();
        const { componentFile } = writeFixtureFiles(root);
        const project = createProject();
        const sourceFile = project.addSourceFileAtPath(componentFile);

        const map = buildBaseUiTypeMap(sourceFile);

        expect(map['Root.State']?.vaporPath).toBe('Collapsible.Root.State');
        expect(map['Root.ChangeEventDetails']?.vaporPath).toBe(
            'Collapsible.Root.ChangeEventDetails',
        );
        expect(map['CollapsibleRoot.State']?.vaporPath).toBe('Collapsible.Root.State');
        expect(map['CollapsibleRoot.ChangeEventDetails']?.vaporPath).toBe(
            'Collapsible.Root.ChangeEventDetails',
        );
        expect(map['CollapsibleRoot.LocalAlias']).toBeUndefined();
    });

    it('returns an empty map when barrel files are missing', () => {
        const project = createProject();
        const sourceFile = project.createSourceFile(
            '/tmp/component.tsx',
            `
            type Local = { value: string };
            export namespace ComponentRoot {
                export type State = Local;
            }
            `,
        );

        const map = buildBaseUiTypeMap(sourceFile);
        expect(Object.keys(map)).toHaveLength(0);
    });
});

describe('resolveBaseUiType', () => {
    it('resolves a base-ui type to the mapped vapor path', () => {
        const root = createFixtureRoot();
        const { componentFile } = writeFixtureFiles(root);
        const project = createProject();
        const sourceFile = project.addSourceFileAtPath(componentFile);

        const map = buildBaseUiTypeMap(sourceFile);
        const externalState = sourceFile.getTypeAliasOrThrow('ExternalState').getType();

        expect(resolveBaseUiType(externalState, map)).toBe('Collapsible.Root.State');
    });

    it('returns null for non base-ui types', () => {
        const project = createProject();
        const sourceFile = project.createSourceFile('/tmp/non-base-ui.ts', `type Local = string;`);
        const localType = sourceFile.getTypeAliasOrThrow('Local').getType();

        expect(resolveBaseUiType(localType, {})).toBeNull();
    });
});
