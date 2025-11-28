'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * 관련 정보를 그룹화하여 표시하는 컨테이너 컴포넌트
 */
export const CardRoot = forwardRef<HTMLDivElement, CardRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root, className),
            ...componentProps,
        },
    });
});
CardRoot.displayName = 'Card.Root';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * 카드 헤더 영역
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.header, className),
            ...componentProps,
        },
    });
});
CardHeader.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * 카드 본문 영역
 */
export const CardBody = forwardRef<HTMLDivElement, CardBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...componentProps,
        },
    });
});
CardBody.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * 카드 푸터 영역
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooter.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.footer, className),
            ...componentProps,
        },
    });
});
CardFooter.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export namespace CardRoot {
    type RootPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends RootPrimitiveProps {}
}

export namespace CardHeader {
    type HeaderPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends HeaderPrimitiveProps {}
}

export namespace CardBody {
    type BodyPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends BodyPrimitiveProps {}
}

export namespace CardFooter {
    type FooterPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends FooterPrimitiveProps {}
}
