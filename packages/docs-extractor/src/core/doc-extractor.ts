import type { PropertySignature, JSDoc } from 'ts-morph';
import type { PropertyDoc } from '../types/index.js';
import type { TypeResolver } from './type-resolver.js';
import type { Logger } from '../utils/logger.js';

/**
 * Extracts JSDoc documentation from TypeScript properties
 */
export class DocExtractor {
    constructor(
        private typeResolver: TypeResolver,
        private logger: Logger,
    ) {}

    /**
     * Extract JSDoc documentation from a property signature
     */
    extractPropertyDoc(prop: PropertySignature): PropertyDoc {
        const jsDocs = prop.getJsDocs();
        const type = prop.getType();
        const propName = prop.getName();

        this.logger.debug(`Extracting docs for property: ${propName}`);

        const typeText = type.getText();
        const values = this.parseUnionType(typeText);

        return {
            name: propName,
            type: typeText,
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
        return jsDocs.some((jsDoc) => jsDoc.getTags().some((tag) => tag.getTagName() === 'deprecated'));
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
