import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';

import type { BaseUIEvent } from '@base-ui/react';
import { Toolbar as BaseToolbar } from '@base-ui/react';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
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
    defaultValue: { size: 'md', variant: 'outline' },
});

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Root
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<ToolbarVariants>()(componentProps, [
        'variant',
        'size',
    ]);

    const { variant } = variantProps;

    return (
        <ToolbarProvider value={variantProps}>
            <BaseToolbar.Root
                ref={ref}
                className={cn(styles.root({ variant }), className)}
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
        <BaseToolbar.Group ref={ref} className={cn(styles.group, className)} {...componentProps} />
    );
});
ToolbarGroup.displayName = 'ToolbarGroup';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Button
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButton.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const { size } = useToolbarContext();

    const element = useRenderElement<ToolbarState, HTMLButtonElement>({
        render: render ?? <Button variant="ghost" colorPalette="secondary" />,
        props: { size },
    });

    return (
        <BaseToolbar.Button
            ref={ref}
            render={element}
            className={cn(styles.item({ size }), className)}
            {...componentProps}
        />
    );
});
ToolbarButton.displayName = 'ToolbarButton';

/* -------------------------------------------------------------------------------------------------
 * Toolbar.Input
 * -----------------------------------------------------------------------------------------------*/

export const ToolbarInput = forwardRef<HTMLInputElement, ToolbarInput.Props>((props, ref) => {
    const { render, onChange, onValueChange, className, ...componentProps } = resolveStyles(props);
    const { size } = useToolbarContext();

    const handleValueChange = (e: BaseUIEvent<ChangeEvent<HTMLInputElement>>) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
    };

    const element = useRenderElement<ToolbarState, HTMLInputElement>({
        render: render ?? <TextInput size={size} />,
        props: { size },
    });

    return (
        <BaseToolbar.Input
            ref={ref}
            render={element}
            className={cn(styles.item({ size }), className)}
            onChange={handleValueChange}
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
            className={cn(styles.separator, className)}
            {...componentProps}
            orientation="vertical"
        />
    );
});
ToolbarSeparator.displayName = 'ToolbarSeparator';

/* -----------------------------------------------------------------------------------------------*/

type ToolbarVariants = ToolbarRootVariants & ToolbarItemVariants;
type ToolbarContext = ToolbarVariants;
type ToolbarState = {
    disabled: ToolbarButton.State['disabled'];
    focusable: ToolbarButton.State['focusable'];
    orientation: ToolbarButton.State['orientation'];
};

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
