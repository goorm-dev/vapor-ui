import { Box, Text } from '@vapor-ui/core';
import { Pre } from 'fumadocs-ui/components/codeblock';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

import AllComponentsContainer from '~/components/all-components-container';
import { CodeBlock } from '~/components/code-block/code-block';
import ComponentsCard from '~/components/component-card/component-card';
import { ComponentPropsTable } from '~/components/component-props-table';
import { Demo } from '~/components/demo/demo';
import FoundationSizeTabs from '~/components/foundation-size-tabs';
import FoundationTypographyTabs from '~/components/foundation-typography-tabs';
import IconList from '~/components/icon-list-tabs/icon-list-tabs';
import InstallSelector from '~/components/install-selector/install-selector';
import PropsTable from '~/components/props-table';

import { ColorPalette } from './components/color-swatch';
import { Tabs } from './components/docs-tabs';
import { BasicColor, SemanticColor } from './components/foundation-color-tabs';
import IntroLinkCardContainer from './components/intro-link-card-container';

export const getMDXComponents = (components?: MDXComponents): MDXComponents => {
    return {
        ...defaultMdxComponents,

        pre: ({ ref: _ref, ...props }) => (
            <CodeBlock {...props} className="bg-v-background-canvas-100">
                <Pre>{props.children}</Pre>
            </CodeBlock>
        ),
        CodeBlock,
        ...TabsComponents,
        Demo,
        InstallSelector,
        AllComponentsContainer,
        ComponentPropsTable,
        ComponentsCard,
        FoundationSizeTabs,
        FoundationTypographyTabs,
        IconList,
        PropsTable,
        ColorPalette,
        Text,
        Box,
        BasicColor,
        SemanticColor,
        Tabs,
        Image,
        IntroLinkCardContainer,
        Step,
        Steps,
        ...components,
    } as MDXComponents;
};
