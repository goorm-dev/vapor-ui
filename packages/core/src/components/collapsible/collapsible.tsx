'use client';

import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';

import { cn } from '~/utils/cn';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

export const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleRoot.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseCollapsible.Root ref={ref} {...componentProps} />;
});
CollapsibleRoot.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTrigger.Props>(
    (props, ref) => {
        const { disabled, ...componentProps } = resolveStyles(props);
        const dataAttrs = createDataAttributes({ disabled });

        return (
            <BaseCollapsible.Trigger
                ref={ref}
                disabled={disabled}
                {...dataAttrs}
                {...componentProps}
            />
        );
    },
);
CollapsibleTrigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

export const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseCollapsible.Panel
            ref={ref}
            className={cn(styles.panel, className)}
            {...componentProps}
        />
    );
});
CollapsiblePanel.displayName = 'Collapsible.Panel';

/* -----------------------------------------------------------------------------------------------*/

export namespace CollapsibleRoot {
    export type State = BaseCollapsible.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseCollapsible.Root, State>;
    export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
}

export namespace CollapsibleTrigger {
    // FIXME: BaseCollapsible.Trigger.State appears to be missing.
    // Substituting with Root.State as they are functionally identical.
    export type State = BaseCollapsible.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseCollapsible.Trigger, State>;
}

export namespace CollapsiblePanel {
    export type State = BaseCollapsible.Panel.State;
    export type Props = VaporUIComponentProps<typeof BaseCollapsible.Panel, State>;
}
