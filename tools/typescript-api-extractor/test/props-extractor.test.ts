import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { addSourceFiles, createProject } from '~/core/project';
import { extractProps } from '~/core/props-extractor';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function setup() {
    const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
    const project = createProject(tsconfigPath);
    const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);
    return extractProps(sourceFile);
}

describe('extractProps', () => {
    it('should find Props interfaces in namespaces', () => {
        const result = setup();

        expect(result.props.length).toBe(4);
        expect(result.props.map((p) => p.name)).toEqual([
            'Simple.Props',
            'Button.Props',
            'Dialog.Props',
            'TabsList.Props',
        ]);
    });

    it('should extract all resolved properties including inherited', () => {
        const result = setup();
        const button = result.props.find((p) => p.name === 'Button.Props');

        expect(button?.props.length).toBeGreaterThan(0);
        expect(button?.props.some((p) => p.name === 'variant')).toBe(true);
        expect(button?.props.some((p) => p.name === 'size')).toBe(true);
    });

    it('should filter out node_modules props by default', () => {
        const tsconfigPath = path.join(FIXTURES_DIR, 'tsconfig.json');
        const project = createProject(tsconfigPath);
        const [sourceFile] = addSourceFiles(project, [path.join(FIXTURES_DIR, 'props-sample.tsx')]);

        const result = extractProps(sourceFile, { filterExternal: true });
        const button = result.props.find((p) => p.name === 'Button.Props');

        expect(button?.props.some((p) => p.name === 'variant')).toBe(true);
        expect(button?.props.some((p) => p.name === 'size')).toBe(true);
    });
});
