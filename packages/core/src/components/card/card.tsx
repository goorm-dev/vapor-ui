'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

interface CardRootProps extends VComponentProps<'div'> {}

/**
 * 관련된 정보를 그룹화하여 표시하는 컨테이너 컴포넌트입니다.
 *
 * `<div>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/card Card Documentation}
 */
const Root = forwardRef<HTMLDivElement, CardRootProps>(({ render, className, ...props }, ref) => {
    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root, className),
            ...props,
        },
    });
});
Root.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps extends VComponentProps<'div'> {}

/**
 * 카드의 헤더 영역을 담당합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
const Header = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.header, className),
                ...props,
            },
        });
    },
);
Header.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

interface CardBodyProps extends VComponentProps<'div'> {}

/**
 * 카드의 주요 콘텐츠 영역을 담당합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
const Body = forwardRef<HTMLDivElement, CardBodyProps>(({ render, className, ...props }, ref) => {
    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...props,
        },
    });
});
Body.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

interface CardFooterProps extends VComponentProps<'div'> {}

/**
 * 카드의 푸터 영역을 담당합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
const Footer = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.footer, className),
                ...props,
            },
        });
    },
);
Footer.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CardRoot, Header as CardHeader, Body as CardBody, Footer as CardFooter };
export type { CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps };

export const Card = { Root, Header, Body, Footer };
