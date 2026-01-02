import type { InterfaceDeclaration, SourceFile, TypeAliasDeclaration } from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Information about a resolved component
 */
export interface ResolvedComponent {
    /** Component name */
    name: string;
    /** Display name (may include dot notation for compound) */
    displayName: string;
    /** The Props interface or type alias */
    propsDeclaration: InterfaceDeclaration | TypeAliasDeclaration | null;
    /** Namespace name if props are in a namespace */
    namespaceName?: string;
    /** Whether the component is a forwardRef component */
    isForwardRef: boolean;
}

/**
 * Component Resolver - locates component implementations and Props interfaces
 *
 * Responsible for:
 * - Finding the Props interface/type for a component
 * - Determining if a component uses forwardRef
 * - Resolving namespace-based Props (e.g., Button.Props)
 */
export class ComponentResolver {
    constructor(private logger: Logger) {}

    /**
     * Find the Props interface for a component
     *
     * Searches in this order:
     * 1. Namespace with .Props (e.g., namespace Button { interface Props {...} })
     * 2. ComponentNameProps interface (e.g., interface ButtonProps {...})
     * 3. Type alias with Props (e.g., type Props = {...})
     */
    findPropsInterface(
        sourceFile: SourceFile,
        componentName: string,
    ): InterfaceDeclaration | TypeAliasDeclaration | null {
        // 1. Try namespace.Props pattern
        const namespaceProps = this.findNamespaceProps(sourceFile, componentName);
        if (namespaceProps) {
            this.logger.debug(`Found Props in namespace: ${componentName}.Props`);
            return namespaceProps;
        }

        // 2. Try ComponentNameProps interface
        const namedInterface = sourceFile.getInterface(`${componentName}Props`);
        if (namedInterface) {
            this.logger.debug(`Found named interface: ${componentName}Props`);
            return namedInterface;
        }

        // 3. Try type alias in namespace
        const namespaceTypeAlias = this.findNamespaceTypeAlias(sourceFile, componentName);
        if (namespaceTypeAlias) {
            this.logger.debug(`Found Props type alias in namespace: ${componentName}.Props`);
            return namespaceTypeAlias;
        }

        this.logger.debug(`No Props interface found for: ${componentName}`);
        return null;
    }

    /**
     * Find Props interface inside a namespace
     */
    private findNamespaceProps(
        sourceFile: SourceFile,
        componentName: string,
    ): InterfaceDeclaration | null {
        const namespace = sourceFile.getModule(componentName);

        if (!namespace) {
            return null;
        }

        // Look for Props interface inside the namespace
        const propsInterface = namespace.getInterface('Props');
        return propsInterface ?? null;
    }

    /**
     * Find Props type alias inside a namespace
     */
    private findNamespaceTypeAlias(
        sourceFile: SourceFile,
        componentName: string,
    ): TypeAliasDeclaration | null {
        const namespace = sourceFile.getModule(componentName);

        if (!namespace) {
            return null;
        }

        // Look for Props type alias inside the namespace
        const propsTypeAlias = namespace.getTypeAlias('Props');
        return propsTypeAlias ?? null;
    }

    /**
     * Check if a component uses forwardRef
     */
    isForwardRefComponent(sourceFile: SourceFile, componentName: string): boolean {
        const varDecl = sourceFile.getVariableDeclaration(componentName);

        if (!varDecl) {
            return false;
        }

        const initializer = varDecl.getInitializer();

        if (!initializer) {
            return false;
        }

        const text = initializer.getText();
        return text.includes('forwardRef');
    }

    /**
     * Resolve all component information from a source file
     */
    resolveComponent(
        sourceFile: SourceFile,
        componentName: string,
        displayName: string,
    ): ResolvedComponent {
        const propsDeclaration = this.findPropsInterface(sourceFile, componentName);
        const isForwardRef = this.isForwardRefComponent(sourceFile, componentName);

        // Check if props are from a namespace
        const namespace = sourceFile.getModule(componentName);
        const namespaceName = namespace ? componentName : undefined;

        return {
            name: componentName,
            displayName,
            propsDeclaration,
            namespaceName,
            isForwardRef,
        };
    }
}
