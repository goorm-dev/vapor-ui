import { forwardRef } from 'react';

import { Toolbar as BaseToolbar } from '@base-ui/react';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Button } from '../button';
import { TextInput } from '../text-input';
import * as styles from './toolbar.css';
import type { ToolbarRootVariants } from './toolbar.css';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Root
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToolbar.Root
            ref={ref}
            className={clsx(styles.root(), className)}
            {...componentProps}
            orientation="horizontal"
        />
    );
});
ToolbarRoot.displayName = 'ToolbarRoot';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Group
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroup.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToolbar.Group
            ref={ref}
            className={clsx(styles.group, className)}
            {...componentProps}
        />
    );
});
ToolbarGroup.displayName = 'ToolbarGroup';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Button
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButton.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToolbar.Button
            ref={ref}
            render={render ?? <Button colorPalette="secondary" variant="ghost" />}
            className={clsx(styles.button, className)}
            {...componentProps}
        />
    );
});
ToolbarButton.displayName = 'ToolbarButton';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Input
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarInput = forwardRef<HTMLInputElement, ToolbarInput.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToolbar.Input
            ref={ref}
            render={render ?? <TextInput />}
            className={clsx(styles.input, className)}
            {...componentProps}
        />
    );
});
ToolbarInput.displayName = 'ToolbarInput';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Separator
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToolbar.Separator
            ref={ref}
            className={clsx(styles.separator, className)}
            {...componentProps}
            orientation="horizontal"
        />
    );
});
ToolbarSeparator.displayName = 'ToolbarSeparator';

/* -----------------------------------------------------------------------------------------------*/

export type ToolbarVariants = ToolbarRootVariants;

export interface ToolbarRootProps extends Omit<
    VaporUIComponentProps<typeof BaseToolbar.Root, ToolbarRoot.State>,
    'orientation'
> {}

export namespace ToolbarRoot {
    export type State = BaseToolbar.Root.State;
    export type Props = ToolbarRootProps & ToolbarVariants;
}

export namespace ToolbarGroup {
    export type State = BaseToolbar.Group.State;
    export type Props = VaporUIComponentProps<typeof BaseToolbar.Group, ToolbarGroup.State>;
}

export namespace ToolbarButton {
    export type State = BaseToolbar.Button.State;
    export type Props = VaporUIComponentProps<typeof BaseToolbar.Button, ToolbarButton.State>;
}

export namespace ToolbarInput {
    export type State = BaseToolbar.Input.State;
    export type Props = VaporUIComponentProps<typeof BaseToolbar.Input, ToolbarInput.State>;
}

export interface ToolbarSeparatorProps extends Omit<
    VaporUIComponentProps<typeof BaseToolbar.Separator, ToolbarSeparator.State>,
    'orientation'
> {}

export namespace ToolbarSeparator {
    export type State = BaseToolbar.Separator.State;
    export type Props = ToolbarSeparatorProps;
}
