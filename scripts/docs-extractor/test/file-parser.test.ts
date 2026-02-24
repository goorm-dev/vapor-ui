/**
 * File parser integration tests
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ModuleKind, ModuleResolutionKind, Project, ScriptTarget } from 'ts-morph';

import { extractProps, extractPropsLegacy } from '~/core/parser/file-parser';

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
    return fs.mkdtempSync(path.join(os.tmpdir(), 'docs-extractor-file-parser-'));
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
            export interface Props {
                state?: BaseCollapsible.Root.State;
                onOpenChange?: (details: BaseCollapsible.Root.ChangeEventDetails) => void;
                custom?: string;
                'data-testid'?: string;
            }

            export type State = BaseCollapsible.Root.State;
            export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
        }
        `,
    );

    return {
        componentFile: path.join(componentDir, 'collapsible.tsx'),
    };
}

describe('extractProps', () => {
    it('builds parsed/models/json output from a component source file', () => {
        const root = createFixtureRoot();
        const { componentFile } = writeFixtureFiles(root);
        const project = createProject();
        const sourceFile = project.addSourceFileAtPath(componentFile);

        const result = extractProps(sourceFile);

        expect(result.parsed).toHaveLength(1);
        expect(result.models).toHaveLength(1);
        expect(result.props).toHaveLength(1);

        const jsonProps = result.props[0].props;
        const stateProp = jsonProps.find((prop) => prop.name === 'state');
        const onOpenChangeProp = jsonProps.find((prop) => prop.name === 'onOpenChange');
        const dataTestIdProp = jsonProps.find((prop) => prop.name === 'data-testid');

        expect(stateProp?.type).toEqual(['BaseCollapsible.Root.State']);
        expect(onOpenChangeProp?.type[0]).toContain('Collapsible.Root.ChangeEventDetails');
        expect(dataTestIdProp).toBeUndefined();
    });

    it('respects include option for html-like props', () => {
        const root = createFixtureRoot();
        const { componentFile } = writeFixtureFiles(root);
        const project = createProject();
        const sourceFile = project.addSourceFileAtPath(componentFile);

        const result = extractProps(sourceFile, { include: ['data-testid'] });
        const jsonProps = result.props[0].props;

        expect(jsonProps.some((prop) => prop.name === 'data-testid')).toBe(true);
    });
});

describe('extractPropsLegacy', () => {
    it('returns the same json props payload as extractProps', () => {
        const root = createFixtureRoot();
        const { componentFile } = writeFixtureFiles(root);
        const project = createProject();
        const sourceFile = project.addSourceFileAtPath(componentFile);

        const modern = extractProps(sourceFile);
        const legacy = extractPropsLegacy(sourceFile);

        expect(legacy.props).toEqual(modern.props);
    });
});
