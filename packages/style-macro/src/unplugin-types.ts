import type { ManifestShape } from './types';

export interface VaporStyleOptions {
    tokensManifestPath?: string;
    importSource?: string;
    importName?: string;
    include?: (id: string) => boolean;
}

export interface ResolvedOptions {
    manifest: ManifestShape;
    importSource: string;
    importName: string;
    include: (id: string) => boolean;
}

export interface FileRecord {
    css: string;
    classes: string[];
}
