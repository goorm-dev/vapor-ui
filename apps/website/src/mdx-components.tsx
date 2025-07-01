import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import AccessibilityTable from '~/components/accessibility-table';
import AllComponentsContainer from '~/components/all-components-container';
import ComponentsCard from '~/components/component-card/component-card';
import FoundationCard from '~/components/foundation-card/foundation-card';
import FoundationColorTabs from '~/components/foundation-color-tabs';
import FoundationList from '~/components/foundation-list/foundation-list';
import FoundationSizeTabs from '~/components/foundation-size-tabs';
import FoundationTypographyTabs from '~/components/foundation-typography-tabs';
import IconList from '~/components/icon-list-tabs/icon-list-tabs';
import InstallSelector from '~/components/install-selector/install-selector';
import { LiveCodeBlock } from '~/components/live-code-block';
import PropsTable from '~/components/props-table';

export const getMDXComponents = (components?: MDXComponents): MDXComponents => {
    return {
        ...defaultMdxComponents,

        pre: ({ ref: _ref, ...props }) => (
            <CodeBlock {...props}>
                <Pre>{props.children}</Pre>
            </CodeBlock>
        ),
        CodeBlock,
        ...TabsComponents,

        InstallSelector,
        AllComponentsContainer,
        ComponentsCard,
        FoundationColorTabs,
        FoundationSizeTabs,
        FoundationTypographyTabs,
        FoundationCard,
        FoundationList,
        IconList,
        PropsTable,
        LiveCodeBlock,
        AccessibilityTable: AccessibilityTable as unknown as (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: any,
        ) => JSX.Element,
        ...components,
    } as MDXComponents;
};
