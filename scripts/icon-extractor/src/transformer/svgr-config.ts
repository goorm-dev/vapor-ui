import type { Config } from '@svgr/core';

type SvgoPlugin = Extract<
    NonNullable<NonNullable<Config['svgoConfig']>['plugins']>[number],
    { fn: unknown }
>;

type Jsx = Parameters<NonNullable<Config['template']>>[0]['jsx'];
type Node = { type: string; [key: string]: unknown };
type Attribute = { value?: Node | null };

const findIdAttributes = (node: Node, prefix: string): Attribute[] => [
    ...(node.openingElement as { attributes: Attribute[] }).attributes.filter(
        ({ value }) => value?.type === 'StringLiteral' && (value.value as string).includes(prefix),
    ),
    ...(node.children as Node[])
        .filter((child) => child.type === 'JSXElement')
        .flatMap((child) => findIdAttributes(child, prefix)),
];

const bindToRuntimeId = (attribute: Attribute, prefix: string) => {
    const parts = ((attribute.value as Node).value as string).split(prefix);
    attribute.value = {
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
};

/**
 * Wrap the SVG in IconBase instead of rendering a bare <svg>.
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

        const idAttributes = findIdAttributes(jsx as unknown as Node, idPrefix);
        if (idAttributes.length === 0) {
            return tpl`
import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ${componentName} = (props: IconProps) => (
    ${jsx}
);

export default ${componentName};
`;
        }

        for (const attribute of idAttributes) bindToRuntimeId(attribute, idPrefix);
        if (JSON.stringify(jsx).includes(idPrefix)) {
            throw new Error(`${idPrefix}: an id stayed static outside a string attribute`);
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
