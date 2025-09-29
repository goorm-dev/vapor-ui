import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import type { BaseUIComponent } from './types';

/**
 * Analyzes Base UI components and extracts JSDoc descriptions
 * from node_modules type definitions
 */
export class BaseUIAnalyzer {
    private program: ts.Program;
    private projectRoot: string;

    constructor(program: ts.Program, projectRoot?: string) {
        this.program = program;
        this.projectRoot = projectRoot || path.resolve(process.cwd(), '../../');
    }

    /**
     * Finds Base UI components used in a source file
     */
    findUsedBaseUIComponents(sourceFile: ts.SourceFile): BaseUIComponent[] {
        const usedComponents: BaseUIComponent[] = [];

        const visit = (node: ts.Node) => {
            // Base UI import: import { Avatar as BaseAvatar } from '@base-ui-components/react/avatar'
            if (
                ts.isImportDeclaration(node) &&
                node.moduleSpecifier &&
                ts.isStringLiteral(node.moduleSpecifier)
            ) {
                const moduleName = node.moduleSpecifier.text;
                if (moduleName.startsWith('@base-ui-components/react/')) {
                    const componentPath = moduleName.replace('@base-ui-components/react/', '');

                    if (
                        node.importClause &&
                        node.importClause.namedBindings &&
                        ts.isNamedImports(node.importClause.namedBindings)
                    ) {
                        node.importClause.namedBindings.elements.forEach((element) => {
                            const importedName = element.propertyName?.text || element.name.text;
                            const localName = element.name.text;

                            console.log(`[DEBUG] Base UI import 발견: ${importedName} as ${localName} from ${moduleName}`);

                            // Check if used in JSX
                            const isUsed = this.isComponentUsedInJSX(sourceFile, localName);
                            
                            if (isUsed) {
                                console.log(`[DEBUG] JSX에서 사용됨: ${localName}`);
                                usedComponents.push({
                                    modulePath: componentPath,
                                    componentName: importedName,
                                });
                            } else {
                                console.log(`[DEBUG] JSX에서 사용되지 않음: ${localName}`);
                            }
                        });
                    }
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return usedComponents;
    }

    /**
     * Checks if a Base UI component is used in JSX
     */
    private isComponentUsedInJSX(sourceFile: ts.SourceFile, componentName: string): boolean {
        let isUsed = false;

        const visit = (node: ts.Node) => {
            if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
                const tagName = node.tagName;
                
                // Property access pattern: <BaseAvatar.Root>, <BaseAvatar.Image>
                if (ts.isPropertyAccessExpression(tagName)) {
                    if (
                        ts.isIdentifier(tagName.expression) &&
                        tagName.expression.text === componentName
                    ) {
                        console.log(`[DEBUG] JSX에서 속성 접근 패턴 발견: ${componentName}.${tagName.name.text}`);
                        isUsed = true;
                    }
                }
                // Simple component pattern: <Avatar>
                else if (ts.isIdentifier(tagName) && tagName.text === componentName) {
                    console.log(`[DEBUG] JSX에서 단순 컴포넌트 패턴 발견: ${componentName}`);
                    isUsed = true;
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return isUsed;
    }

    /**
     * Gets Base UI property description from type definition files
     */
    getBaseUIPropertyDescription(baseUIComponent: BaseUIComponent, propName: string): string | undefined {
        try {
            const typeFiles = this.getAllBaseUITypeFiles(
                baseUIComponent.modulePath,
                baseUIComponent.componentName,
            );

            for (const typePath of typeFiles) {
                const typeSourceFile = this.program.getSourceFile(typePath);
                if (!typeSourceFile) {
                    continue;
                }

                const description = this.extractBaseUIJSDoc(typeSourceFile, propName);
                if (description) {
                    return description;
                }
            }

            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Gets all Base UI type definition files for a component
     */
    private getAllBaseUITypeFiles(modulePath: string, componentName: string): string[] {
        const possibleRoots = [
            // PNPM path
            path.resolve(this.projectRoot, 'node_modules/.pnpm/@base-ui-components+react@1.0.0-beta.2_@types+react@18.3.24_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm'),
            // Standard path
            path.resolve(this.projectRoot, 'node_modules/@base-ui-components/react/esm'),
        ];

        const typeFiles: string[] = [];
        const possibleSubDirs = ['root', 'image', 'fallback'];

        for (const baseUIRoot of possibleRoots) {
            for (const subDir of possibleSubDirs) {
                const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
                const capitalizedSubDir = subDir.charAt(0).toUpperCase() + subDir.slice(1);
                const fileName = `${capitalizedComponentName}${capitalizedSubDir}.d.ts`;
                const typePath = path.join(baseUIRoot, modulePath, subDir, fileName);
                
                if (fs.existsSync(typePath)) {
                    console.log(`[DEBUG] Base UI 타입 파일 추가:`, typePath);
                    typeFiles.push(typePath);
                }
            }
        }

        return typeFiles;
    }

    /**
     * Extracts JSDoc comments from Base UI type definition files
     */
    private extractBaseUIJSDoc(sourceFile: ts.SourceFile, propName: string): string | undefined {
        let description: string | undefined;

        const visit = (node: ts.Node) => {
            // namespace AvatarFallback { interface Props } pattern
            if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
                node.body.statements.forEach((statement) => {
                    if (ts.isInterfaceDeclaration(statement) && statement.name.text === 'Props') {
                        statement.members.forEach((member) => {
                            if (
                                ts.isPropertySignature(member) &&
                                ts.isIdentifier(member.name) &&
                                member.name.text === propName
                            ) {
                                console.log(`[DEBUG] Base UI prop 발견: ${propName}`);
                                description = this.extractJSDocComment(member);
                            }
                        });
                    }
                });
            }
            
            // Direct interface Props pattern
            if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') {
                node.members.forEach((member) => {
                    if (
                        ts.isPropertySignature(member) &&
                        ts.isIdentifier(member.name) &&
                        member.name.text === propName
                    ) {
                        console.log(`[DEBUG] Base UI prop 발견 (직접): ${propName}`);
                        description = this.extractJSDocComment(member);
                    }
                });
            }
            
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return description;
    }

    /**
     * Extracts JSDoc comment text from a TypeScript node
     */
    private extractJSDocComment(member: ts.PropertySignature): string | undefined {
        const jsDocComments = ts.getJSDocCommentsAndTags(member);
        if (jsDocComments.length > 0) {
            const comment = jsDocComments[0];
            if (ts.isJSDoc(comment) && comment.comment) {
                let extractedComment: string;
                if (typeof comment.comment === 'string') {
                    extractedComment = comment.comment.trim();
                } else {
                    extractedComment = comment.comment
                        .map((part) => part.text)
                        .join('')
                        .trim();
                }

                // Only return meaningful descriptions
                if (
                    extractedComment &&
                    extractedComment.length > 0 &&
                    !extractedComment.match(/^@\w+/)
                ) {
                    console.log(`[DEBUG] Base UI JSDoc 발견: ${extractedComment}`);
                    return extractedComment;
                }
            }
        }
        return undefined;
    }

    /**
     * Finds relevant Base UI type files from source files
     */
    findRelevantBaseUITypeFiles(sourceFiles: string[]): string[] {
        const relevantBaseUIFiles: string[] = [];

        for (const sourceFile of sourceFiles) {
            if (fs.existsSync(sourceFile)) {
                const content = fs.readFileSync(sourceFile, 'utf-8');

                if (content.includes('@base-ui-components/react/')) {
                    const tempSourceFile = ts.createSourceFile(
                        sourceFile,
                        content,
                        ts.ScriptTarget.Latest,
                        true,
                    );
                    const usedComponents = this.findUsedBaseUIComponents(tempSourceFile);
                    console.log(
                        usedComponents.length,
                        '개의 Base UI 컴포넌트가',
                        sourceFile,
                        '에서 사용됨',
                    );
                    
                    for (const component of usedComponents) {
                        const typeFiles = this.getAllBaseUITypeFiles(
                            component.modulePath,
                            component.componentName,
                        );
                        for (const typeFile of typeFiles) {
                            if (!relevantBaseUIFiles.includes(typeFile)) {
                                relevantBaseUIFiles.push(typeFile);
                            }
                        }
                    }
                }
            }
        }

        return relevantBaseUIFiles;
    }
}