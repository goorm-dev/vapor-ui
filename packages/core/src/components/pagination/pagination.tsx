'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import type { Fragment } from 'react';
import { forwardRef, useMemo } from 'react';

import { useRender } from '@base-ui/react/use-render';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import {
    ChevronLeftOutlineIcon,
    ChevronRightOutlineIcon,
    MoreCommonOutlineIcon,
} from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { MakeChangeEventDetails } from '~/utils/create-event-details';
import { createChangeEventDetails } from '~/utils/create-event-details';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './pagination.css';
import type { ButtonVariants } from './pagination.css';

type PaginationVariants = ButtonVariants;

const [PaginationProvider, usePaginationContext] = createContext<PaginationContext>({
    name: 'Pagination',
    hookName: 'usePaginationContext',
    providerName: 'PaginationProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Pagination.Root
 * -----------------------------------------------------------------------------------------------*/

export const PaginationRoot = forwardRef<HTMLElement, PaginationRoot.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    return (
        <PaginationRootPrimitive ref={ref} {...componentProps}>
            <PaginationListPrimitive>{children}</PaginationListPrimitive>
        </PaginationRootPrimitive>
    );
});
PaginationRoot.displayName = 'Pagination.Root';

/* -------------------------------------------------------------------------------------------------
 * Pagination.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationRootPrimitive = forwardRef<HTMLElement, PaginationRootPrimitive.Props>(
    (props, ref) => {
        const {
            render,
            page: pageProp,
            defaultPage = 1,
            onPageChange: onPageChangeProp,

            totalPages,
            siblingCount = 2,
            boundaryCount = 1,
            disabled = false,
            className,
            ...componentProps
        } = props;

        const [variantProps, otherProps] = createSplitProps<PaginationVariants>()(componentProps, [
            'size',
        ]);

        const [page, setPageUnwrapped] = useControlled({
            controlled: pageProp,
            default: defaultPage,
            name: 'Pagination',
            state: 'page',
        });

        const onPageChange = useStableCallback(onPageChangeProp);

        const setPage = useStableCallback(
            (newPage: number, eventDetails: PaginationRootPrimitive.ChangeEventDetails) => {
                onPageChange?.(newPage, eventDetails);

                if (eventDetails.isCanceled) {
                    return;
                }

                setPageUnwrapped(newPage);
            },
        );

        const element = useRender({
            ref,
            render: render || <nav />,
            props: {
                'aria-label': 'Pagination',
                ...otherProps,
            },
        });

        const context: PaginationContext = useMemo(
            () => ({
                ...variantProps,
                totalPages,
                siblingCount,
                boundaryCount,
                page,
                setPage,
                disabled,
            }),
            [totalPages, page, setPage, siblingCount, boundaryCount, disabled, variantProps],
        );

        return <PaginationProvider value={context}>{element}</PaginationProvider>;
    },
);
PaginationRootPrimitive.displayName = 'PaginationRootPrimitive.Root';

/* -------------------------------------------------------------------------------------------------
 * Pagination.ListPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationListPrimitive = forwardRef<HTMLOListElement, PaginationListPrimitive.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <ol />,
            props: {
                className: clsx(styles.list, className),
                ...props,
            },
        });
    },
);
PaginationListPrimitive.displayName = 'Pagination.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationItemPrimitive = forwardRef<HTMLLIElement, PaginationItemPrimitive.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <li />,
            props: {
                className: clsx(styles.item, className),
                ...props,
            },
        });
    },
);
PaginationItemPrimitive.displayName = 'Pagination.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.ButtonPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationButtonPrimitive = forwardRef<
    HTMLButtonElement,
    PaginationButtonPrimitive.Props
>(({ page, render, disabled: disabledProp, className, ...props }, ref) => {
    const { page: contextPage, setPage, size, disabled: contextDisabled } = usePaginationContext();

    const handleClick = useStableCallback((event: MouseEvent) => {
        const details = createChangeEventDetails('item-press', event.nativeEvent);

        setPage(page, details);
    });

    const disabled = disabledProp || contextDisabled;
    const current = page === contextPage;

    return useRender({
        ref,
        render: render || <button />,
        state: { current, disabled },
        props: {
            'aria-label': `Page ${page}`,
            'aria-current': current ? 'page' : undefined,
            disabled,
            onClick: handleClick,
            className: clsx(styles.button({ size }), className),
            ...props,
        },
    });
});
PaginationButtonPrimitive.displayName = 'Pagination.ButtonPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.PreviousPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationPreviousPrimitive = forwardRef<
    HTMLButtonElement,
    PaginationPreviousPrimitive.Props
>((props, ref) => {
    const {
        render,
        disabled: disabledProp,
        className,
        children: childrenProp,
        ...componentProps
    } = resolveStyles(props);

    const { page, setPage, size, disabled: contextDisabled } = usePaginationContext();

    const disabled = disabledProp || contextDisabled || page <= 1;

    const onClick = useStableCallback((event: MouseEvent) => {
        if (disabled) return;

        const details = createChangeEventDetails('item-press', event.nativeEvent);
        setPage(page - 1, details);
    });

    const childrenRender = createRender(childrenProp, <ChevronLeftOutlineIcon />);
    const children = useRender({
        render: childrenRender,
        props: { 'aria-hidden': 'true', className: styles.icon },
    });

    return useRender({
        ref,
        render: render || <button />,
        state: { disabled },
        props: {
            'aria-label': 'Previous Page',
            disabled,
            className: clsx(styles.button({ size }), className),
            onClick,
            children,
            ...componentProps,
        },
    });
});
PaginationPreviousPrimitive.displayName = 'Pagination.PreviousPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Previous
 * -----------------------------------------------------------------------------------------------*/

export const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationPrevious.Props>(
    (props, ref) => {
        return (
            <PaginationItemPrimitive>
                <PaginationPreviousPrimitive ref={ref} {...props} />
            </PaginationItemPrimitive>
        );
    },
);
PaginationPrevious.displayName = 'Pagination.Previous';

/* -------------------------------------------------------------------------------------------------
 * Pagination.NextPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationNextPrimitive = forwardRef<HTMLButtonElement, PaginationNextPrimitive.Props>(
    (props, ref) => {
        const {
            render,
            disabled: disabledProp,
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);

        const {
            totalPages,
            page,
            setPage,
            size,
            disabled: contextDisabled,
        } = usePaginationContext();

        const disabled = disabledProp || contextDisabled || page >= totalPages;

        const onClick = useStableCallback((event: MouseEvent) => {
            if (disabled) return;

            const details = createChangeEventDetails('item-press', event.nativeEvent);
            setPage(page + 1, details);
        });

        const childrenRender = createRender(childrenProp, <ChevronRightOutlineIcon />);
        const children = useRender({
            render: childrenRender,
            props: { 'aria-hidden': 'true', className: styles.icon },
        });

        return useRender({
            ref,
            render: render || <button />,
            state: { disabled },
            props: {
                'aria-label': 'Next Page',
                disabled,
                className: clsx(styles.button({ size }), className),
                onClick,
                children,
                ...componentProps,
            },
        });
    },
);
PaginationNextPrimitive.displayName = 'Pagination.NextPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Next
 * -----------------------------------------------------------------------------------------------*/

export const PaginationNext = forwardRef<HTMLButtonElement, PaginationNext.Props>((props, ref) => {
    return (
        <PaginationItemPrimitive>
            <PaginationNextPrimitive ref={ref} {...props} />
        </PaginationItemPrimitive>
    );
});
PaginationNext.displayName = 'Pagination.Next';

/* -------------------------------------------------------------------------------------------------
 * Pagination.EllipsisPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const PaginationEllipsisPrimitive = forwardRef<
    HTMLSpanElement,
    PaginationEllipsisPrimitive.Props
>((props, ref) => {
    const { render, className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size, disabled } = usePaginationContext();

    const childrenRender = createRender(childrenProp, <MoreCommonOutlineIcon />);
    const children = useRender({
        render: childrenRender,
        props: { width: 'max(16px, 50%)', height: 'max(16px, 50%)' },
    });

    return useRender({
        ref,
        render: render || <span />,
        state: { disabled },
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: clsx(styles.ellipsis({ size }), className),
            children,
            ...componentProps,
        },
    });
});
PaginationEllipsisPrimitive.displayName = 'Pagination.EllipsisPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Items
 * -----------------------------------------------------------------------------------------------*/

export const PaginationItems = ({ children: childrenProp }: PaginationItems.Props) => {
    const { page, totalPages, siblingCount, boundaryCount } = usePaginationContext();

    const pages = createPaginationRange({ totalPages, page, siblingCount, boundaryCount });

    return typeof childrenProp === 'function'
        ? childrenProp(pages)
        : (childrenProp ??
              pages.map(({ type, value }) => {
                  if (type === 'BREAK') {
                      return (
                          <PaginationItemPrimitive key={`${type}-${value}`}>
                              <PaginationEllipsisPrimitive />
                          </PaginationItemPrimitive>
                      );
                  }

                  return (
                      <PaginationItemPrimitive key={`${type}-${value}`}>
                          <PaginationButtonPrimitive page={value}>
                              {value}
                          </PaginationButtonPrimitive>
                      </PaginationItemPrimitive>
                  );
              }));
};
PaginationItems.displayName = 'Pagination.Items';

/* -----------------------------------------------------------------------------------------------*/

export type PageType = { type: string; value: number };

type PaginationRange = {
    page: number;
    totalPages: number;
    siblingCount: number;
    boundaryCount: number;
};

export function createPaginationRange({
    page: currentPage,
    totalPages,
    boundaryCount,
    siblingCount,
}: PaginationRange) {
    const pages: PageType[] = [];

    // number of pages shown on each side of the current page
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // standardGap: 3
    const standardGap = siblingCount + boundaryCount;

    // the maximum number of pages that can be shown at a given time (account for current page, left and right ellipsis)
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // maxVisiblePages: 9
    const maxVisiblePages = standardGap + standardGap + 3;

    // if the number of pages is less than the maximum number of pages that can be shown just return all of them
    if (totalPages <= maxVisiblePages) {
        addPages(1, totalPages);
        return pages;
    }

    // startGap is the number of pages hidden by the start ellipsis
    // startOffset is the number of pages to offset at the start to compensate
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // startGap: 5
    // startOffset: 0
    // when the margin and the surrounding windows overlap.
    // [1, _2_, 3, 4, 5, 6, ..., 15]
    // startGap = 0
    // startOffset: -3 <--
    let startGap = 0;
    let startOffset = 0;

    // When there is overlap
    if (currentPage - standardGap - 1 <= 1) {
        startOffset = currentPage - standardGap - 2;
    } else {
        startGap = currentPage - standardGap - 1;
    }

    // These are equivalent to startGap and startOffset but at the end of the list
    let endGap = 0;
    let endOffset = 0;

    // When there is overlap
    if (totalPages - currentPage - standardGap <= 1) {
        endOffset = totalPages - currentPage - standardGap - 1;
    } else {
        endGap = totalPages - currentPage - standardGap;
    }

    const hasStartEllipsis = startGap > 0;
    const hasEndEllipsis = endGap > 0;

    // add pages "before" the start ellipsis (if any)
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // boundaryCount: 1
    // addPages(1, 1, true)
    addPages(1, boundaryCount);

    if (hasStartEllipsis) {
        addEllipsis(boundaryCount);
    }

    // add middle pages
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // boundaryCount: 1
    // siblingCount: 2
    // startGap: 5
    // startOffset: 0
    // endGap: 3
    // endOffset: 0
    // addPages(7, 11, true)
    addPages(
        boundaryCount + startGap + endOffset + 1,
        totalPages - startOffset - endGap - boundaryCount,
    );

    if (hasEndEllipsis) {
        addEllipsis(totalPages - startOffset - endGap - boundaryCount);
    }

    // add pages "after" the start ellipsis (if any)
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // boundaryCount: 1
    // siblingCount: 2
    // startGap: 5
    // startOffset: 0
    // endGap: 3
    // endOffset: 0
    // addPages(15, 15)
    addPages(totalPages - boundaryCount + 1, totalPages);

    return pages;

    function addEllipsis(previousPage: number) {
        pages.push({
            type: 'BREAK',
            value: previousPage + 1,
        });
    }

    function addPages(start: number, end: number) {
        for (let i = start; i <= end; i++) {
            pages.push({
                type: 'NUM',
                value: i,
            });
        }
    }
}

/* -----------------------------------------------------------------------------------------------*/

interface PaginationContext extends PaginationVariants {
    totalPages: number;
    page: number;
    setPage: (page: number, eventDetails: PaginationRootPrimitive.ChangeEventDetails) => void;
    siblingCount: number;
    boundaryCount: number;
    disabled: boolean;
}

type RootPrimitiveProps = VComponentProps<'nav'>;
export interface PaginationRootProps extends RootPrimitiveProps, PaginationVariants {
    totalPages: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number, eventDetails: PaginationRootPrimitive.ChangeEventDetails) => void;

    siblingCount?: number;
    boundaryCount?: number;
    disabled?: boolean;
}

type PaginationRootChangeEventReason = 'item-press';
type PaginationRootChangeEventDetails = MakeChangeEventDetails<PaginationRoot.ChangeEventReason>;

export namespace PaginationRoot {
    export type Props = PaginationRootProps;

    export type ChangeEventReason = PaginationRootChangeEventReason;
    export type ChangeEventDetails = PaginationRootChangeEventDetails;
}

export namespace PaginationRootPrimitive {
    export type Props = PaginationRootProps;

    export type ChangeEventReason = PaginationRootChangeEventReason;
    export type ChangeEventDetails = PaginationRootChangeEventDetails;
}

export namespace PaginationListPrimitive {
    type ListPrimitiveProps = VComponentProps<'ol'>;
    export interface Props extends ListPrimitiveProps {}
}

export namespace PaginationItemPrimitive {
    type ItemPrimitiveProps = VComponentProps<'li'>;
    export interface Props extends ItemPrimitiveProps {}
}

type ButtonPrimitiveProps = VComponentProps<'button'>;
export interface PaginationButtonProps extends ButtonPrimitiveProps {
    page: number;
}

export namespace PaginationButtonPrimitive {
    export type Props = PaginationButtonProps;
}

export namespace PaginationButton {
    export type Props = PaginationButtonPrimitive.Props;
}

export namespace PaginationPreviousPrimitive {
    type PreviousPrimitiveProps = VComponentProps<'button'>;

    export interface Props extends PreviousPrimitiveProps {}
}

export namespace PaginationPrevious {
    export interface Props extends PaginationPreviousPrimitive.Props {}
}

export namespace PaginationNextPrimitive {
    type NextPrimitiveProps = VComponentProps<'button'>;

    export interface Props extends NextPrimitiveProps {}
}

export namespace PaginationNext {
    export interface Props extends PaginationNextPrimitive.Props {}
}

export namespace PaginationItems {
    type ItemsPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof Fragment>, 'children'>;

    export interface Props extends ItemsPrimitiveProps {
        children?: React.ReactNode | ((pages: PageType[]) => React.ReactNode);
    }
}

export namespace PaginationEllipsisPrimitive {
    type EllipsisPrimitiveProps = VComponentProps<'span'>;

    export interface Props extends EllipsisPrimitiveProps {}
}

export namespace PaginationEllipsis {
    export interface Props extends PaginationEllipsisPrimitive.Props {}
}
