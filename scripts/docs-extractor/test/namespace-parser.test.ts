/**
 * Namespace parser unit tests
 */
import { Project } from 'ts-morph';

import {
    findExportedInterfaceProps,
    getExportedNamespaces,
} from '~/core/parser/component/namespace-parser';

describe('getExportedNamespaces', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('exported namespace 찾기', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Button {
                export interface Props {}
            }
            `,
        );

        const result = getExportedNamespaces(source);

        expect(result).toHaveLength(1);
        expect(result[0].getName()).toBe('Button');
    });

    it('여러 namespace', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Button {
                export interface Props {}
            }
            export namespace Input {
                export interface Props {}
            }
            `,
        );

        const result = getExportedNamespaces(source);

        expect(result).toHaveLength(2);
    });

    it('export된 namespace만 포함', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Public {
                export interface Props {}
            }
            `,
        );

        const result = getExportedNamespaces(source);

        expect(result).toHaveLength(1);
        expect(result[0].getName()).toBe('Public');
        expect(result[0].isExported()).toBe(true);
    });

    it('namespace 없으면 빈 배열', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export const Button = () => null;
            `,
        );

        const result = getExportedNamespaces(source);

        expect(result).toEqual([]);
    });

    it('module 선언은 제외 (namespace만)', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Button {
                export interface Props {}
            }
            declare module "external" {
                export interface Something {}
            }
            `,
        );

        const result = getExportedNamespaces(source);

        expect(result).toHaveLength(1);
        expect(result[0].getName()).toBe('Button');
    });
});

describe('findExportedInterfaceProps', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('Props interface 찾기', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Button {
                export interface Props {
                    disabled?: boolean;
                }
            }
            `,
        );

        const namespace = source.getModuleOrThrow('Button');
        const result = findExportedInterfaceProps(namespace);

        expect(result).toBeDefined();
        expect(result?.getName()).toBe('Props');
    });

    it('export되지 않은 Props는 찾지 않음', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Button {
                interface Props {
                    disabled?: boolean;
                }
            }
            `,
        );

        const namespace = source.getModuleOrThrow('Button');
        const result = findExportedInterfaceProps(namespace);

        expect(result).toBeUndefined();
    });

    it('Props가 아닌 다른 interface는 무시', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Button {
                export interface State {
                    open: boolean;
                }
            }
            `,
        );

        const namespace = source.getModuleOrThrow('Button');
        const result = findExportedInterfaceProps(namespace);

        expect(result).toBeUndefined();
    });

    it('빈 namespace', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            export namespace Empty {}
            `,
        );

        const namespace = source.getModuleOrThrow('Empty');
        const result = findExportedInterfaceProps(namespace);

        expect(result).toBeUndefined();
    });
});
