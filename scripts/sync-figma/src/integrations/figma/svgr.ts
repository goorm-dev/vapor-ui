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

const SHAPE_ELEMENTS = new Set([
    'path',
    'circle',
    'ellipse',
    'rect',
    'line',
    'polygon',
    'polyline',
]);

/**
 * Figma leans on the root fill="none" to keep stroked shapes hollow, but mono icons have to
 * drop that fill so IconBase's colour can be inherited. Spell the intent out on the shape
 * itself first, otherwise the stroke ends up outlining a solid block.
 *
 * Only runs while the root fill="none" is still there, which is exactly the first pass:
 * on later passes removeAttrs has taken it away, and a shape that lost its own fill to
 * removeAttrs (fill="black" plus a stroke) must keep inheriting instead of turning hollow.
 */
const keepStrokedShapesHollow: SvgoPlugin = {
    name: 'keepStrokedShapesHollow',
    fn: (root) => {
        const svg = root.children.find((child) => 'name' in child && child.name === 'svg');
        if (svg == null || !('attributes' in svg) || svg.attributes.fill !== 'none') return null;

        return {
            element: {
                enter: (node) => {
                    if (!SHAPE_ELEMENTS.has(node.name)) return;
                    if (node.attributes.fill != null || node.attributes.stroke == null) return;

                    node.attributes.fill = 'none';
                },
            },
        };
    },
};

const BLACK = /^(#000|#000000|black)$/i;

/**
 * Figma hardcodes stroke="black" on the few stroked mono icons, which makes them ignore the
 * colour IconBase hands down. Point them at currentColor so stroke follows `color` like fill does.
 */
const strokeFollowsCurrentColor: SvgoPlugin = {
    name: 'strokeFollowsCurrentColor',
    fn: () => ({
        element: {
            enter: (node) => {
                if (BLACK.test(node.attributes.stroke ?? ''))
                    node.attributes.stroke = 'currentColor';
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
            // Mono icons take their colour from IconBase's fill, so the root fill="none"
            // and every black fill have to go for it to be inherited.
            ...(isColorIcon
                ? []
                : [
                      keepStrokedShapesHollow,
                      strokeFollowsCurrentColor,
                      {
                          name: 'removeAttrs' as const,
                          params: { attrs: ['svg:fill:none', '*:fill:(#000|#000000|black)'] },
                      },
                  ]),
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
