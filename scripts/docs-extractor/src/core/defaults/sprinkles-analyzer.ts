import fs from 'node:fs';
import path from 'node:path';

export interface PropDefinition {
    usesToken: boolean;
    tokenPath?: string;
    cssProperty: string;
    displayTypeName?: string;
}

export interface SprinklesMeta {
    tokenProps: string[];
    nonTokenProps: string[];
    propDefinitions: Record<string, PropDefinition>;
}

let cachedMeta: SprinklesMeta | null = null;
let cachedMetaPath: string | null = null;

export function loadSprinklesMeta(metaPath: string): SprinklesMeta | null {
    const resolvedPath = path.resolve(process.cwd(), metaPath);

    // Return cached if same path
    if (cachedMeta && cachedMetaPath === resolvedPath) {
        return cachedMeta;
    }

    if (!fs.existsSync(resolvedPath)) {
        console.warn(
            `sprinkles-meta.json not found at ${resolvedPath}. Sprinkles filtering disabled.`,
        );
        return null;
    }

    try {
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        cachedMeta = JSON.parse(content) as SprinklesMeta;
        cachedMetaPath = resolvedPath;
        return cachedMeta;
    } catch (error) {
        console.warn(`Failed to parse sprinkles metadata: ${error}`);
        return null;
    }
}

export function isTokenBasedSprinklesProp(propName: string, meta: SprinklesMeta): boolean {
    return meta.tokenProps.includes(propName);
}

export function isSprinklesProp(propName: string, meta: SprinklesMeta): boolean {
    return propName in meta.propDefinitions;
}

export function getAllSprinklesProps(meta: SprinklesMeta): string[] {
    return [...meta.tokenProps, ...meta.nonTokenProps];
}

export function getTokenSprinklesProps(meta: SprinklesMeta): string[] {
    return [...meta.tokenProps];
}

export function getNonTokenSprinklesProps(meta: SprinklesMeta): string[] {
    return [...meta.nonTokenProps];
}

export function clearCache(): void {
    cachedMeta = null;
    cachedMetaPath = null;
}

/**
 * sprinkles prop의 displayTypeName을 반환합니다.
 * 해당 prop이 sprinkles prop이 아니거나 displayTypeName이 없으면 null 반환
 */
export function getSprinklesDisplayType(propName: string, meta: SprinklesMeta): string | null {
    const definition = meta.propDefinitions[propName];
    if (!definition) return null;

    return definition.displayTypeName ?? null;
}
