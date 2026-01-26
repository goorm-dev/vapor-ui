import type { API, Collection } from 'jscodeshift';

/**
 * Transform `loop` prop to `loopFocus`.
 *
 * | Original        | Transformed        |
 * |-----------------|--------------------|
 * | `loop`          | `loopFocus`        |
 * | `loop={true}`   | `loopFocus={true}` |
 * | `loop={false}`  | `loopFocus={false}`|
 * | `loop={expr}`   | `loopFocus={expr}` |
 */
export function transformLoop(j: API['jscodeshift'], root: Collection): void {
    root.find(j.JSXAttribute, { name: { name: 'loop' } }).forEach((path) => {
        const attr = path.value;
        attr.name = j.jsxIdentifier('loopFocus');
    });
}
