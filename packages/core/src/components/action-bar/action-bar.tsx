import { forwardRef } from 'react';

import { Popover } from '@base-ui-components/react';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './action-bar.css';

export const ActionBarRoot = (props: ActionBarRoot.Props) => {
    return <Popover.Root {...props} />;
};
ActionBarRoot.displayName = 'ActionBar.Root';

/* -------------------------------------------------------------------------------------------------
 * ActionBar.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const ActionBarTrigger = forwardRef<HTMLButtonElement, ActionBarTrigger.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <Popover.Trigger ref={ref} {...componentProps} />;
    },
);
ActionBarTrigger.displayName = 'ActionBar.Trigger';

/* -------------------------------------------------------------------------------------------------
 * ActionBar.Close
 * -----------------------------------------------------------------------------------------------*/

export const ActionBarClose = forwardRef<HTMLButtonElement, ActionBarClose.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <Popover.Close ref={ref} {...componentProps} />;
});
ActionBarClose.displayName = 'ActionBar.Close';

/* -------------------------------------------------------------------------------------------------
 * ActionBar.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ActionBarPortalPrimitive = (props: ActionBarPortalPrimitive.Props) => (
    <Popover.Portal {...props} />
);
ActionBarPortalPrimitive.displayName = 'ActionBar.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * ActionBar.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Fixed position styles for the ActionBar
 */
const positions = { top: 'initial', left: '50%', transform: 'translateX(-50%)' };

export const ActionBarPositionerPrimitive = forwardRef<
    HTMLDivElement,
    ActionBarPositionerPrimitive.Props
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
ActionBarPositionerPrimitive.displayName = 'ActionBar.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * ActionBar.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ActionBarPopupPrimitive = forwardRef<HTMLDivElement, ActionBarPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <Popover.Popup
                ref={ref}
                className={clsx(styles.popup, className)}
                {...componentProps}
            />
        );
    },
);
ActionBarPopupPrimitive.displayName = 'ActionBar.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * ActionBar.Popup
 * -----------------------------------------------------------------------------------------------*/

export const ActionBarPopup = forwardRef<HTMLDivElement, ActionBarPopup.Props>((props, ref) => {
    return (
        <ActionBarPortalPrimitive>
            <ActionBarPositionerPrimitive>
                <ActionBarPopupPrimitive ref={ref} {...props} />
            </ActionBarPositionerPrimitive>
        </ActionBarPortalPrimitive>
    );
});
ActionBarPopup.displayName = 'ActionBar.Popup';

/* -----------------------------------------------------------------------------------------------*/

export namespace ActionBarRoot {
    export type Props = Popover.Root.Props;
}

export namespace ActionBarTrigger {
    export type Props = VComponentProps<typeof Popover.Trigger>;
}

export namespace ActionBarClose {
    export type Props = VComponentProps<typeof Popover.Close>;
}

export namespace ActionBarPortalPrimitive {
    export type Props = VComponentProps<typeof Popover.Portal>;
}

export namespace ActionBarPositionerPrimitive {
    export type Props = VComponentProps<'div'>;
}

export namespace ActionBarPopupPrimitive {
    export type Props = VComponentProps<typeof Popover.Popup>;
}

export namespace ActionBarPopup {
    export type Props = ActionBarPopupPrimitive.Props;
}
