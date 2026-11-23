import type { Config } from '@svgr/core';

type SvgoPlugin = Extract<
    NonNullable<NonNullable<Config['svgoConfig']>['plugins']>[number],
    { fn: unknown }
>;

type Jsx = Parameters<NonNullable<Config['template']>>[0]['jsx'];
type Node = { type: string; [key: string]: unknown };

/**
 * Turn every attribute string that holds `prefix` into a template literal on the runtime `id`, so
 * each rendered instance gets its own ids. Returns whether anything was rewritten.
 */
const bindIdsToRuntime = (node: Node, prefix: string): boolean => {
    let bound = false;
    for (const attr of (node.openingElement as { attributes: Node[] }).attributes) {
        const value = attr.value as Node | null;
        if (value?.type !== 'StringLiteral' || !(value.value as string).includes(prefix)) continue;
        const parts = (value.value as string).split(prefix);
        attr.value = {
            type: 'JSXExpressionContainer',
            expression: {
                type: 'TemplateLiteral',
                quasis: parts.map((raw, i) => ({
                    type: 'TemplateElement',
                    value: { raw, cooked: raw },
                    tail: i === parts.length - 1,
                })),
                expressions: parts.slice(1).map(() => ({ type: 'Identifier', name: 'id' })),
            },
        };
        bound = true;
    }
    for (const child of node.children as Node[]) {
        if (child.type === 'JSXElement' && bindIdsToRuntime(child, prefix)) bound = true;
    }
    return bound;
};

/**
 * Wrap the SVG in IconBase instead of rendering a bare <svg>. Icons whose SVG keeps ids (masks,
 * clip paths, gradients) read them from useIconId, because a static id repeats when the same icon
 * renders twice on one page.
 */
const buildTemplate =
    (idPrefix: string): Config['template'] =>
    ({ componentName, jsx }, { tpl }) => {
        const identifier = {
            type: 'JSXIdentifier',
            name: 'IconBase',
        } as Jsx['openingElement']['name'];
        jsx.openingElement.name = identifier;
        if (jsx.closingElement) jsx.closingElement.name = identifier;
        jsx.openingElement.attributes.push({
            type: 'JSXSpreadAttribute',
            argument: { type: 'Identifier', name: 'props' },
        } as Jsx['openingElement']['attributes'][number]);

        if (!bindIdsToRuntime(jsx as unknown as Node, idPrefix)) {
            return tpl`
import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ${componentName} = (props: IconProps) => (
    ${jsx}
);

export default ${componentName};
`;
        }

        const prefix = { type: 'StringLiteral', value: idPrefix } as unknown as string;
        return tpl`
import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';
import { useIconId } from '~/components/use-icon-id';

const ${componentName} = (props: IconProps) => {
    const id = useIconId(${prefix});
    return (
        ${jsx}
    );
};

export default ${componentName};
`;
    };

const BLACK = /^(#000|#000000|black)$/i;

/**
 * Figma paints mono icons with a literal black fill (and stroke on a few), which would ignore the
 * colour IconBase hands down. Point both at currentColor; the root fill="none" Figma always emits
 * stays put so stroked shapes keep inheriting `none` and stay hollow.
 */
const blackFollowsCurrentColor: SvgoPlugin = {
    name: 'blackFollowsCurrentColor',
    fn: () => ({
        element: {
            enter: (node) => {
                for (const attr of ['fill', 'stroke'] as const) {
                    if (BLACK.test(node.attributes[attr] ?? ''))
                        node.attributes[attr] = 'currentColor';
                }
            },
        },
    }),
};

/**
 * Build the SVGR config for a single icon.
 *
 * Passing svgoConfig replaces SVGR's default svgo config wholesale, so prefixIds has to be
 * listed explicitly. Without it every icon's ids collapse to `a`, and two icons on one page
 * make the second reference the first one's mask.
 */
const buildConfig = ({
    iconName,
    isColorIcon,
}: {
    iconName: string;
    isColorIcon: boolean;
}): Config => {
    const idPrefix = `vapor-icons-${isColorIcon ? 'color' : 'mono'}-${iconName}`;
    return {
        typescript: true,
        template: buildTemplate(idPrefix),
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
            multipass: true,
            plugins: [
                // removeViewBox would drop the viewBox because it matches width/height;
                // removeDimensions then drops width/height instead, leaving IconBase in charge of size.
                { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
                'removeDimensions',
                {
                    name: 'prefixIds',
                    params: { prefix: idPrefix },
                },
                // Mono icons follow the consumer's `color`; colour icons keep Figma's palette.
                ...(isColorIcon ? [] : [blackFollowsCurrentColor]),
            ],
        },
    };
};

export { buildConfig };
