'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import type { Fragment } from 'react';
import { forwardRef, useMemo } from 'react';

import { useRender } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import { useEventCallback } from '@base-ui-components/utils/useEventCallback';
import {
    ChevronLeftOutlineIcon,
    ChevronRightOutlineIcon,
    MoreCommonOutlineIcon,
} from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import type { MakeChangeEventDetails } from '~/utils/create-event-details';
import { createChangeEventDetails } from '~/utils/create-event-details';
import { createSplitProps } from '~/utils/create-split-props';
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
    const {
        render,
        page: pageProp,
        defaultPage = 1,
        onPageChange: onPageChangeProp,

        totalPages,
        siblingCount = 1,
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

    const onPageChange = useEventCallback(onPageChangeProp);

    const setPage = useEventCallback(
        (newPage: number, eventDetails: PaginationRoot.ChangeEventDetails) => {
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
});
PaginationRoot.displayName = 'Pagination.Root';

/* -------------------------------------------------------------------------------------------------
 * Pagination.List
 * -----------------------------------------------------------------------------------------------*/

export const PaginationList = forwardRef<HTMLOListElement, PaginationList.Props>(
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
PaginationList.displayName = 'Pagination.List';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Item
 * -----------------------------------------------------------------------------------------------*/

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItem.Props>(
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
PaginationItem.displayName = 'Pagination.Item';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Button
 * -----------------------------------------------------------------------------------------------*/

export const PaginationButton = forwardRef<HTMLButtonElement, PaginationButton.Props>(
    ({ page, render, disabled: disabledProp, className, ...props }, ref) => {
        const {
            page: contextPage,
            setPage,
            size,
            disabled: contextDisabled,
        } = usePaginationContext();

        const handleClick = useEventCallback((event: MouseEvent) => {
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
    },
);
PaginationButton.displayName = 'Pagination.Button';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Previous
 * -----------------------------------------------------------------------------------------------*/

export const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationPrevious.Props>(
    ({ render, disabled: disabledProp, className, children: childrenProp, ...props }, ref) => {
        const { page, setPage, size, disabled: contextDisabled } = usePaginationContext();

        const disabled = disabledProp || contextDisabled || page <= 1;

        const onClick = useEventCallback((event: MouseEvent) => {
            if (disabled) return;

            const details = createChangeEventDetails('item-press', event.nativeEvent);
            setPage(page - 1, details);
        });

        const IconElement = createSlot(childrenProp || <ChevronLeftOutlineIcon size="100%" />);

        return useRender({
            ref,
            render: render || <button />,
            props: {
                'aria-label': 'Previous Page',
                'data-disabled': disabled ? '' : undefined,
                disabled,
                className: clsx(styles.button({ size }), className),
                onClick,
                children: <IconElement className={styles.icon({ size })} />,
                ...props,
            },
        });
    },
);
PaginationPrevious.displayName = 'Pagination.Previous';
/* -------------------------------------------------------------------------------------------------
 * Pagination.Next
 * -----------------------------------------------------------------------------------------------*/

export const PaginationNext = forwardRef<HTMLButtonElement, PaginationNext.Props>(
    ({ render, disabled: disabledProp, className, children: childrenProp, ...props }, ref) => {
        const {
            totalPages,
            page,
            setPage,
            size,
            disabled: contextDisabled,
        } = usePaginationContext();

        const disabled = disabledProp || contextDisabled || page >= totalPages;

        const onClick = useEventCallback((event: MouseEvent) => {
            if (disabled) return;

            const details = createChangeEventDetails('item-press', event.nativeEvent);
            setPage(page + 1, details);
        });

        const IconElement = createSlot(childrenProp || <ChevronRightOutlineIcon size="100%" />);

        return useRender({
            ref,
            render: render || <button />,
            props: {
                'aria-label': 'Next Page',
                'data-disabled': disabled ? '' : undefined,
                disabled,
                className: clsx(styles.button({ size }), className),
                onClick,
                children: <IconElement className={styles.icon({ size })} />,
                ...props,
            },
        });
    },
);
PaginationNext.displayName = 'Pagination.Next';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Ellipsis
 * -----------------------------------------------------------------------------------------------*/

export const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsis.Props>(
    ({ render, className, children: childrenProp, ...props }, ref) => {
        const { size, disabled } = usePaginationContext();

        const IconElement = createSlot(childrenProp || <MoreCommonOutlineIcon size="100%" />);

        return useRender({
            ref,
            render: render || <span />,
            props: {
                role: 'presentation',
                'aria-hidden': 'true',
                'data-disabled': disabled ? '' : undefined,
                className: clsx(styles.ellipsis({ size }), className),
                children: <IconElement className={styles.icon({ size })} />,
                ...props,
            },
        });
    },
);
PaginationEllipsis.displayName = 'Pagination.Ellipsis';

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
                          <PaginationItem key={`${type}-${value}`}>
                              <PaginationEllipsis />
                          </PaginationItem>
                      );
                  }

                  return (
                      <PaginationItem key={`${type}-${value}`}>
                          <PaginationButton page={value}>{value}</PaginationButton>
                      </PaginationItem>
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
    setPage: (page: number, eventDetails: PaginationRoot.ChangeEventDetails) => void;
    siblingCount: number;
    boundaryCount: number;
    disabled: boolean;
}

type RootPrimitiveProps = VComponentProps<'nav'>;
export interface PaginationRootProps extends RootPrimitiveProps, PaginationVariants {
    totalPages: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number, eventDetails: PaginationRoot.ChangeEventDetails) => void;

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

export namespace PaginationList {
    type ListPrimitiveProps = VComponentProps<'ol'>;
    export interface Props extends ListPrimitiveProps {}
}

export namespace PaginationItem {
    type ItemPrimitiveProps = VComponentProps<'li'>;
    export interface Props extends ItemPrimitiveProps {}
}

type ButtonPrimitiveProps = VComponentProps<'button'>;
export interface PaginationButtonProps extends ButtonPrimitiveProps {
    page: number;
}

export namespace PaginationButton {
    export type Props = PaginationButtonProps;
}

export namespace PaginationPrevious {
    type PreviousPrimitiveProps = VComponentProps<'button'>;

    export interface Props extends PreviousPrimitiveProps {}
}

export namespace PaginationNext {
    type NextPrimitiveProps = VComponentProps<'button'>;

    export interface Props extends NextPrimitiveProps {}
}

export namespace PaginationItems {
    type ItemsPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof Fragment>, 'children'>;

    export interface Props extends ItemsPrimitiveProps {
        children?: React.ReactNode | ((pages: PageType[]) => React.ReactNode);
    }
}

export namespace PaginationEllipsis {
    type EllipsisPrimitiveProps = VComponentProps<'span'>;

    export interface Props extends EllipsisPrimitiveProps {}
}
