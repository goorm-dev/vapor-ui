/**
 * Prop filtering module
 *
 * Determines which props to include/exclude from extraction output.
 */
import type { FilterConfig } from '~/models/config';
import type { ParsedComponent, PropSource } from '~/models/pipeline';

const DEPRECATED_CSS_PROPS = new Set([
    '$css',
    'position',
    'display',
    'alignItems',
    'justifyContent',
    'flexDirection',
    'gap',
    'alignContent',
    'padding',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingX',
    'paddingY',
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginX',
    'marginY',
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'border',
    'borderColor',
    'borderRadius',
    'backgroundColor',
    'color',
    'opacity',
    'pointerEvents',
    'overflow',
    'textAlign',
]);

function isHtmlAttribute(name: string): boolean {
    return name.startsWith('data-') || name.startsWith('aria-');
}

function isDeprecatedCssProp(name: string): boolean {
    return DEPRECATED_CSS_PROPS.has(name);
}

export function shouldIncludeProp(
    name: string,
    source: PropSource,
    options: FilterConfig,
    includeSet: Set<string>,
    htmlWhitelist: Set<string>,
): boolean {
    if (includeSet.has(name)) return true;
    if (htmlWhitelist.has(name)) return true;
    if (options.filterExternal && (source === 'react' || source === 'dom' || source === 'external'))
        return false;
    if (options.filterHtml && isHtmlAttribute(name)) return false;
    if (options.filterSprinkles && source === 'sprinkles') return false;
    if (options.filterSprinkles && isDeprecatedCssProp(name)) return false;
    return true;
}

export function filterParsedComponents(
    components: ParsedComponent[],
    options: FilterConfig,
): ParsedComponent[] {
    const includeSet = new Set(options.include ?? []);
    const htmlWhitelist = new Set(options.includeHtml ?? []);
    return components.map((component) => ({
        ...component,
        props: component.props.filter((prop) =>
            shouldIncludeProp(prop.name, prop.source, options, includeSet, htmlWhitelist),
        ),
    }));
}
