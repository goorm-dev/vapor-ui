'use client';

import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

export const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleRoot.Props>((props, ref) => {
    return <BaseCollapsible.Root ref={ref} {...props} />;
});
CollapsibleRoot.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTrigger.Props>(
    (props, ref) => {
        return <BaseCollapsible.Trigger ref={ref} {...props} />;
    },
);
CollapsibleTrigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

export const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanel.Props>(
    ({ className, ...props }, ref) => {
        return (
            <BaseCollapsible.Panel ref={ref} className={clsx(styles.panel, className)} {...props} />
        );
    },
);
CollapsiblePanel.displayName = 'Collapsible.Panel';

/* -----------------------------------------------------------------------------------------------*/

export namespace CollapsibleRoot {
    type PrimitiveRootProps = VComponentProps<typeof BaseCollapsible.Root>;

    export interface Props extends PrimitiveRootProps {}
    export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
}

export namespace CollapsibleTrigger {
    export type PrimitiveTriggerProps = VComponentProps<typeof BaseCollapsible.Trigger>;

    export interface Props extends PrimitiveTriggerProps {}
}

export namespace CollapsiblePanel {
    export type PrimitivePanelProps = VComponentProps<typeof BaseCollapsible.Panel>;

    export interface Props extends PrimitivePanelProps {}
}
