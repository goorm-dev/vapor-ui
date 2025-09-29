'use client';

import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Collapsible 컴포넌트의 루트 컨테이너로, 콘텐츠의 열림/닫힘 상태를 관리합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/collapsible Collapsible Documentation}
 */
interface CollapsibleRootProps extends VComponentProps<typeof BaseCollapsible.Root> {}

const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>((props, ref) => {
    return <BaseCollapsible.Root ref={ref} {...props} />;
});
Root.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Collapsible 콘텐츠의 열림/닫힘을 토글하는 트리거 버튼입니다.
 *
 * `<button>` 요소를 렌더링합니다.
 */
interface CollapsibleTriggerProps extends VComponentProps<typeof BaseCollapsible.Trigger> {}

const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>((props, ref) => {
    return <BaseCollapsible.Trigger ref={ref} {...props} />;
});
Trigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

/**
 * Collapsible 콘텐츠의 패널로, 열림/닫힘 상태에 따라 높이가 애니메이션됩니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface CollapsiblePanelProps extends VComponentProps<typeof BaseCollapsible.Panel> {}

const Panel = forwardRef<HTMLDivElement, CollapsiblePanelProps>(({ className, ...props }, ref) => {
    return <BaseCollapsible.Panel ref={ref} className={clsx(styles.panel, className)} {...props} />;
});
Panel.displayName = 'Collapsible.Panel';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CollapsibleRoot, Trigger as CollapsibleTrigger, Panel as CollapsiblePanel };

export type { CollapsibleRootProps, CollapsibleTriggerProps, CollapsiblePanelProps };

export const Collapsible = {
    Root,
    Trigger,
    Panel,
};
