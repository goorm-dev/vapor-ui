import type { Config } from '@svgr/core';
import { transform } from '@svgr/core';

type SvgoPlugin = Extract<
    NonNullable<NonNullable<Config['svgoConfig']>['plugins']>[number],
    { fn: unknown }
>;

/**
 * Wrap the SVG in IconBase instead of rendering a bare <svg>.
 */
const template: Config['template'] = ({ componentName, jsx }, { tpl }) => {
    const identifier = {
        type: 'JSXIdentifier',
        name: 'IconBase',
    } as typeof jsx.openingElement.name;
    jsx.openingElement.name = identifier;
    if (jsx.closingElement) jsx.closingElement.name = identifier;
    jsx.openingElement.attributes.push({
        type: 'JSXSpreadAttribute',
        argument: { type: 'Identifier', name: 'props' },
    } as (typeof jsx.openingElement.attributes)[number]);

    return tpl`
import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ${componentName} = (props: IconProps) => (
    ${jsx}
);

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
}): Config => ({
    typescript: true,
    template,
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
                params: { prefix: `vapor-icons-${isColorIcon ? 'color' : 'mono'}-${iconName}` },
            },
            // Mono icons follow the consumer's `color`; colour icons keep Figma's palette.
            ...(isColorIcon ? [] : [blackFollowsCurrentColor]),
        ],
    },
});

const svgToIconComponent = ({
    svg,
    iconName,
    isColorIcon,
}: {
    svg: string;
    iconName: string;
    isColorIcon: boolean;
}) => transform(svg, buildConfig({ iconName, isColorIcon }), { componentName: iconName });

export { svgToIconComponent };
