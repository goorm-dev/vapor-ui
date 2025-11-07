'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
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
 * Breadcrumb.Root
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbRoot.Props>((props, ref) => {
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
});
BreadcrumbRoot.displayName = 'Breadcrumb.Root';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.List
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbList.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <ol />,
        props: {
            className: clsx(styles.list, className),
            ...componentProps,
        },
    });
});
BreadcrumbList.displayName = 'Breadcrumb.List';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItem.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <li />,
        props: {
            className: clsx(styles.item, className),
            ...componentProps,
        },
    });
});
BreadcrumbItem.displayName = 'Breadcrumb.Item';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Link
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLink.Props>((props, ref) => {
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
});
BreadcrumbLink.displayName = 'Breadcrumb.Link';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparator.Props>(
    (props, ref) => {
        const { render, className, children, ...componentProps } = resolveStyles(props);

        const { size } = useBreadcrumbContext();
        const IconElement = createSlot(children || <SlashOutlineIcon size="100%" />);

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
 * Breadcrumb.Ellipsis
 * -----------------------------------------------------------------------------------------------*/

export const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsis.Props>(
    (props, ref) => {
        const { render, className, children, ...componentProps } = resolveStyles(props);

        const { size } = useBreadcrumbContext();
        const IconElement = createSlot(children || <MoreCommonOutlineIcon size="100%" />);

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
    },
);
BreadcrumbEllipsis.displayName = 'Breadcrumb.Ellipsis';

/* -----------------------------------------------------------------------------------------------*/

export namespace BreadcrumbRoot {
    type RootPrimitiveProps = VComponentProps<'nav'>;

    export interface Props extends RootPrimitiveProps, BreadcrumbVariants {}
}

export namespace BreadcrumbList {
    type ListPrimitiveProps = VComponentProps<'ol'>;

    export interface Props extends ListPrimitiveProps {}
}

export namespace BreadcrumbItem {
    type ItemPrimitiveProps = VComponentProps<'li'>;

    export interface Props extends ItemPrimitiveProps {}
}

export namespace BreadcrumbLink {
    type LinkPrimitiveProps = VComponentProps<'a'>;

    export interface Props extends LinkPrimitiveProps {
        current?: boolean;
    }
}

export namespace BreadcrumbSeparator {
    type SeparatorPrimitiveProps = VComponentProps<'li'>;

    export interface Props extends SeparatorPrimitiveProps {}
}

export namespace BreadcrumbEllipsis {
    type EllipsisPrimitiveProps = VComponentProps<'span'>;

    export interface Props extends EllipsisPrimitiveProps {}
}
