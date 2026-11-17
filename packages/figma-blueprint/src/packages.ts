// The @vapor-ui packages whose Code Connect templates this package runs, and how a Figma instance shows that it comes
// from one of their libraries. Every list of packages is this one or is checked against it (Record<Pkg, ...>).
import compositesEntries from '../../composites/figma-entries.json';

export const PACKAGES = ['core', 'composites', 'icons'] as const;
export type Pkg = (typeof PACKAGES)[number];

// A name or layer path marked as a library component: 💙 core, ❤️ icons, and 🩵 on a composites part's layer
// ("Dialog/🩵Action"), at the start of the name or of a path segment.
export const marked = (s: string) => /(^|\/)(💙|❤️|🩵)/u.test(s);

// core's library components, the ones a Code Connect link is expected for: 💙 anywhere in the name.
export const isCoreComponent = (name: string) => name.includes('💙');

// A composites component's Figma name carries no marker, so without composites installed only its key tells it from
// another library's. ponytail: keys as of this build; a component composites publishes later goes unseen until rebuilt.
const compositesKeys = new Set<string | undefined>(Object.keys(compositesEntries));
export const isCompositesKey = (key: string | undefined) => compositesKeys.has(key);
