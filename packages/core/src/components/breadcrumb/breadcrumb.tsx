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
 * Breadcrumb.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * 브레드크럼 네비게이션 루트 프리미티브
 */
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

/**
 * 브레드크럼 항목을 포함하는 리스트 프리미티브
 */
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

/**
 * 현재 페이지 위치를 계층적으로 표시하는 네비게이션 컴포넌트
 */
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

/**
 * 브레드크럼 항목 프리미티브
 */
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

/**
 * 브레드크럼 링크 프리미티브
 */
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

/**
 * 브레드크럼 항목 컴포넌트
 */
export const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbLinkPrimitive.Props>(
    (props, ref) => {
        return (
            <BreadcrumbItemPrimitive>
                <BreadcrumbLinkPrimitive ref={ref} {...props} />
            </BreadcrumbItemPrimitive>
        );
    },
);

BreadcrumbItem.displayName = 'Breadcrumb.Item';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

/**
 * 브레드크럼 항목 간 구분자
 */
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
 * Breadcrumb.EllipsisPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * 생략된 항목을 나타내는 말줄임표 프리미티브
 */
export const BreadcrumbEllipsisPrimitive = forwardRef<
    HTMLSpanElement,
    BreadcrumbEllipsisPrimitive.Props
>((props, ref) => {
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
});
BreadcrumbEllipsisPrimitive.displayName = 'Breadcrumb.EllipsisPrimitive';

/* -------------------------------------------------------------------------------------------------
 * BreadcrumbEllipsis
 * -----------------------------------------------------------------------------------------------*/

/**
 * 생략된 항목을 나타내는 말줄임표 컴포넌트
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
        /** 현재 페이지 여부 */
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
