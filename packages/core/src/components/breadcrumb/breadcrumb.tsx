'use client';

import { forwardRef, useMemo } from 'react';

import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
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

/**
 * A primitive root that provides size context to all descendant breadcrumb parts. Renders a `<nav>` element.
 */
export const BreadcrumbRootPrimitive = forwardRef<HTMLElement, BreadcrumbRootPrimitive.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);
        const [variantProps, otherProps] = createSplitProps<BreadcrumbContext>()(componentProps, [
            'size',
        ]);

        const element = useRenderElement({
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

/**
 * A primitive component for listing breadcrumb items in order. Renders an `<ol>` element.
 */
export const BreadcrumbListPrimitive = forwardRef<HTMLOListElement, BreadcrumbListPrimitive.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'ol',
            props: {
                className: cn(styles.list, className),
                ...componentProps,
            },
        });
    },
);
BreadcrumbListPrimitive.displayName = 'Breadcrumb.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * A navigation landmark that shows the current page's location within a hierarchy. Renders a `<nav>` element.
 */
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

/**
 * A primitive list item that wraps a single breadcrumb entry. Renders an `<li>` element.
 */
export const BreadcrumbItemPrimitive = forwardRef<HTMLLIElement, BreadcrumbItemPrimitive.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'li',
            props: {
                className: cn(styles.item, className),
                ...componentProps,
            },
        });
    },
);
BreadcrumbItemPrimitive.displayName = 'Breadcrumb.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.LinkPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * A primitive anchor link representing a single step in the breadcrumb trail. Renders an `<a>` element.
 */
export const BreadcrumbLinkPrimitive = forwardRef<HTMLAnchorElement, BreadcrumbLinkPrimitive.Props>(
    (props, ref) => {
        const { render, current = false, className, ...componentProps } = resolveStyles(props);
        const { size } = useBreadcrumbContext();

        const state: BreadcrumbLinkPrimitive.State = useMemo(() => ({ current }), [current]);

        return useRenderElement({
            ref,
            render,
            state,
            defaultTagName: 'a',
            props: {
                role: current ? 'link' : undefined,
                'aria-disabled': current ? 'true' : undefined,
                'aria-current': current ? 'page' : undefined,
                className: cn(styles.link({ size, current }), className),
                ...componentProps,
            },
        });
    },
);
BreadcrumbLinkPrimitive.displayName = 'Breadcrumb.LinkPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * A breadcrumb link composed with its list item container. Renders an `<a>` element.
 */
export const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbItem.Props>((props, ref) => {
    return (
        <BreadcrumbItemPrimitive>
            <BreadcrumbLinkPrimitive ref={ref} {...props} />
        </BreadcrumbItemPrimitive>
    );
});
BreadcrumbItem.displayName = 'Breadcrumb.Item';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

/**
 * A visual divider rendered between breadcrumb items. Renders an `<li>` element.
 */
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
        const children = useRenderElement({
            render: childrenRender,
            props: { width: '100%', height: '100%' },
        });

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'li',
            props: {
                role: 'presentation',
                'aria-hidden': 'true',
                className: cn(styles.icon({ size }), className),
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

/**
 * A primitive element that represents omitted items in a breadcrumb. Use it between displayed items. Renders a `<span>` element.
 */
export const BreadcrumbEllipsisPrimitive = forwardRef<
    HTMLSpanElement,
    BreadcrumbEllipsisPrimitive.Props
>((props, ref) => {
    const { render, className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useBreadcrumbContext();

    const childrenRender = createRender(childrenProp, <MoreCommonOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: cn(styles.icon({ size }), className),
            children,
            ...componentProps,
        },
    });
});
BreadcrumbEllipsisPrimitive.displayName = 'Breadcrumb.EllipsisPrimitive';

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbEllipsis
 * -----------------------------------------------------------------------------------------------*/

/**
 * A ready-to-use ellipsis component for omitted breadcrumb items. Renders a `<span>` element.
 */
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
     * Whether the link represents the current page. When `true`, sets `aria-current="page"` and `aria-disabled="true"` on the element.
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
