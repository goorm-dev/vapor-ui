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

    it('should extract extends for Button.Props', () => {
        const result = setup();
        const button = result.props.find((p) => p.name === 'Button.Props');

        expect(button?.extends).toHaveLength(2);
        expect(button?.extends[0].name).toBe('ButtonPrimitiveProps');
        expect(button?.extends[1].name).toBe('ButtonVariants');
    });

    it('should resolve local type alias', () => {
        const result = setup();
        const button = result.props.find((p) => p.name === 'Button.Props');

        expect(button?.extends[0].resolved).toBe("VComponentProps<'button'>");
    });

    it('should extract direct properties', () => {
        const result = setup();
        const dialog = result.props.find((p) => p.name === 'Dialog.Props');

        expect(dialog?.properties).toHaveLength(2);
        expect(dialog?.properties[0]).toEqual({
            name: 'open',
            type: 'boolean',
            optional: true,
        });
    });

    it('should extract associated types', () => {
        const result = setup();
        const dialog = result.props.find((p) => p.name === 'Dialog.Props');

        expect(dialog?.associatedTypes).toContain('ChangeEventDetails');
    });
});
