import type { ReactNode } from 'react';

import { Text } from '@vapor-ui/core';

/* -------------------------------------------------------------------------------------------------
 * PanelSectionWrapper.Root
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionWrapperRootProps {
    children: ReactNode;
}

const PanelSectionWrapperRoot = ({ children }: PanelSectionWrapperRootProps) => {
    return <section className="flex flex-col gap-v-100">{children}</section>;
};

/* -------------------------------------------------------------------------------------------------
 * PanelSectionWrapper.Title
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionWrapperTitleProps {
    children: ReactNode;
}

const PanelSectionWrapperTitle = ({ children }: PanelSectionWrapperTitleProps) => {
    return (
        <Text typography="subtitle1" render={<h3 />}>
            {children}
        </Text>
    );
};

/* -------------------------------------------------------------------------------------------------
 * PanelSectionWrapper.SubTitle
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionWrapperSubTitleProps {
    children: ReactNode;
}

const PanelSectionWrapperSubTitle = ({ children }: PanelSectionWrapperSubTitleProps) => {
    return (
        <Text typography="subtitle2" render={<p />} foreground="hint-100">
            {children}
        </Text>
    );
};

/* -------------------------------------------------------------------------------------------------
 * PanelSectionWrapper.Contents
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionWrapperContentsProps {
    children: ReactNode;
}

const PanelSectionWrapperContents = ({ children }: PanelSectionWrapperContentsProps) => {
    return <div>{children}</div>;
};

/* -----------------------------------------------------------------------------------------------*/

export const PanelSectionWrapper = {
    Root: PanelSectionWrapperRoot,
    Title: PanelSectionWrapperTitle,
    SubTitle: PanelSectionWrapperSubTitle,
    Contents: PanelSectionWrapperContents,
};