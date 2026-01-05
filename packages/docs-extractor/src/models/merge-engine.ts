import type { Logger } from '../utils/logger';
import type { MergedPropertyDoc, PropertyDoc } from './types';

/**
 * Merges local and external JSDoc documentation with local precedence
 */
export class MergeEngine {
    constructor(private logger: Logger) {}

    /**
     * Merge local and external property docs
     * Local documentation always takes precedence
     * @param localProps - Properties defined locally
     * @param externalProps - Properties from external library
     * @param includeHTMLProps - Whether to include HTML intrinsic props (default: false)
     * @returns Merged property documentation
     */
    mergeDocs(
        localProps: PropertyDoc[],
        externalProps: PropertyDoc[],
        includeHTMLProps: boolean = false,
    ): MergedPropertyDoc[] {
        const merged = new Map<string, MergedPropertyDoc>();

        // Filter external props if needed
        const filteredExternalProps = includeHTMLProps
            ? externalProps
            : externalProps.filter((p) => !p.isHTMLIntrinsic);

        this.logger.debug(
            `Merging docs: ${localProps.length} local props, ${filteredExternalProps.length} external props (${externalProps.length - filteredExternalProps.length} HTML props filtered)`,
        );

        // First, add all external properties
        for (const extProp of filteredExternalProps) {
            merged.set(extProp.name, {
                ...extProp,
                source: 'external',
                externalDoc: extProp,
            });
        }

        // Then override with local properties (local takes precedence)
        for (const localProp of localProps) {
            const existing = merged.get(localProp.name);

            if (existing && existing.source === 'external') {
                // Merge: local JSDoc + external JSDoc (local wins for conflicts)
                this.logger.debug(`Merging property: ${localProp.name}`);
                merged.set(localProp.name, {
                    ...localProp,
                    description: localProp.description || existing.description,
                    defaultValue: localProp.defaultValue || existing.defaultValue,
                    tags: { ...existing.tags, ...localProp.tags },
                    source: 'merged',
                    localDoc: localProp,
                    externalDoc: existing.externalDoc,
                });
            } else {
                // Pure local property
                this.logger.debug(`Adding local property: ${localProp.name}`);
                merged.set(localProp.name, {
                    ...localProp,
                    source: 'local',
                    localDoc: localProp,
                });
            }
        }

        return Array.from(merged.values());
    }

    /**
     * Filter props to only include local or external ones
     */
    filterPropsBySource(
        props: PropertyDoc[],
        includeLocal: boolean,
        includeExternal: boolean,
    ): PropertyDoc[] {
        return props.filter((prop) => {
            if (includeLocal && !prop.isExternal) return true;
            if (includeExternal && prop.isExternal) return true;
            return false;
        });
    }
}
