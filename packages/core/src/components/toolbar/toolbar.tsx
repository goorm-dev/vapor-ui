import { forwardRef } from 'react';

import { Toolbar as BaseToolbar } from '@base-ui/react';
import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Button } from '../button';
import { TextInput } from '../text-input';
import * as styles from './toolbar.css';
import type { ToolbarItemVariants, ToolbarRootVariants } from './toolbar.css';

const [ToolbarProvider, useToolbarContext] = createContext<ToolbarContext>({
    name: 'Toolbar',
    hookName: 'useToolbarContext',
    providerName: 'ToolbarProvider',
    defaultValue: { disabled: false, size: 'md', variant: 'outline' },
});

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Root
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarRoot.Props>((props, ref) => {
    const { disabled, className, ...componentProps } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<ToolbarVariants>()(componentProps, [
        'variant',
        'size',
    ]);

    const { variant } = variantProps;

    const contextValue = {
        disabled,
        ...variantProps,
    };

    return (
        <ToolbarProvider value={contextValue}>
            <BaseToolbar.Root
                ref={ref}
                disabled={disabled}
                className={clsx(styles.root({ variant }), className)}
                {...otherProps}
                orientation="horizontal"
            />
        </ToolbarProvider>
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
    const {
        render,
        disabled: disabledProp = false,
        focusableWhenDisabled,
        className,
        ...componentProps
    } = resolveStyles(props);
    const { disabled: contextDisabled, size } = useToolbarContext();

    const disabled = disabledProp ?? contextDisabled ?? false;
    const focusable = focusableWhenDisabled ?? !disabled;

    const state = {
        disabled,
        focusable,
        orientation: 'horizontal',
    } satisfies ToolbarButton.State;

    const element = useRenderElement<typeof state, HTMLButtonElement>({
        render: render ?? <Button variant="ghost" colorPalette="secondary" />,
        state,
        props: { size },
    });

    return (
        <BaseToolbar.Button
            ref={ref}
            render={element}
            focusableWhenDisabled={focusableWhenDisabled}
            className={clsx(styles.item({ size }), className)}
            {...componentProps}
        />
    );
});
ToolbarButton.displayName = 'ToolbarButton';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Input
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarInput = forwardRef<HTMLInputElement, ToolbarInput.Props>((props, ref) => {
    const {
        render,
        disabled: disabledProp,
        focusableWhenDisabled,
        onChange,
        onValueChange,
        className,
        ...componentProps
    } = resolveStyles(props);
    const handleValueChange = (value: string) => {
        onValueChange?.(value);
    };

    const { disabled: contextDisabled, size } = useToolbarContext();

    const disabled = disabledProp ?? contextDisabled ?? false;
    const focusable = focusableWhenDisabled ?? !disabled;

    const state = {
        disabled,
        focusable,
        orientation: 'horizontal',
    } satisfies ToolbarInput.State;

    const element = useRenderElement<typeof state, HTMLInputElement>({
        render: render ?? <TextInput size={size} />,
        state,
        props: { size },
    });

    return (
        <BaseToolbar.Input
            ref={ref}
            render={element}
            disabled={disabled}
            focusableWhenDisabled={focusableWhenDisabled}
            className={clsx(styles.item({ size }), className)}
            onChange={(e) => {
                onChange?.(e);
                handleValueChange(e.target.value);
            }}
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

type ToolbarVariants = ToolbarRootVariants & ToolbarItemVariants;
type ToolbarContext = ToolbarVariants & { disabled?: boolean };

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

export interface ToolbarInputProps extends Omit<
    VaporUIComponentProps<typeof BaseToolbar.Input, ToolbarInput.State>,
    'size'
> {
    /**
     * Callback fired when the value of the Input changes. It receives the new value and the original change event details from the underlying BaseToolbar.Input component.
     */
    onValueChange?: (value: string) => void;
}

export namespace ToolbarInput {
    export type State = BaseToolbar.Input.State;
    export type Props = ToolbarInputProps;
}

export interface ToolbarSeparatorProps extends Omit<
    VaporUIComponentProps<typeof BaseToolbar.Separator, ToolbarSeparator.State>,
    'orientation'
> {}

export namespace ToolbarSeparator {
    export type State = BaseToolbar.Separator.State;
    export type Props = ToolbarSeparatorProps;
}
