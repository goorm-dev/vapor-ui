'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useSlot } from '~/hooks/use-slot';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './breadcrumb.css';
import type { BreadcrumbItemVariants } from './breadcrumb.css';

type BreadcrumbVariants = Omit<BreadcrumbItemVariants, 'current'>;

const [BreadcrumbProvider, useBreadcrumbContext] = createContext<BreadcrumbVariants>({
    name: 'Breadcrumb',
    hookName: 'useBreadcrumbContext',
    providerName: 'BreadcrumbProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbRootPrimitive = forwardRef<HTMLElement, BreadcrumbRootPrimitive.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);
        const [variantProps, otherProps] = createSplitProps<BreadcrumbVariants>()(componentProps, [
            'size',
        ]);

        const element = useRender({
            ref,
            render: render || <nav />,
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
            render: render || <ol />,
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

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbRootPrimitive.Props>(
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
            render: render || <li />,
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
        const { render, current, className, ...componentProps } = resolveStyles(props);
        const Component = current ? 'span' : 'a';

        const { size } = useBreadcrumbContext();

        return useRender({
            ref,
            render: render || <Component />,
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

export const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbLinkPrimitive.Props>(
    (props, ref) => {
        return (
            <BreadcrumbItemPrimitive>
                <BreadcrumbLinkPrimitive ref={ref} {...props} />
            </BreadcrumbItemPrimitive>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparator.Props>(
    (props, ref) => {
        const { render, className, children, ...componentProps } = resolveStyles(props);

        const { size } = useBreadcrumbContext();
        const IconElement = useSlot(children, <SlashOutlineIcon size="100%" />);

        return useRender({
            ref,
            render: render || <li />,
            props: {
                role: 'presentation',
                'aria-hidden': 'true',
                className: clsx(styles.icon({ size }), className),
                children: <IconElement />,
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
    const { render, className, children, ...componentProps } = resolveStyles(props);

    const { size } = useBreadcrumbContext();
    const IconElement = useSlot(children, <MoreCommonOutlineIcon size="100%" />);

    return useRender({
        ref,
        render: render || <span />,
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: clsx(styles.icon({ size }), className),
            children: <IconElement />,
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
    type RootPrimitiveProps = VComponentProps<'nav'>;

    export interface Props extends RootPrimitiveProps, BreadcrumbVariants {}
}

export namespace BreadcrumbListPrimitive {
    type ListPrimitiveProps = VComponentProps<'ol'>;

    export interface Props extends ListPrimitiveProps {}
}

export namespace BreadcrumbRoot {
    export interface Props extends BreadcrumbRootPrimitive.Props {}
}

export namespace BreadcrumbItemPrimitive {
    type ItemPrimitiveProps = VComponentProps<'li'>;

    export interface Props extends ItemPrimitiveProps {}
}

export namespace BreadcrumbLinkPrimitive {
    type LinkPrimitiveProps = VComponentProps<'a'>;

    export interface Props extends LinkPrimitiveProps {
        current?: boolean;
    }
}

export namespace BreadcrumbItem {
    export interface Props extends BreadcrumbLinkPrimitive.Props {}
}

export namespace BreadcrumbSeparator {
    type SeparatorPrimitiveProps = VComponentProps<'li'>;

    export interface Props extends SeparatorPrimitiveProps {}
}

export namespace BreadcrumbEllipsisPrimitive {
    type EllipsisPrimitiveProps = VComponentProps<'span'>;

    export interface Props extends EllipsisPrimitiveProps {}
}

export namespace BreadcrumbEllipsis {
    export interface Props extends BreadcrumbEllipsisPrimitive.Props {}
}
