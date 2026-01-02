import type { JSDoc, PropertySignature, Symbol, Type } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

import type { TypeResolver } from '../type-resolution';
import type { PropertyDoc } from '../types';
import type { Logger } from '../utils/logger';
import { TypeFormatter, type TypeFormatterContext } from './type-formatter';

/**
 * Extracts JSDoc documentation from TypeScript properties
 */
export class DocExtractor {
    private typeFormatter: TypeFormatter;

    constructor(
        private typeResolver: TypeResolver,
        private logger: Logger,
    ) {
        this.typeFormatter = new TypeFormatter(logger);
    }

    /**
     * Extract JSDoc documentation from a property signature
     * @param prop - Property signature to extract docs from
     * @param context - Optional context for type formatting (e.g., component displayName)
     */
    async extractPropertyDoc(
        prop: PropertySignature,
        context?: TypeFormatterContext,
    ): Promise<PropertyDoc> {
        const jsDocs = prop.getJsDocs();
        const type = prop.getType();
        const propName = prop.getName();

        this.logger.debug(`Extracting docs for property: ${propName}`);

        const typeText = type.getText();
        const values = this.parseUnionType(typeText);

        // render와 className 같은 특수 prop은 타입 포맷팅 적용
        // context에 컴포넌트 displayName이 있으면 State → ComponentName.State로 변환
        const { type: formattedType, detailedType } = await this.typeFormatter.formatPropType(
            propName,
            typeText,
            context,
        );

        return {
            name: propName,
            type: formattedType,
            detailedType,
            required: !prop.hasQuestionToken(),
            description: this.extractDescription(jsDocs),
            defaultValue: this.extractDefaultValue(jsDocs),
            deprecated: this.isDeprecated(jsDocs),
            tags: this.extractTags(jsDocs),
            isExternal: !this.typeResolver.isLocalProperty(prop),
            isHTMLIntrinsic: this.typeResolver.isHTMLIntrinsicProp(prop),
            sourceFile: prop.getSourceFile().getFilePath(),
            ...(values && { values }),
        };
    }

    /**
     * Extract property documentation from a Symbol
     * This method handles properties that don't have a PropertySignature declaration
     * (e.g., properties from mapped types like RecipeVariants)
     * @param symbol - Symbol representing the property
     * @param parentType - The parent type containing this property
     * @param context - Optional context for type formatting
     */
    async extractPropertyDocFromSymbol(
        symbol: Symbol,
        parentType: Type,
        context?: TypeFormatterContext,
    ): Promise<PropertyDoc> {
        const propName = symbol.getName();
        this.logger.debug(`Extracting docs for property (from symbol): ${propName}`);

        // Try to get the PropertySignature declaration for JSDoc and other info
        const declarations = symbol.getDeclarations();
        const propSignature = declarations.find((d) => d.isKind(SyntaxKind.PropertySignature)) as
            | PropertySignature
            | undefined;

        // If we have a PropertySignature, use the existing method
        if (propSignature) {
            return this.extractPropertyDoc(propSignature, context);
        }

        // Otherwise, extract info from the symbol itself
        const propType = this.typeResolver.getPropertyType(symbol, parentType);
        const typeText = propType?.getText() ?? 'unknown';
        const values = this.parseUnionType(typeText);

        // Get JSDoc from any available declaration (may be from type alias, mapped type, etc.)
        const jsDocs: JSDoc[] = [];
        for (const decl of declarations) {
            if ('getJsDocs' in decl && typeof decl.getJsDocs === 'function') {
                jsDocs.push(...(decl.getJsDocs() as JSDoc[]));
            }
        }

        // Format the type
        const { type: formattedType, detailedType } = await this.typeFormatter.formatPropType(
            propName,
            typeText,
            context,
        );

        // Determine source file
        const sourceFile =
            declarations.length > 0 ? declarations[0].getSourceFile().getFilePath() : undefined;

        // Check if external (from node_modules)
        const isExternal = sourceFile ? sourceFile.includes('node_modules') : false;

        return {
            name: propName,
            type: formattedType,
            detailedType,
            required: !symbol.isOptional(),
            description: this.extractDescription(jsDocs),
            defaultValue: this.extractDefaultValue(jsDocs),
            deprecated: this.isDeprecated(jsDocs),
            tags: this.extractTags(jsDocs),
            isExternal,
            isHTMLIntrinsic: false, // Mapped type properties are typically not HTML intrinsic
            sourceFile,
            ...(values && { values }),
        };
    }

    /**
     * Extract description from JSDoc comments
     */
    private extractDescription(jsDocs: JSDoc[]): string | undefined {
        if (jsDocs.length === 0) return undefined;

        const description = jsDocs[0].getDescription().trim();
        return description || undefined;
    }

    /**
     * Extract @default tag value from JSDoc
     */
    private extractDefaultValue(jsDocs: JSDoc[]): string | undefined {
        for (const jsDoc of jsDocs) {
            const defaultTag = jsDoc.getTags().find((tag) => tag.getTagName() === 'default');
            if (defaultTag) {
                const comment = defaultTag.getComment();
                if (typeof comment === 'string') {
                    return comment.trim();
                }
            }
        }
        return undefined;
    }

    /**
     * Check if property is deprecated
     */
    private isDeprecated(jsDocs: JSDoc[]): boolean {
        return jsDocs.some((jsDoc) =>
            jsDoc.getTags().some((tag) => tag.getTagName() === 'deprecated'),
        );
    }

    /**
     * Extract all JSDoc tags into a record
     */
    private extractTags(jsDocs: JSDoc[]): Record<string, string> {
        const tags: Record<string, string> = {};

        for (const jsDoc of jsDocs) {
            for (const tag of jsDoc.getTags()) {
                const tagName = tag.getTagName();
                const comment = tag.getComment();
                const commentText = typeof comment === 'string' ? comment : '';
                tags[tagName] = commentText;
            }
        }

        return tags;
    }

    /**
     * Parse union type string into an array of values
     * Examples:
     *   "a" | "b" | "c" → ["a", "b", "c"]
     *   "sm" | "md" | "lg" | undefined → ["sm", "md", "lg"]
     *   string → null (not a union of string literals)
     */
    private parseUnionType(typeText: string): string[] | null {
        // Check if this is a union type with string literals
        if (!typeText.includes('|')) {
            return null; // Not a union type
        }

        // Split by | and extract string literal values
        const parts = typeText.split('|').map((part) => part.trim());
        const values: string[] = [];

        for (const part of parts) {
            // Match string literals: "value" or 'value'
            const match = part.match(/^["'](.+?)["']$/);
            if (match) {
                values.push(match[1]);
            }
            // Skip non-string-literal types (undefined, null, number, etc.)
        }

        // Only return values if we found at least one string literal
        return values.length > 0 ? values : null;
    }
}
