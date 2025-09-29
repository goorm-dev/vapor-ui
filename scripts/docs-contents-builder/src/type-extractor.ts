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

        console.log('설정 디렉토리:', configDir);
        console.log('tsconfig에서 찾은 파일 수:', parsedConfig.fileNames.length);
        console.log('추가 분석 파일들:', files || []);
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
            const description = this.getJSDocDescription(prop);
            const defaultValue = this.getDefaultValue(prop, propName, sourceFile);

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

    private getDefaultValue(symbol: ts.Symbol, propName: string, sourceFile: ts.SourceFile): string | undefined {
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
        const defaultTag = jsDocTags?.find(tag => tag.name === 'default');
        if (defaultTag && defaultTag.text) {
            return defaultTag.text.map(part => part.text).join('');
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
            if (ts.isCallExpression(node) && 
                ts.isIdentifier(node.expression) && 
                node.expression.text === 'recipe') {
                
                const arg = node.arguments[0];
                if (ts.isObjectLiteralExpression(arg)) {
                    const defaultVariantsProp = arg.properties.find(prop => 
                        ts.isPropertyAssignment(prop) && 
                        ts.isIdentifier(prop.name) && 
                        prop.name.text === 'defaultVariants'
                    );
                    
                    if (defaultVariantsProp && ts.isPropertyAssignment(defaultVariantsProp)) {
                        defaultVariants = this.parseObjectLiteral(defaultVariantsProp.initializer);
                    }
                }
            }

            // export const root = recipe({ ... }) 패턴도 확인
            if (ts.isVariableDeclaration(node) && 
                node.initializer && 
                ts.isCallExpression(node.initializer)) {
                
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
            node.properties.forEach(prop => {
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
                if (ts.isIdentifier(targetNode.expression) && 
                    targetNode.expression.text === 'forwardRef') {
                    
                    const arrowFunction = targetNode.arguments[0];
                    if (ts.isArrowFunction(arrowFunction) || ts.isFunctionExpression(arrowFunction)) {
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

    private findDefaultElementInFunction(func: ts.ArrowFunction | ts.FunctionExpression): string | undefined {
        let defaultElement: string | undefined;

        const visit = (node: ts.Node) => {
            // useRender 호출을 찾습니다
            if (ts.isCallExpression(node) && 
                ts.isIdentifier(node.expression) && 
                node.expression.text === 'useRender') {
                
                const arg = node.arguments[0];
                if (ts.isObjectLiteralExpression(arg)) {
                    // render 프로퍼티를 찾습니다
                    const renderProp = arg.properties.find(prop => 
                        ts.isPropertyAssignment(prop) && 
                        ts.isIdentifier(prop.name) && 
                        prop.name.text === 'render'
                    );
                    
                    if (renderProp && ts.isPropertyAssignment(renderProp)) {
                        // render || <element /> 패턴을 찾습니다
                        if (ts.isBinaryExpression(renderProp.initializer) && 
                            renderProp.initializer.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
                            
                            const rightSide = renderProp.initializer.right;
                            if (ts.isJsxElement(rightSide) || ts.isJsxSelfClosingElement(rightSide)) {
                                const tagName = ts.isJsxElement(rightSide) 
                                    ? rightSide.openingElement.tagName
                                    : rightSide.tagName;
                                
                                if (ts.isIdentifier(tagName)) {
                                    // 동적 컴포넌트인 경우 변수 추적
                                    const componentName = tagName.text;
                                    if (componentName === 'Component') {
                                        // const Component = current ? 'span' : 'a' 패턴 찾기
                                        const dynamicElement = this.findDynamicComponent(func, componentName);
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

    private findDynamicComponent(func: ts.ArrowFunction | ts.FunctionExpression, variableName: string): string | undefined {
        let dynamicElement: string | undefined;

        const visit = (node: ts.Node) => {
            // const Component = condition ? 'element1' : 'element2' 패턴 찾기
            if (ts.isVariableDeclaration(node) && 
                ts.isIdentifier(node.name) && 
                node.name.text === variableName &&
                node.initializer) {
                
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
