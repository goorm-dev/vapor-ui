'use client';

import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * 콘텐츠를 접고 펼칠 수 있는 컴포넌트
 */
export const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleRoot.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseCollapsible.Root ref={ref} {...componentProps} />;
});
CollapsibleRoot.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * 콜랩서블 열기/닫기 트리거
 */
export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTrigger.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseCollapsible.Trigger ref={ref} {...componentProps} />;
    },
);
CollapsibleTrigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

/**
 * 콜랩서블 콘텐츠 패널
 */
export const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseCollapsible.Panel
            ref={ref}
            className={clsx(styles.panel, className)}
            {...componentProps}
        />
    );
});
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
