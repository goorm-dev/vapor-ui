import compositesEntries from '../../composites/figma-entries.json';

export const PACKAGES = ['core', 'composites', 'icons'] as const;
export type Pkg = (typeof PACKAGES)[number];

const LIBRARY_MARKER = { core: '💙', icons: '❤️', composites: '🩵' } satisfies Record<Pkg, string>;
const MARKED_SEGMENT = new RegExp(`(^|/)(${Object.values(LIBRARY_MARKER).join('|')})`, 'u');

export const hasLibraryMarker = (nameOrLayerPath: string) => MARKED_SEGMENT.test(nameOrLayerPath);

export const isCoreComponent = (name: string) => name.includes(LIBRARY_MARKER.core);

// A composites component's Figma name carries no marker, so without composites installed only its key tells it from
// another library's. ponytail: keys as of this build; a component composites publishes later goes unseen until rebuilt.
const compositesKeys = new Set<string | undefined>(Object.keys(compositesEntries));
export const isCompositesKey = (key: string | undefined) => compositesKeys.has(key);
