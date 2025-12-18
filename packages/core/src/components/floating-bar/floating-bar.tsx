import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Popover, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './floating-bar.css';

export const FloatingBarRoot = (props: FloatingBarRoot.Props) => {
    return <Popover.Root {...props} />;
};
FloatingBarRoot.displayName = 'FloatingBar.Root';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const FloatingBarTrigger = forwardRef<HTMLButtonElement, FloatingBarTrigger.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <Popover.Trigger ref={ref} {...componentProps} />;
    },
);
FloatingBarTrigger.displayName = 'FloatingBar.Trigger';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Close
 * -----------------------------------------------------------------------------------------------*/

export const FloatingBarClose = forwardRef<HTMLButtonElement, FloatingBarClose.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <Popover.Close ref={ref} {...componentProps} />;
    },
);
FloatingBarClose.displayName = 'FloatingBar.Close';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const FloatingBarPortalPrimitive = (props: FloatingBarPortalPrimitive.Props) => (
    <Popover.Portal {...props} />
);
FloatingBarPortalPrimitive.displayName = 'FloatingBar.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Fixed position styles for the FloatingBar
 */
const positions = { top: 'initial', left: '50%', transform: 'translateX(-50%)' };

export const FloatingBarPositionerPrimitive = forwardRef<
    HTMLDivElement,
    FloatingBarPositionerPrimitive.Props
>((props, ref) => {
    const { style, className, ...componentProps } = resolveStyles(props);

    return (
        <Popover.Positioner
            ref={ref}
            positionMethod="fixed"
            style={{ ...style, ...positions }}
            className={clsx(styles.positioner, className)}
            {...componentProps}
        />
    );
});
FloatingBarPositionerPrimitive.displayName = 'FloatingBar.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const FloatingBarPopupPrimitive = forwardRef<
    HTMLDivElement,
    FloatingBarPopupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <Popover.Popup ref={ref} className={clsx(styles.popup, className)} {...componentProps} />
    );
});
FloatingBarPopupPrimitive.displayName = 'FloatingBar.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Popup
 * -----------------------------------------------------------------------------------------------*/

export const FloatingBarPopup = forwardRef<HTMLDivElement, FloatingBarPopup.Props>((props, ref) => {
    const { portalElement, ...componentProps } = props;

    const popup = <FloatingBarPopupPrimitive ref={ref} {...componentProps} />;

    const positioner = useRender({
        render: createRender(<FloatingBarPositionerPrimitive />),
        props: { children: popup },
    });

    const portal = useRender({
        render: createRender(portalElement, <FloatingBarPortalPrimitive />),
        props: { children: positioner },
    });

    return portal;
});
FloatingBarPopup.displayName = 'FloatingBar.Popup';

/* -----------------------------------------------------------------------------------------------*/

export namespace FloatingBarRoot {
    export type Props = Popover.Root.Props;
}

export namespace FloatingBarTrigger {
    export type Props = VComponentProps<typeof Popover.Trigger>;
}

export namespace FloatingBarClose {
    export type Props = VComponentProps<typeof Popover.Close>;
}

export namespace FloatingBarPortalPrimitive {
    export type Props = Popover.Portal.Props;
}

export namespace FloatingBarPositionerPrimitive {
    export type Props = VComponentProps<'div'>;
}

export namespace FloatingBarPopupPrimitive {
    export type Props = VComponentProps<typeof Popover.Popup>;
}

export namespace FloatingBarPopup {
    export type PopupProps = FloatingBarPopupPrimitive.Props;

    export interface Props extends PopupProps {
        portalElement?: ReactElement<FloatingBarPortalPrimitive.Props>;
    }
}
