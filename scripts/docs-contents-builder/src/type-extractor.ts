import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

export interface ComponentTypeInfo {
    name: string;
    displayName?: string;
    description?: string;
    props: PropInfo[];
    defaultElement?: string;
}

export interface PropInfo {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export class TypeExtractor {
    private program: ts.Program;
    private checker: ts.TypeChecker;

    constructor(configPath: string, files?: string[]) {
        const absoluteConfigPath = path.resolve(configPath);
        const configDir = path.dirname(absoluteConfigPath);
        const configFile = ts.readConfigFile(absoluteConfigPath, ts.sys.readFile);

        if (configFile.error) {
            throw new Error(`tsconfig.json 읽기 실패: ${configFile.error.messageText}`);
        }

        const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, configDir);

        // files가 제공되면 절대 경로로 변환하여 포함
        let sourceFiles = parsedConfig.fileNames;
        if (files && files.length > 0) {
            const additionalFiles = files.map((f) => path.resolve(configDir, f));
            sourceFiles = [...parsedConfig.fileNames, ...additionalFiles];
        }

        // Base UI 타입 정의 파일들도 포함 (필요한 것들만)
        const baseUIFiles = this.findRelevantBaseUITypeFiles(sourceFiles);
        sourceFiles = [...sourceFiles, ...baseUIFiles];

        console.log('설정 디렉토리:', configDir);
        console.log('tsconfig에서 찾은 파일 수:', parsedConfig.fileNames.length);
        console.log('추가 분석 파일들:', files || []);
        console.log('Base UI 타입 파일 수:', baseUIFiles.length);
        console.log('전체 분석할 파일 수:', sourceFiles.length);

        this.program = ts.createProgram(sourceFiles, parsedConfig.options);
        this.checker = this.program.getTypeChecker();
    }

    extractComponentTypes(filePath: string): ComponentTypeInfo[] {
        // 절대 경로로 변환
        const absolutePath = path.resolve(filePath);
        const sourceFile = this.program.getSourceFile(absolutePath);
        if (!sourceFile) {
            throw new Error(`파일을 찾을 수 없습니다: ${absolutePath}`);
        }

        const components: ComponentTypeInfo[] = [];

        // 파일의 모든 export 심볼을 가져오기
        const moduleSymbol = this.checker.getSymbolAtLocation(sourceFile);
        if (moduleSymbol) {
            const exports = this.checker.getExportsOfModule(moduleSymbol);
            console.log(
                '찾은 exports:',
                exports.map((e) => e.name),
            );

            for (const exportSymbol of exports) {
                const exportResults = this.parseExport(exportSymbol, sourceFile);
                if (exportResults) {
                    components.push(...exportResults);
                }
            }
        }

        return components;
    }

    private parseExport(
        exportSymbol: ts.Symbol,
        sourceFile: ts.SourceFile,
    ): ComponentTypeInfo[] | undefined {
        try {
            const exportDeclaration = exportSymbol.declarations?.[0];
            if (!exportDeclaration) {
                return;
            }

            if (ts.isExportSpecifier(exportDeclaration)) {
                // export { Button } 형태
                if (
                    ts.isExportDeclaration(exportDeclaration.parent.parent) &&
                    exportDeclaration.parent.parent.moduleSpecifier !== undefined
                ) {
                    // re-export는 건너뛰기
                    return;
                }

                const targetSymbol =
                    this.checker.getExportSpecifierLocalTargetSymbol(exportDeclaration);
                if (!targetSymbol) {
                    return;
                }

                let type: ts.Type;
                if (targetSymbol.declarations?.length) {
                    type = this.checker.getTypeAtLocation(targetSymbol.declarations[0]);
                } else {
                    type = this.checker.getTypeOfSymbol(targetSymbol);
                }
                return this.createExportNode(exportSymbol.name, targetSymbol, type, sourceFile);
            }
        } catch (error) {
            console.error('Export 파싱 중 오류:', error);
        }
    }

    private createExportNode(
        name: string,
        symbol: ts.Symbol,
        type: ts.Type,
        sourceFile: ts.SourceFile,
    ): ComponentTypeInfo[] | undefined {
        // React 컴포넌트인지 확인
        if (!this.isReactComponent(type)) {
            return;
        }

        const componentName = name;
        const description = this.getJSDocDescription(symbol);

        // Props 타입 추출
        const propsType = this.extractPropsType(type);
        const props = propsType ? this.extractProps(propsType, sourceFile) : [];

        // displayName 추출
        const displayName = this.extractDisplayName(symbol);

        // 기본 렌더링 요소 추출
        const defaultElement = this.extractDefaultElement(symbol);

        return [
            {
                name: componentName,
                displayName,
                description,
                props,
                defaultElement,
            },
        ];
    }

    private isReactComponent(type: ts.Type): boolean {
        const typeString = this.checker.typeToString(type);
        console.log(`컴포넌트 타입 확인: ${typeString}`);
        // ForwardRefExoticComponent 패턴 확인
        if (typeString.includes('ForwardRefExoticComponent')) {
            return true;
        }

        // MemoExoticComponent 패턴 확인
        if (typeString.includes('MemoExoticComponent')) {
            return true;
        }

        // 일반 함수형 컴포넌트 확인
        const signatures = type.getCallSignatures();
        if (signatures.length === 0) return false;

        const returnType = signatures[0].getReturnType();
        const returnTypeString = this.checker.typeToString(returnType);

        return (
            returnTypeString.includes('ReactElement') ||
            returnTypeString.includes('JSX.Element') ||
            returnTypeString.includes('Element')
        );
    }

    private extractPropsType(componentType: ts.Type): ts.Type | null {
        const typeString = this.checker.typeToString(componentType);

        // ForwardRefExoticComponent의 경우 더 정교한 타입 추출
        if (typeString.includes('ForwardRefExoticComponent')) {
            const forwardRefTypes = this.extractForwardRefTypes(componentType);
            if (forwardRefTypes.propsType) {
                return forwardRefTypes.propsType;
            }
        }

        // MemoExoticComponent의 경우
        if (typeString.includes('MemoExoticComponent')) {
            const typeArgs = this.checker.getTypeArguments(componentType as ts.TypeReference);
            if (typeArgs && typeArgs.length > 0) {
                // MemoExoticComponent<ComponentType<Props>> 패턴
                const componentTypeArg = typeArgs[0];
                return this.extractPropsType(componentTypeArg); // 재귀적으로 처리
            }
        }

        // 일반 함수형 컴포넌트의 경우
        const signatures = componentType.getCallSignatures();
        if (signatures.length === 0) return null;

        const firstParam = signatures[0].getParameters()[0];
        if (!firstParam) return null;

        return this.checker.getTypeOfSymbolAtLocation(firstParam, firstParam.valueDeclaration!);
    }

    /**
     * ForwardRefExoticComponent의 내부 Props와 Ref 타입을 추출합니다.
     */
    private extractForwardRefTypes(type: ts.Type): { propsType?: ts.Type; refType?: ts.Type } {
        const result: { propsType?: ts.Type; refType?: ts.Type } = {};

        // 1. 타입의 제네릭 인자(Type Argument)를 가져옵니다.
        // ForwardRefExoticComponent<P & RefAttributes<T>> 에서 `P & RefAttributes<T>`에 해당합니다.
        const typeArguments = this.checker.getTypeArguments(type as ts.TypeReference);
        if (!typeArguments || typeArguments.length === 0) {
            return result;
        }
        const innerType = typeArguments[0];

        // 2. 이 타입은 보통 교차 타입(Intersection Type)입니다. (Props & RefAttributes)
        if (!innerType.isIntersection()) {
            // 교차 타입이 아닌 경우, 전체를 Props로 간주
            result.propsType = innerType;
            return result;
        }

        // 3. 교차 타입을 순회하며 Props와 Ref 타입을 분리합니다.
        for (const t of innerType.types) {
            const symbol = t.getSymbol();
            // 'RefAttributes'라는 이름을 가진 타입이 Ref 타입입니다.
            if (symbol && symbol.getName() === 'RefAttributes') {
                // RefAttributes<T>에서 'T'를 추출합니다.
                const refTypeArguments = this.checker.getTypeArguments(t as ts.TypeReference);
                if (refTypeArguments && refTypeArguments.length > 0) {
                    result.refType = refTypeArguments[0];
                }
            } else {
                // 나머지가 Props 타입입니다.
                result.propsType = t;
            }
        }

        return result;
    }

    private extractProps(propsType: ts.Type, sourceFile: ts.SourceFile): PropInfo[] {
        const props: PropInfo[] = [];
        const properties = propsType.getProperties();

        properties.forEach((prop) => {
            const propName = prop.getName();

            // 내장 HTML 속성들 제외 (ref, key, children 등은 포함)
            if (this.shouldExcludeProp(propName)) {
                return;
            }

            // 심볼에서 타입 추출 (이 방법이 가장 정확함)
            const propType = this.checker.getTypeOfSymbol(prop);
            const typeString = this.checker.typeToString(propType);

            const isRequired = !prop.flags || !(prop.flags & ts.SymbolFlags.Optional);
            let description = this.getJSDocDescription(prop);
            const defaultValue = this.getDefaultValue(prop, propName, sourceFile);

            // Base UI 컴포넌트에서 설명 가져오기 시도
            if (!description) {
                description = this.getBaseUIDescription(prop, propName, sourceFile);
            }

            props.push({
                name: propName,
                type: typeString,
                required: isRequired,
                description,
                defaultValue,
            });
        });

        return props;
    }

    private shouldExcludeProp(propName: string): boolean {
        // HTML 기본 속성들과 React 내장 속성들 제외
        const excludedPatterns = [
            // Event handlers
            /^on[A-Z]/,
            // ARIA attributes (너무 많아서 제외)
            /^aria-/,
            // HTML global attributes
            /^(id|style|title|lang|dir|hidden|tabIndex|role|slot|key|ref)$/,
            // HTML form attributes (모든 form 관련 속성 제외)
            /^(form|formAction|formEncType|formMethod|formNoValidate|formTarget|name|type|value|defaultValue|defaultChecked|autoFocus|disabled)$/,
            // React specific
            /^(children|dangerouslySetInnerHTML|suppressHydrationWarning|suppressContentEditableWarning)$/,
            // Accessibility and meta attributes
            /^(accessKey|autoCapitalize|autoCorrect|autoSave|contentEditable|contextMenu|draggable|enterKeyHint|inputMode|is|nonce|spellCheck|translate|unselectable|radioGroup)$/,
            // RDFa attributes
            /^(about|content|datatype|inlist|prefix|property|rel|resource|rev|typeof|vocab)$/,
            // Microdata attributes
            /^(itemProp|itemScope|itemType|itemID|itemRef)$/,
            // Other attributes
            /^(results|security|exportparts|part)$/,
        ];

        return excludedPatterns.some((pattern) => pattern.test(propName));
    }

    private getJSDocDescription(symbol: ts.Symbol): string | undefined {
        const documentation = symbol.getDocumentationComment(this.checker);

        if (documentation.length > 0) {
            return documentation.map((part) => part.text).join('');
        }

        return undefined;
    }

    private getDefaultValue(
        symbol: ts.Symbol,
        propName: string,
        sourceFile: ts.SourceFile,
    ): string | undefined {
        // CSS 파일에서 defaultVariants 찾아서 기본값 추출
        const cssFilePath = this.findCssFile(sourceFile.fileName);
        if (cssFilePath) {
            const defaultValue = this.extractDefaultFromCss(cssFilePath, propName);
            if (defaultValue !== undefined) {
                return defaultValue;
            }
        }

        // JSDoc에서 @default 태그 찾기
        const jsDocTags = symbol.getJsDocTags();
        const defaultTag = jsDocTags?.find((tag) => tag.name === 'default');
        if (defaultTag && defaultTag.text) {
            return defaultTag.text.map((part) => part.text).join('');
        }

        return undefined;
    }

    private findCssFile(componentFilePath: string): string | undefined {
        // button.tsx -> button.css.ts 형태로 CSS 파일 찾기
        const dir = path.dirname(componentFilePath);
        const baseName = path.basename(componentFilePath, path.extname(componentFilePath));

        const possibleCssFiles = [
            path.join(dir, `${baseName}.css.ts`),
            path.join(dir, `${baseName}.styles.ts`),
            path.join(dir, `${baseName}.css.js`),
        ];

        for (const cssFile of possibleCssFiles) {
            const cssSourceFile = this.program.getSourceFile(cssFile);
            if (cssSourceFile) {
                return cssFile;
            }
        }

        return undefined;
    }

    private extractDefaultFromCss(cssFilePath: string, propName: string): string | undefined {
        const cssSourceFile = this.program.getSourceFile(cssFilePath);
        if (!cssSourceFile) {
            return undefined;
        }

        // CSS 파일에서 defaultVariants 객체 찾기
        const defaultVariants = this.findDefaultVariants(cssSourceFile);
        if (defaultVariants && defaultVariants[propName] !== undefined) {
            return String(defaultVariants[propName]);
        }

        return undefined;
    }

    private findDefaultVariants(sourceFile: ts.SourceFile): Record<string, any> | undefined {
        let defaultVariants: Record<string, any> | undefined;

        const visit = (node: ts.Node) => {
            // recipe({ defaultVariants: { ... } }) 패턴 찾기
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === 'recipe'
            ) {
                const arg = node.arguments[0];
                if (ts.isObjectLiteralExpression(arg)) {
                    const defaultVariantsProp = arg.properties.find(
                        (prop) =>
                            ts.isPropertyAssignment(prop) &&
                            ts.isIdentifier(prop.name) &&
                            prop.name.text === 'defaultVariants',
                    );

                    if (defaultVariantsProp && ts.isPropertyAssignment(defaultVariantsProp)) {
                        defaultVariants = this.parseObjectLiteral(defaultVariantsProp.initializer);
                    }
                }
            }

            // export const root = recipe({ ... }) 패턴도 확인
            if (
                ts.isVariableDeclaration(node) &&
                node.initializer &&
                ts.isCallExpression(node.initializer)
            ) {
                visit(node.initializer);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return defaultVariants;
    }

    private parseObjectLiteral(node: ts.Node): Record<string, any> {
        const result: Record<string, any> = {};

        if (ts.isObjectLiteralExpression(node)) {
            node.properties.forEach((prop) => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                    const key = prop.name.text;
                    const value = this.getLiteralValue(prop.initializer);
                    if (value !== undefined) {
                        result[key] = value;
                    }
                }
            });
        }

        return result;
    }

    private getLiteralValue(node: ts.Node): any {
        if (ts.isStringLiteral(node)) {
            return node.text;
        }
        if (ts.isNumericLiteral(node)) {
            return Number(node.text);
        }
        if (node.kind === ts.SyntaxKind.TrueKeyword) {
            return true;
        }
        if (node.kind === ts.SyntaxKind.FalseKeyword) {
            return false;
        }
        if (node.kind === ts.SyntaxKind.NullKeyword) {
            return null;
        }
        return undefined;
    }

    private extractDisplayName(symbol: ts.Symbol): string | undefined {
        // displayName 속성 찾기
        const declarations = symbol.getDeclarations();
        if (!declarations) return undefined;

        for (const decl of declarations) {
            const sourceFile = decl.getSourceFile();
            const text = sourceFile.getFullText();
            const symbolName = symbol.getName();

            // Component.displayName = 'ComponentName' 패턴 찾기
            const displayNamePattern = new RegExp(
                `${symbolName}\\.displayName\\s*=\\s*['"]([^'"]+)['"]`,
            );
            const match = text.match(displayNamePattern);

            if (match) {
                return match[1];
            }
        }

        return undefined;
    }

    private extractDefaultElement(symbol: ts.Symbol): string | undefined {
        // 컴포넌트의 선언부를 찾습니다
        const declarations = symbol.getDeclarations();
        if (!declarations) return undefined;

        for (const decl of declarations) {
            // forwardRef 함수 호출 패턴을 찾습니다
            let targetNode: ts.Node | undefined;

            if (ts.isVariableDeclaration(decl) && decl.initializer) {
                targetNode = decl.initializer;
            } else if (ts.isExportAssignment(decl)) {
                targetNode = decl.expression;
            }

            if (targetNode && ts.isCallExpression(targetNode)) {
                // forwardRef 호출인지 확인
                if (
                    ts.isIdentifier(targetNode.expression) &&
                    targetNode.expression.text === 'forwardRef'
                ) {
                    const arrowFunction = targetNode.arguments[0];
                    if (
                        ts.isArrowFunction(arrowFunction) ||
                        ts.isFunctionExpression(arrowFunction)
                    ) {
                        const defaultElement = this.findDefaultElementInFunction(arrowFunction);
                        if (defaultElement) {
                            return defaultElement;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    private findDefaultElementInFunction(
        func: ts.ArrowFunction | ts.FunctionExpression,
    ): string | undefined {
        let defaultElement: string | undefined;

        const visit = (node: ts.Node) => {
            // useRender 호출을 찾습니다
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === 'useRender'
            ) {
                const arg = node.arguments[0];
                if (ts.isObjectLiteralExpression(arg)) {
                    // render 프로퍼티를 찾습니다
                    const renderProp = arg.properties.find(
                        (prop) =>
                            ts.isPropertyAssignment(prop) &&
                            ts.isIdentifier(prop.name) &&
                            prop.name.text === 'render',
                    );

                    if (renderProp && ts.isPropertyAssignment(renderProp)) {
                        // render || <element /> 패턴을 찾습니다
                        if (
                            ts.isBinaryExpression(renderProp.initializer) &&
                            renderProp.initializer.operatorToken.kind === ts.SyntaxKind.BarBarToken
                        ) {
                            const rightSide = renderProp.initializer.right;
                            if (
                                ts.isJsxElement(rightSide) ||
                                ts.isJsxSelfClosingElement(rightSide)
                            ) {
                                const tagName = ts.isJsxElement(rightSide)
                                    ? rightSide.openingElement.tagName
                                    : rightSide.tagName;

                                if (ts.isIdentifier(tagName)) {
                                    // 동적 컴포넌트인 경우 변수 추적
                                    const componentName = tagName.text;
                                    if (componentName === 'Component') {
                                        // const Component = current ? 'span' : 'a' 패턴 찾기
                                        const dynamicElement = this.findDynamicComponent(
                                            func,
                                            componentName,
                                        );
                                        if (dynamicElement) {
                                            defaultElement = dynamicElement;
                                        }
                                    } else {
                                        defaultElement = componentName;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(func);
        return defaultElement;
    }

    private findDynamicComponent(
        func: ts.ArrowFunction | ts.FunctionExpression,
        variableName: string,
    ): string | undefined {
        let dynamicElement: string | undefined;

        const visit = (node: ts.Node) => {
            // const Component = condition ? 'element1' : 'element2' 패턴 찾기
            if (
                ts.isVariableDeclaration(node) &&
                ts.isIdentifier(node.name) &&
                node.name.text === variableName &&
                node.initializer
            ) {
                // 조건부 표현식 (삼항 연산자) 처리
                if (ts.isConditionalExpression(node.initializer)) {
                    const whenFalse = node.initializer.whenFalse;
                    // 기본값은 false 케이스 (current가 false일 때)
                    if (ts.isStringLiteral(whenFalse)) {
                        dynamicElement = whenFalse.text;
                    }
                }
                // 단순 할당도 처리 (const Component = 'div')
                else if (ts.isStringLiteral(node.initializer)) {
                    dynamicElement = node.initializer.text;
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(func);
        return dynamicElement;
    }

    private getBaseUIDescription(
        prop: ts.Symbol,
        propName: string,
        sourceFile: ts.SourceFile,
    ): string | undefined {
        // AST를 통해 실제 사용되는 Base UI 컴포넌트 찾기
        const usedBaseUIComponents = this.findUsedBaseUIComponents(sourceFile);

        if (usedBaseUIComponents.length === 0) {
            return undefined;
        }

        // 각 사용된 Base UI 컴포넌트에서 prop 설명 찾기
        for (const baseUIComponent of usedBaseUIComponents) {
            try {
                const description = this.getBaseUIPropertyDescription(baseUIComponent, propName);
                if (description) {
                    return description;
                }
            } catch (error) {
                // 오류 발생 시 다음 컴포넌트 시도
                continue;
            }
        }

        return undefined;
    }

    private findUsedBaseUIComponents(
        sourceFile: ts.SourceFile,
    ): Array<{ modulePath: string; componentName: string }> {
        const usedComponents: Array<{ modulePath: string; componentName: string }> = [];

        const visit = (node: ts.Node) => {
            // Base UI import 구문 찾기: import { Avatar as BaseAvatar } from '@base-ui-components/react/avatar'
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
                            // import { Avatar as BaseAvatar } 패턴에서:
                            // - element.propertyName?.text = "Avatar" (실제 import된 이름)
                            // - element.name.text = "BaseAvatar" (로컬에서 사용하는 이름)
                            const importedName = element.propertyName?.text || element.name.text;
                            const localName = element.name.text;

                            console.log(`[DEBUG] Base UI import 발견: ${importedName} as ${localName} from ${moduleName}`);

                            // JSX에서 실제 사용되는지 확인 - 로컬 이름으로 사용되는 패턴 확인
                            // <BaseAvatar.Root>, <BaseAvatar.Image> 등
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

    private isComponentUsedInJSX(sourceFile: ts.SourceFile, componentName: string): boolean {
        let isUsed = false;

        const visit = (node: ts.Node) => {
            // JSX 요소에서 사용 확인
            if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
                const tagName = node.tagName;
                
                // 속성 접근 패턴: <BaseAvatar.Root>, <BaseAvatar.Image> 등
                if (ts.isPropertyAccessExpression(tagName)) {
                    if (
                        ts.isIdentifier(tagName.expression) &&
                        tagName.expression.text === componentName
                    ) {
                        console.log(`[DEBUG] JSX에서 속성 접근 패턴 발견: ${componentName}.${tagName.name.text}`);
                        isUsed = true;
                    }
                }
                // 단순 컴포넌트 패턴: <Avatar>
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

    private getBaseUIPropertyDescription(
        baseUIComponent: { modulePath: string; componentName: string },
        propName: string,
    ): string | undefined {
        try {
            // JSX에서 사용되는 컴포넌트 하위 타입들을 모두 확인
            const typeFiles = this.getAllBaseUITypeFiles(
                baseUIComponent.modulePath,
                baseUIComponent.componentName,
            );

            for (const typePath of typeFiles) {
                const typeSourceFile = this.program.getSourceFile(typePath);
                if (!typeSourceFile) {
                    continue;
                }

                // 타입 정의 파일에서 Props 인터페이스의 해당 prop JSDoc 찾기
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

    private getAllBaseUITypeFiles(modulePath: string, componentName: string): string[] {
        // PNPM을 고려한 실제 Base UI 타입 정의 파일 경로 해석
        // 현재 작업 디렉토리가 scripts/docs-contents-builder이므로 프로젝트 루트로 이동
        const projectRoot = path.resolve(process.cwd(), '../../');
        const possibleRoots = [
            // PNMP 경로
            path.resolve(projectRoot, 'node_modules/.pnpm/@base-ui-components+react@1.0.0-beta.2_@types+react@18.3.24_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm'),
            // 일반 경로
            path.resolve(projectRoot, 'node_modules/@base-ui-components/react/esm'),
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

    private resolveBaseUITypePath(modulePath: string, componentName: string): string | undefined {
        // PNPM을 고려한 실제 Base UI 타입 정의 파일 경로 해석
        // 현재 작업 디렉토리가 scripts/docs-contents-builder이므로 프로젝트 루트로 이동
        const projectRoot = path.resolve(process.cwd(), '../../');
        const possibleRoots = [
            // PNPM 경로
            path.resolve(projectRoot, 'node_modules/.pnpm/@base-ui-components+react@1.0.0-beta.2_@types+react@18.3.24_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm'),
            // 일반 경로
            path.resolve(projectRoot, 'node_modules/@base-ui-components/react/esm'),
        ];

        // Base UI 컴포넌트의 실제 파일 패턴 확인
        // Avatar -> AvatarRoot.d.ts, AvatarImage.d.ts, AvatarFallback.d.ts
        const possibleSubDirs = [
            'root',
            'image', 
            'fallback',
        ];

        for (const baseUIRoot of possibleRoots) {
            for (const subDir of possibleSubDirs) {
                // Avatar -> root/AvatarRoot.d.ts 패턴으로 확인
                const capitalizedComponentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
                const capitalizedSubDir = subDir.charAt(0).toUpperCase() + subDir.slice(1);
                const fileName = `${capitalizedComponentName}${capitalizedSubDir}.d.ts`;
                const typePath = path.join(baseUIRoot, modulePath, subDir, fileName);
                
                console.log(`[DEBUG] 타입 파일 확인 중:`, typePath);
                if (fs.existsSync(typePath)) {
                    console.log(`[DEBUG] 타입 파일 찾음:`, typePath);
                    return typePath;
                }
            }
        }

        console.log(`[DEBUG] ${modulePath}/${componentName}에 대한 타입 파일을 찾지 못함`);
        return undefined;
    }

    private findBaseUITypePath(componentName: string, propName: string): string | undefined {
        // Base UI 컴포넌트의 타입 정의 파일 경로 패턴들
        const possiblePaths = [
            `node_modules/@base-ui-components/react/esm/${componentName}/root/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Root.d.ts`,
            `node_modules/@base-ui-components/react/esm/${componentName}/fallback/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Fallback.d.ts`,
            `node_modules/@base-ui-components/react/esm/${componentName}/image/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Image.d.ts`,
        ];

        for (const relativePath of possiblePaths) {
            const fullPath = path.resolve(process.cwd(), relativePath);
            const sourceFile = this.program.getSourceFile(fullPath);
            if (sourceFile) {
                // 이 파일에서 해당 prop을 찾을 수 있는지 확인
                if (this.hasPropertyInFile(sourceFile, propName)) {
                    return fullPath;
                }
            }
        }

        return undefined;
    }

    private hasPropertyInFile(sourceFile: ts.SourceFile, propName: string): boolean {
        let found = false;

        const visit = (node: ts.Node) => {
            // interface Props에서 propName을 찾기
            if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') {
                node.members.forEach((member) => {
                    if (
                        ts.isPropertySignature(member) &&
                        ts.isIdentifier(member.name) &&
                        member.name.text === propName
                    ) {
                        found = true;
                    }
                });
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return found;
    }

    private extractBaseUIJSDoc(sourceFile: ts.SourceFile, propName: string): string | undefined {
        let description: string | undefined;

        const visit = (node: ts.Node) => {
            // namespace AvatarFallback { interface Props } 패턴 찾기
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
                                // JSDoc 주석 추출 - 설명이 있는 경우만
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

                                        // 설명이 실제로 존재하고 의미있는 내용인 경우만 반환
                                        if (
                                            extractedComment &&
                                            extractedComment.length > 0 &&
                                            !extractedComment.match(/^@\w+/)
                                        ) {
                                            console.log(`[DEBUG] Base UI JSDoc 발견: ${extractedComment}`);
                                            description = extractedComment;
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
            
            // 일반적인 interface Props 패턴도 확인 (혹시 다른 형태가 있을 경우)
            if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') {
                node.members.forEach((member) => {
                    if (
                        ts.isPropertySignature(member) &&
                        ts.isIdentifier(member.name) &&
                        member.name.text === propName
                    ) {
                        console.log(`[DEBUG] Base UI prop 발견 (직접): ${propName}`);
                        // JSDoc 주석 추출 - 설명이 있는 경우만
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

                                // 설명이 실제로 존재하고 의미있는 내용인 경우만 반환
                                if (
                                    extractedComment &&
                                    extractedComment.length > 0 &&
                                    !extractedComment.match(/^@\w+/)
                                ) {
                                    console.log(`[DEBUG] Base UI JSDoc 발견 (직접): ${extractedComment}`);
                                    description = extractedComment;
                                }
                            }
                        }
                    }
                });
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return description;
    }

    private findRelevantBaseUITypeFiles(sourceFiles: string[]): string[] {
        const relevantBaseUIFiles: string[] = [];

        // 각 소스 파일에서 사용되는 Base UI 컴포넌트들 수집
        for (const sourceFile of sourceFiles) {
            if (fs.existsSync(sourceFile)) {
                const content = fs.readFileSync(sourceFile, 'utf-8');

                // Base UI import가 있는지 확인
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
                    // 사용되는 Base UI 컴포넌트의 타입 정의 파일들 추가
                    for (const component of usedComponents) {
                        const typePath = this.resolveBaseUITypePath(
                            component.modulePath,
                            component.componentName,
                        );
                        if (typePath && !relevantBaseUIFiles.includes(typePath)) {
                            relevantBaseUIFiles.push(typePath);
                        }
                    }
                }
            }
        }

        return relevantBaseUIFiles;
    }

    private findBaseUITypeFiles(configDir: string): string[] {
        const baseUITypeFiles: string[] = [];

        try {
            // node_modules/@base-ui-components/react/esm 경로에서 직접 찾기
            const baseUIPath = path.resolve(
                configDir,
                '../../node_modules/@base-ui-components/react/esm',
            );

            if (fs.existsSync(baseUIPath)) {
                // avatar, dialog 등 컴포넌트 디렉토리들을 순회
                const componentDirs = fs.readdirSync(baseUIPath).filter((item: string) => {
                    const itemPath = path.join(baseUIPath, item);
                    return fs.statSync(itemPath).isDirectory();
                });

                for (const componentDir of componentDirs) {
                    const componentPath = path.join(baseUIPath, componentDir);
                    this.collectTypeFiles(componentPath, baseUITypeFiles);
                }
            }
        } catch (error) {
            console.log('Base UI 타입 파일을 찾는 중 오류:', error);
        }

        return baseUITypeFiles;
    }

    private collectTypeFiles(dir: string, files: string[]): void {
        try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    this.collectTypeFiles(fullPath, files);
                } else if (item.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 디렉토리 읽기 실패시 무시
        }
    }
}

// 사용 예시 함수
export function extractComponentTypesFromFile(
    configPath: string,
    filePath: string,
    includeFiles?: string[],
): ComponentTypeInfo[] {
    const extractor = new TypeExtractor(configPath, includeFiles);
    return extractor.extractComponentTypes(filePath);
}
