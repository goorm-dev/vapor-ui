import type { ComponentProps } from 'react';
import { Children, Fragment, cloneElement, isValidElement } from 'react';

import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

/*
 * TODO: Replace this local port with the <Interaction /> component from
 * @vapor-ui/core once https://github.com/goorm-dev/vapor-ui/pull/617 is
 * merged and released. The styles below are a temporary Tailwind translation
 * of that PR's interaction.css.ts.
 */

const overlayClass = clsx(
    'pointer-events-none absolute top-0 left-0 h-full w-full',
    'rounded-[inherit] border-0',
    'bg-[var(--vapor-color-gray-900)]',
    'opacity-[var(--overlay-opacity)]',
    'transition-opacity duration-150 ease-[ease]',
);

const rootClass = ({ scale = 'normal', type = 'default' }: InteractionVariants) =>
    clsx(
        'relative focus:outline-none focus-visible:outline-none',
        '[--ratio:0.08] [--overlay-opacity:0]',
        scale === 'light' && '[--ratio:0.04]',
        type === 'default' && [
            'active:[--overlay-opacity:calc(var(--ratio)*2)]',
            'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-[var(--vapor-color-foreground-normal-200)] focus-visible:[outline-offset:2px]',
            'hover:[--overlay-opacity:var(--ratio)]',
        ],
        type === 'form' && [
            'transition-shadow duration-150 ease-[cubic-bezier(.4,0,.2,1)]',
            'focus:shadow-[inset_0_0_0_0.0625rem_var(--vapor-color-border-primary)]',
            'hover:[&:not(:focus)]:shadow-[inset_0_0_0_0.0625rem_color-mix(in_srgb,var(--vapor-color-gray-900)_32%,transparent)]',
        ],
        type === 'roving' && [
            'data-[highlighted]:[--overlay-opacity:0.08]',
            'data-[highlighted]:active:[--overlay-opacity:0.16]',
        ],
    );

/* -------------------------------------------------------------------------------------------------
 * Interaction
 * -----------------------------------------------------------------------------------------------*/

export const Interaction = ({
    scale,
    type,
    className: classNameProp,
    children: childrenProp,
    ...props
}: Interaction.Props) => {
    const child = Children.only(childrenProp);

    if (!isValidElement<Interaction.Props>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    const element = useRender({
        defaultTagName: 'div',
        state: { interaction: true },
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: clsx(overlayClass, classNameProp),
            ...props,
        },
    });

    const { className, children } = child.props;

    return cloneElement(child, {
        className: clsx(rootClass({ scale, type }), className),
        children:
            type === 'form' ? (
                children
            ) : (
                <Fragment>
                    {element}
                    {children}
                </Fragment>
            ),
    });
};

/* -----------------------------------------------------------------------------------------------*/

export type InteractionVariants = {
    scale?: 'normal' | 'light';
    type?: 'default' | 'form' | 'roving';
};

export namespace Interaction {
    export type State = {};
    export type Props = ComponentProps<'div'> & InteractionVariants;
}
