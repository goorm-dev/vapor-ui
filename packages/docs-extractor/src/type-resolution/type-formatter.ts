import * as prettier from 'prettier';

import type { Logger } from '../utils/logger.js';

/**
 * 포맷팅된 타입 정보
 */
export interface FormattedType {
    type: string; // 한 줄 요약 타입
    detailedType: string; // Prettier로 포맷팅된 멀티라인 타입
}

/**
 * 타입 포맷팅 컨텍스트 정보
 */
export interface TypeFormatterContext {
    /** 컴포넌트 displayName (예: "Menu.Popup", "Button") */
    componentDisplayName?: string;
}

/**
 * render와 className 같은 특수 prop 타입을 포맷팅하는 클래스
 *
 * Base UI의 api-docs-builder 방식을 따름:
 * - render prop은 ComponentRenderFn을 함수 시그니처로 확장
 * - className prop은 string | ((state) => string) 형태로 표시
 * - import 경로와 복잡한 제네릭은 정리
 * - State 타입을 컴포넌트 네임스페이스로 변환 (예: State → Menu.Popup.State)
 */
export class TypeFormatter {
    constructor(private logger: Logger) {}

    /**
     * prop 타입을 포맷팅
     * @param propName - prop 이름
     * @param typeText - TypeScript에서 추출한 원본 타입 문자열
     * @param context - 컴포넌트 컨텍스트 정보
     * @returns 포맷팅된 타입 (type: 한 줄, detailedType: 멀티라인)
     */
    async formatPropType(
        propName: string,
        typeText: string,
        context?: TypeFormatterContext,
    ): Promise<FormattedType> {
        let cleanedType = this.cleanTypeText(typeText);

        // render prop은 ComponentRenderFn을 함수 시그니처로 확장
        if (propName === 'render') {
            cleanedType = this.formatRenderPropType(cleanedType);
            this.logger.debug(`Formatted render prop type: ${cleanedType}`);
        }

        // State 타입을 컴포넌트 네임스페이스로 변환 (예: State → Menu.Popup.State)
        if (context?.componentDisplayName) {
            cleanedType = this.addNamespaceToState(cleanedType, context.componentDisplayName);
        }

        // RenderFunctionProps → HTMLProps 변환 (기본값)
        cleanedType = this.replaceRenderFunctionProps(cleanedType);

        // Prettier로 멀티라인 포맷팅
        const detailedType = await this.formatWithPrettier(cleanedType);

        return {
            type: this.toSingleLine(cleanedType),
            detailedType,
        };
    }

    /**
     * render prop 타입을 함수 시그니처로 확장
     * ComponentRenderFn<Props, State> → ((props: Props, state: State) => ReactElement)
     */
    private formatRenderPropType(typeText: string): string {
        return typeText.replace(
            /ComponentRenderFn<([^,]+),\s*([^>]+)>/g,
            '((props: $1, state: $2) => ReactElement)',
        );
    }

    /**
     * State 타입에 컴포넌트 네임스페이스 추가
     * 예: "state: State" → "state: Menu.Popup.State"
     */
    private addNamespaceToState(typeText: string, componentDisplayName: string): string {
        // "State" 단어가 타입 컨텍스트에서 단독으로 사용될 때만 변환
        // state: State, State>, State), State | 등의 패턴 매칭
        return typeText.replace(/\bState\b(?=[>)|\s,]|$)/g, `${componentDisplayName}.State`);
    }

    /**
     * RenderFunctionProps를 HTMLProps로 변환
     * BaseUIComponentProps의 기본값이 HTMLProps이므로 변환
     */
    private replaceRenderFunctionProps(typeText: string): string {
        return typeText.replace(/\bRenderFunctionProps\b/g, 'HTMLProps');
    }

    /**
     * 타입 문자열 정리
     * - import 경로 제거
     * - React.ReactElement 간소화
     * - 불필요한 제네릭 파라미터 제거
     */
    private cleanTypeText(typeText: string): string {
        return (
            typeText
                // import("...").X → X
                .replace(/import\([^)]+\)\./g, '')
                // React.ReactElement<Record<string, unknown>, string | React.JSXElementConstructor<any>> → ReactElement
                .replace(
                    /React\.ReactElement<Record<string,\s*unknown>,\s*string\s*\|\s*React\.JSXElementConstructor<any>>/g,
                    'ReactElement',
                )
                // 남은 React.ReactElement<...> → ReactElement
                .replace(/React\.ReactElement<[^>]+>/g, 'ReactElement')
                // React.ReactElement → ReactElement
                .replace(/React\.ReactElement/g, 'ReactElement')
                // React.ReactNode → ReactNode
                .replace(/React\.ReactNode/g, 'ReactNode')
        );
    }

    /**
     * Prettier로 타입 문자열 포맷팅
     */
    private async formatWithPrettier(typeText: string): Promise<string> {
        try {
            const formatted = await prettier.format(`type _ = ${typeText}`, {
                parser: 'typescript',
                singleQuote: true,
                semi: false,
                printWidth: 60,
            });
            return this.extractTypeFromFormatted(formatted);
        } catch (error) {
            // Prettier가 실패하면 원본 반환
            this.logger.debug(`Prettier formatting failed: ${error}`);
            return typeText;
        }
    }

    /**
     * Prettier 출력에서 타입 부분만 추출
     * 'type _ = ...' 접두사 제거 및 들여쓰기 정규화
     */
    private extractTypeFromFormatted(formatted: string): string {
        const lines = formatted.trimEnd().split('\n');

        // 단일 라인인 경우
        if (lines.length === 1) {
            return lines[0].replace(/^type _ = /, '');
        }

        // 멀티라인인 경우: 첫 줄 제거 및 들여쓰기 정규화
        const codeLines = lines.slice(1);
        const nonEmptyLines = codeLines.filter((l) => l.trim());

        if (nonEmptyLines.length === 0) {
            return lines[0].replace(/^type _ = /, '');
        }

        const minIndent = Math.min(
            ...nonEmptyLines.map((l) => {
                const match = l.match(/^\s*/);
                return match ? match[0].length : 0;
            }),
        );

        return codeLines.map((l) => l.substring(minIndent)).join('\n');
    }

    /**
     * 멀티라인 타입을 한 줄로 변환
     */
    private toSingleLine(typeText: string): string {
        return typeText.replace(/\s+/g, ' ').trim();
    }
}
