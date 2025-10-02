import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';

import { Text } from '@vapor-ui/core';

interface PanelSectionContextValue {
    titleId: string;
    registerTitle: () => void;
    setCurrentSubTitleId: (id: string) => void;
    getAriaProps: () => {
        'aria-labelledby'?: string;
        'aria-describedby'?: string;
    };
}

const PanelSectionContext = createContext<PanelSectionContextValue | null>(null);

const usePanelSectionContext = () => {
    const context = useContext(PanelSectionContext);
    if (!context) {
        throw new Error('PanelSection compound components must be used within PanelSection');
    }
    return context;
};

/* -------------------------------------------------------------------------------------------------
 * PanelSection.Root
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionRootProps {
    children: ReactNode;
}

const PanelSectionRoot = ({ children }: PanelSectionRootProps) => {
    const titleId = useId();
    const hasTitleRef = useRef(false);
    const currentSubTitleIdRef = useRef<string | null>(null);

    const contextValue: PanelSectionContextValue = useMemo(
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
        <PanelSectionContext.Provider value={contextValue}>
            <section className="flex flex-col gap-v-100">{children}</section>
        </PanelSectionContext.Provider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * PanelSection.Title
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionTitleProps {
    children: ReactNode;
}

const PanelSectionTitle = ({ children }: PanelSectionTitleProps) => {
    const { titleId, registerTitle } = usePanelSectionContext();

    registerTitle();

    return (
        <Text id={titleId} typography="subtitle1" render={<h3 />}>
            {children}
        </Text>
    );
};

/* -------------------------------------------------------------------------------------------------
 * PanelSection.SubTitle
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionSubTitleProps {
    children: ReactNode;
}

const PanelSectionSubTitle = ({ children }: PanelSectionSubTitleProps) => {
    const subTitleId = useId();
    const { setCurrentSubTitleId } = usePanelSectionContext();

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
 * PanelSection.Contents
 * -----------------------------------------------------------------------------------------------*/

interface PanelSectionContentsProps {
    children: ReactNode;
}

const PanelSectionContents = ({ children }: PanelSectionContentsProps) => {
    const { getAriaProps } = usePanelSectionContext();

    return <div {...getAriaProps()}>{children}</div>;
};

/* -----------------------------------------------------------------------------------------------*/

const PanelSection = {
    Root: PanelSectionRoot,
    Title: PanelSectionTitle,
    SubTitle: PanelSectionSubTitle,
    Contents: PanelSectionContents,
};

export default PanelSection;
