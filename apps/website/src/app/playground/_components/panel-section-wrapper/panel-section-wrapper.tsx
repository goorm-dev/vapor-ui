import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';

import { Text } from '@vapor-ui/core';

interface PanelSectionWrapperContextValue {
    titleId: string;
    registerTitle: () => void;
    setCurrentSubTitleId: (id: string) => void;
    getAriaProps: () => {
        'aria-labelledby'?: string;
        'aria-describedby'?: string;
    };
}

const PanelSectionWrapperContext = createContext<PanelSectionWrapperContextValue | null>(null);

const usePanelSectionWrapperContext = () => {
    const context = useContext(PanelSectionWrapperContext);
    if (!context) {
        throw new Error(
            'PanelSectionWrapper compound components must be used within PanelSectionWrapper',
        );
    }
    return context;
};

/* -------------------------------------------------------------------------------------------------
 * PanelSectionWrapper.Root
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionWrapperRootProps {
    children: ReactNode;
}

const PanelSectionWrapperRoot = ({ children }: PanelSectionWrapperRootProps) => {
    const titleId = useId();
    const hasTitleRef = useRef(false);
    const currentSubTitleIdRef = useRef<string | null>(null);

    const contextValue: PanelSectionWrapperContextValue = useMemo(
        () => ({
            titleId,
            registerTitle: () => {
                hasTitleRef.current = true;
            },
            setCurrentSubTitleId: (id: string) => {
                currentSubTitleIdRef.current = id;
            },
            getAriaProps: () => {
                const props: { 'aria-labelledby'?: string; 'aria-describedby'?: string } = {};

                if (hasTitleRef.current) {
                    props['aria-labelledby'] = titleId;
                }

                if (currentSubTitleIdRef.current) {
                    props['aria-describedby'] = currentSubTitleIdRef.current;
                    currentSubTitleIdRef.current = null; // 사용 후 초기화
                }

                return props;
            },
        }),
        [titleId],
    );

    return (
        <PanelSectionWrapperContext.Provider value={contextValue}>
            <section className="flex flex-col gap-v-100">{children}</section>
        </PanelSectionWrapperContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * PanelSectionWrapper.Title
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionWrapperTitleProps {
    children: ReactNode;
}

const PanelSectionWrapperTitle = ({ children }: PanelSectionWrapperTitleProps) => {
    const { titleId, registerTitle } = usePanelSectionWrapperContext();

    registerTitle();

    return (
        <Text id={titleId} typography="subtitle1" render={<h3 />}>
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
    const subTitleId = useId();
    const { setCurrentSubTitleId } = usePanelSectionWrapperContext();

    useEffect(() => {
        setCurrentSubTitleId(subTitleId);
    }, [subTitleId, setCurrentSubTitleId]);

    return (
        <Text id={subTitleId} typography="subtitle2" render={<p />} foreground="hint-100">
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
    const { getAriaProps } = usePanelSectionWrapperContext();

    return <div {...getAriaProps()}>{children}</div>;
};

/* -----------------------------------------------------------------------------------------------*/

export const PanelSectionWrapper = {
    Root: PanelSectionWrapperRoot,
    Title: PanelSectionWrapperTitle,
    SubTitle: PanelSectionWrapperSubTitle,
    Contents: PanelSectionWrapperContents,
};
