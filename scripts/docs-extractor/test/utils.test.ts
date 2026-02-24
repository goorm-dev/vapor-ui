/**
 * Parser utils unit tests
 */
import { Project } from 'ts-morph';

import { findImportPaths, findNamespaceImportName } from '~/core/parser/utils';

describe('findImportPaths', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('특정 확장자의 import 경로 찾기', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            import './button.css';
            import './styles.css';
            import { something } from './utils';
            `,
        );

        const result = findImportPaths(source, '.css');

        expect(result).toEqual(['./button.css', './styles.css']);
    });

    it('매칭되는 import 없으면 빈 배열', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            import { foo } from './foo';
            import { bar } from './bar';
            `,
        );

        const result = findImportPaths(source, '.css');

        expect(result).toEqual([]);
    });

    it('중복 제거', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            import './styles.css';
            import './styles.css';
            `,
        );

        const result = findImportPaths(source, '.css');

        expect(result).toEqual(['./styles.css']);
    });

    it('.css.ts 확장자', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            import * as styles from './button.css';
            import * as theme from './theme.css.ts';
            `,
        );

        const result = findImportPaths(source, '.css.ts');

        expect(result).toEqual(['./theme.css.ts']);
    });

    it('import 없는 파일', () => {
        const source = project.createSourceFile('test.ts', `const x = 1;`);

        const result = findImportPaths(source, '.css');

        expect(result).toEqual([]);
    });
});

describe('findNamespaceImportName', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('namespace import 이름 찾기', () => {
        const source = project.createSourceFile(
            'test.ts',
            `import * as styles from './button.css';`,
        );

        const result = findNamespaceImportName(source, './button.css');

        expect(result).toBe('styles');
    });

    it('다른 이름의 namespace import', () => {
        const source = project.createSourceFile(
            'test.ts',
            `import * as buttonStyles from './button.css';`,
        );

        const result = findNamespaceImportName(source, './button.css');

        expect(result).toBe('buttonStyles');
    });

    it('매칭되는 import 없으면 null', () => {
        const source = project.createSourceFile(
            'test.ts',
            `import * as styles from './other.css';`,
        );

        const result = findNamespaceImportName(source, './button.css');

        expect(result).toBeNull();
    });

    it('named import는 무시', () => {
        const source = project.createSourceFile(
            'test.ts',
            `import { recipe } from './button.css';`,
        );

        const result = findNamespaceImportName(source, './button.css');

        expect(result).toBeNull();
    });

    it('default import는 무시', () => {
        const source = project.createSourceFile(
            'test.ts',
            `import styles from './button.css';`,
        );

        const result = findNamespaceImportName(source, './button.css');

        expect(result).toBeNull();
    });
});
