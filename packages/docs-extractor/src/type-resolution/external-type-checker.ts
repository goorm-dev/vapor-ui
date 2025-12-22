import type { PropertySignature, SourceFile, Symbol } from 'ts-morph';

import type { Logger } from '../utils/logger.js';

/**
 * Checks if types/properties are external (from node_modules)
 */
export class ExternalTypeChecker {
    constructor(private logger: Logger) {}

    /**
     * Check if a type is from an external library (node_modules)
     */
    isExternalType(symbol: Symbol): boolean {
        const declarations = symbol.getDeclarations();
        const isExternal = declarations.some((decl) => {
            const filePath = decl.getSourceFile().getFilePath();
            return filePath.includes('node_modules');
        });

        if (isExternal) {
            this.logger.debug(`Symbol ${symbol.getName()} is external`);
        }

        return isExternal;
    }

    /**
     * Check if a property is defined locally (not in node_modules)
     */
    isLocalProperty(prop: PropertySignature): boolean {
        const sourceFile = prop.getSourceFile();
        const filePath = sourceFile.getFilePath();

        const isLocal =
            filePath.includes('packages/core/src') && !filePath.includes('node_modules');

        this.logger.debug(
            `Property ${prop.getName()} is ${isLocal ? 'local' : 'external'} (${filePath})`,
        );

        return isLocal;
    }

    /**
     * Check if a source file is from node_modules
     */
    isExternalSourceFile(sourceFile: SourceFile): boolean {
        return sourceFile.getFilePath().includes('node_modules');
    }

    /**
     * Check if a property is an HTML intrinsic element prop from @types/react
     * These props come from HTMLAttributes, AriaAttributes, or DOMAttributes
     */
    isHTMLIntrinsicProp(prop: PropertySignature): boolean {
        const sourceFile = prop.getSourceFile();
        const filePath = sourceFile.getFilePath();

        // Must be from @types/react
        if (!filePath.includes('node_modules/@types/react')) {
            return false;
        }

        // Check if property comes from HTML-related interfaces
        const symbol = prop.getSymbol();
        if (!symbol) return false;

        const declarations = symbol.getDeclarations();
        for (const decl of declarations) {
            // Check the parent interface/type name
            const parent = decl.getParent();
            if (!parent) continue;

            const parentText = parent.getText();

            // Check if it's from HTMLAttributes, AriaAttributes, or DOMAttributes
            if (
                parentText.includes('HTMLAttributes') ||
                parentText.includes('AriaAttributes') ||
                parentText.includes('DOMAttributes')
            ) {
                this.logger.debug(`Property ${prop.getName()} is HTML intrinsic`);
                return true;
            }
        }

        return false;
    }
}
