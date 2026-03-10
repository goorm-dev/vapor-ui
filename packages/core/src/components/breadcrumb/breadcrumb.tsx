'use client';

import { forwardRef, useMemo } from 'react';

import { useRender } from '@base-ui/react/use-render';
import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './breadcrumb.css';
import type { BreadcrumbItemVariants } from './breadcrumb.css';

type BreadcrumbVariants = BreadcrumbItemVariants;
type BreadcrumbContext = Omit<BreadcrumbVariants, 'current'>;

const [BreadcrumbProvider, useBreadcrumbContext] = createContext<BreadcrumbContext>({
    name: 'Breadcrumb',
    hookName: 'useBreadcrumbContext',
    providerName: 'BreadcrumbProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbRootPrimitive = forwardRef<HTMLElement, BreadcrumbRootPrimitive.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);
        const [variantProps, otherProps] = createSplitProps<BreadcrumbContext>()(componentProps, [
            'size',
        ]);

        const element = useRender({
            ref,
            render,
            defaultTagName: 'nav',
            props: {
                'aria-label': 'Breadcrumb',
                ...otherProps,
            },
        });

        return <BreadcrumbProvider value={variantProps}>{element}</BreadcrumbProvider>;
    },
);
BreadcrumbRootPrimitive.displayName = 'Breadcrumb.RootPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.ListPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbListPrimitive = forwardRef<HTMLOListElement, BreadcrumbListPrimitive.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRender({
            ref,
            render,
            defaultTagName: 'ol',
            props: {
                className: clsx(styles.list, className),
                ...componentProps,
            },
        });
    },
);
BreadcrumbListPrimitive.displayName = 'Breadcrumb.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Root
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbRoot.Props>(
    ({ children, ...props }, ref) => {
        return (
            <BreadcrumbRootPrimitive ref={ref} {...props}>
                <BreadcrumbListPrimitive>{children}</BreadcrumbListPrimitive>
            </BreadcrumbRootPrimitive>
        );
    },
);
BreadcrumbRoot.displayName = 'Breadcrumb.Root';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbItemPrimitive = forwardRef<HTMLLIElement, BreadcrumbItemPrimitive.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRender({
            ref,
            render,
            defaultTagName: 'li',
            props: {
                className: clsx(styles.item, className),
                ...componentProps,
            },
        });
    },
);
BreadcrumbItemPrimitive.displayName = 'Breadcrumb.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.LinkPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbLinkPrimitive = forwardRef<HTMLAnchorElement, BreadcrumbLinkPrimitive.Props>(
    (props, ref) => {
        const { render, current = false, className, ...componentProps } = resolveStyles(props);
        const { size } = useBreadcrumbContext();

        const state: BreadcrumbLinkPrimitive.State = useMemo(() => ({ current }), [current]);

        return useRender({
            ref,
            render,
            state,
            defaultTagName: 'a',
            props: {
                role: current ? 'link' : undefined,
                'aria-disabled': current ? 'true' : undefined,
                'aria-current': current ? 'page' : undefined,
                className: clsx(styles.link({ size, current }), className),
                ...componentProps,
            },
        });
    },
);
BreadcrumbLinkPrimitive.displayName = 'Breadcrumb.LinkPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbItem.Props>((props, ref) => {
    return (
        <BreadcrumbItemPrimitive>
            <BreadcrumbLinkPrimitive ref={ref} {...props} />
        </BreadcrumbItemPrimitive>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparator.Props>(
    (props, ref) => {
        const {
            render,
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);

        const { size } = useBreadcrumbContext();

        const childrenRender = createRender(childrenProp, <SlashOutlineIcon />);
        const children = useRender({
            render: childrenRender,
            props: { width: '100%', height: '100%' },
        });

        return useRender({
            ref,
            render,
            defaultTagName: 'li',
            props: {
                role: 'presentation',
                'aria-hidden': 'true',
                className: clsx(styles.icon({ size }), className),
                children,
                ...componentProps,
            },
        });
    },
);
BreadcrumbSeparator.displayName = 'Breadcrumb.Separator';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.EllipsisPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbEllipsisPrimitive = forwardRef<
    HTMLSpanElement,
    BreadcrumbEllipsisPrimitive.Props
>((props, ref) => {
    const { render, className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useBreadcrumbContext();

    const childrenRender = createRender(childrenProp, <MoreCommonOutlineIcon />);
    const children = useRender({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return useRender({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: clsx(styles.icon({ size }), className),
            children,
            ...componentProps,
        },
    });
});
BreadcrumbEllipsisPrimitive.displayName = 'Breadcrumb.EllipsisPrimitive';

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbEllipsis
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisPrimitive.Props>(
    (props, ref) => {
        return (
            <BreadcrumbItemPrimitive>
                <BreadcrumbEllipsisPrimitive ref={ref} {...props} />
            </BreadcrumbItemPrimitive>
        );
    },
);
BreadcrumbEllipsis.displayName = 'Breadcrumb.Ellipsis';

/* -----------------------------------------------------------------------------------------------*/

export namespace BreadcrumbRootPrimitive {
    export type State = {};
    export type Props = BreadcrumbContext &
        VaporUIComponentProps<'nav', BreadcrumbRootPrimitive.State>;
}

export namespace BreadcrumbListPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'ol', State>;
}

export namespace BreadcrumbRoot {
    export type State = BreadcrumbRootPrimitive.State;
    export type Props = BreadcrumbRootPrimitive.Props;
}

export namespace BreadcrumbItemPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'li', State>;
}

export interface BreadcrumbLinkPrimitiveState {
    [key: string]: unknown;
    /**
     * Whether the link is the currently active page.
     */
    current: boolean;
}

export namespace BreadcrumbLinkPrimitive {
    export type State = BreadcrumbLinkPrimitiveState;
    export type Props = BreadcrumbVariants &
        VaporUIComponentProps<'a', BreadcrumbLinkPrimitive.State>;
}

export namespace BreadcrumbItem {
    export type State = BreadcrumbLinkPrimitive.State;
    export type Props = BreadcrumbLinkPrimitive.Props;
}

export namespace BreadcrumbSeparator {
    export type State = {};
    export type Props = VaporUIComponentProps<'li', State>;
}

export namespace BreadcrumbEllipsisPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}

export namespace BreadcrumbEllipsis {
    export type State = BreadcrumbEllipsisPrimitive.State;
    export type Props = BreadcrumbEllipsisPrimitive.Props;
}
