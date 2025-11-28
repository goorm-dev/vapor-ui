import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Toast as BaseToast } from '@base-ui-components/react/toast';
import { CheckCircleIcon, CloseOutlineIcon, SlotIcon, WarningIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createSlot } from '~/libs/create-slot';
import { resolveStyles } from '~/utils/resolve-styles';
import type { AnyProp, VComponentProps } from '~/utils/types';

import { Box } from '../box';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { IconButton } from '../icon-button';
import { VStack } from '../v-stack';
import * as styles from './toast.css';

/* -------------------------------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------------------------*/

type IconMapper = { [key: string]: ReactNode };
const TOAST_ICONS: IconMapper = {
    success: <CheckCircleIcon size="16" />,
    danger: <WarningIcon size="16" />,
    info: <SlotIcon size="16" />,
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type ToastType = 'success' | 'danger' | 'info';

export interface ToastData {
    icon?: ReactNode;
    [key: string]: AnyProp;
}

type BaseToastManager = BaseToast.createToastManager.ToastManager;
type BaseAddOptions = Parameters<BaseToastManager['add']>[0];
type BaseUpdateOptions = Parameters<BaseToastManager['update']>[1];
type BasePromiseOptions = Parameters<BaseToastManager['promise']>[1];

export interface ToastManagerAddOptions extends Omit<BaseAddOptions, 'type' | 'actionProps'> {
    colorPalette?: ToastType;
    icon?: ReactNode;
    action?: ReactNode;
    close?: ReactNode;
}

export interface ToastManagerUpdateOptions extends Omit<BaseUpdateOptions, 'type' | 'actionProps'> {
    colorPalette?: ToastType;
    icon?: ReactNode;
    action?: ReactNode;
    close?: ReactNode;
}

export interface ToastManagerPromiseOptions<Value>
    extends Omit<BasePromiseOptions, 'loading' | 'success' | 'error'> {
    loading: string | ToastManagerAddOptions;
    success: string | BaseUpdateOptions | ((result: Value) => string | BaseUpdateOptions);
    error: string | BaseUpdateOptions | ((error: AnyProp) => string | BaseUpdateOptions);
}

export interface ToastManager extends Omit<BaseToastManager, 'add' | 'update' | 'promise'> {
    add(options: ToastManagerAddOptions): string;
    update(id: string, options: ToastManagerUpdateOptions): void;
    promise<V>(promise: Promise<V>, options: ToastManagerPromiseOptions<V>): Promise<V>;
}

/* -------------------------------------------------------------------------------------------------
 * Toast Manager
 * -----------------------------------------------------------------------------------------------*/

export const createToastManager = BaseToast.createToastManager;
export const useToastManager = BaseToast.useToastManager;
const baseToastManager = BaseToast.createToastManager();

const buildToastData = (options: {
    action?: ReactNode;
    close?: ReactNode;
    icon?: ReactNode;
    colorPalette?: ToastType;
    data?: AnyProp;
}) => {
    const { action, close, icon, colorPalette, data: defaultData, ...rest } = options;
    const data = { action, close, icon, colorPalette, ...defaultData };

    return { type: colorPalette, data, ...rest };
};

export const toastManager: ToastManager = {
    ...baseToastManager,
    add: (optionsParams) => {
        const options = buildToastData(optionsParams);

        return baseToastManager.add(options);
    },
    update: (id, optionsParams) => {
        const options = buildToastData(optionsParams);

        baseToastManager.update(id, options);
    },
    promise: (promise, options) => {
        return baseToastManager.promise(promise, options);
    },
};

/* -------------------------------------------------------------------------------------------------
 * Toaster
 * -----------------------------------------------------------------------------------------------*/

export const Toaster = (props: Toaster.Props) => {
    const { timeout = 4000, children, ...componentProps } = props;

    return (
        <ToastProviderPrimitive toastManager={toastManager} timeout={timeout} {...componentProps}>
            {children}
            <ToastList />
        </ToastProviderPrimitive>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Toast.List
 * -----------------------------------------------------------------------------------------------*/

export const ToastList = () => {
    const { toasts } = BaseToast.useToastManager();

    return (
        <ToastPortalPrimitive>
            <ToastViewportPrimitive>
                {toasts.map((toast) => {
                    const { action, close, icon, colorPalette } = toast.data;
                    const IconElement = createSlot(icon ?? TOAST_ICONS[colorPalette || 'info']);

                    const ActionElement = createSlot(action ?? <ToastActionPrimitive />);
                    const CloseElement = createSlot(close ?? <ToastClosePrimitive />);

                    return (
                        <ToastRootPrimitive key={toast.id} toast={toast}>
                            <ToastContentPrimitive>
                                <HStack gap="$075">
                                    <Box marginY="3px">
                                        <IconElement color="var(--vapor-color-white)" />
                                    </Box>
                                    <VStack>
                                        <ToastTitlePrimitive />
                                        <ToastDescriptionPrimitive />
                                    </VStack>
                                </HStack>
                                <HStack gap="$100" alignItems="center">
                                    {/* <ToastActionPrimitive /> */}
                                    <ActionElement />
                                    {/* <ToastClosePrimitive /> */}
                                    <CloseElement />
                                </HStack>
                            </ToastContentPrimitive>
                        </ToastRootPrimitive>
                    );
                })}
            </ToastViewportPrimitive>
        </ToastPortalPrimitive>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Toast.ProviderPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastProviderPrimitive = ({
    toastManager,
    ...props
}: ToastProviderPrimitive.Props) => {
    return (
        <BaseToast.Provider
            toastManager={toastManager as unknown as BaseToast.createToastManager.ToastManager}
            {...props}
        />
    );
};
// export const ToastProviderPrimitive = BaseToast.Provider as React.ComponentType<
//     Omit<BaseToast.Provider.Props, 'toastManager'> & {
//         toastManager?: ToastManager;
//     }
// >;

/* -------------------------------------------------------------------------------------------------
 * Toast.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastPortalPrimitive = (props: ToastPortalPrimitive.Props) => {
    return <BaseToast.Portal {...props} />;
};
ToastPortalPrimitive.displayName = 'Toast.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ViewportPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastViewportPrimitive = forwardRef<HTMLDivElement, ToastViewportPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseToast.Viewport
                ref={ref}
                className={clsx(styles.viewport, className)}
                {...componentProps}
            />
        );
    },
);
ToastViewportPrimitive.displayName = 'Toast.ViewportPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastRootPrimitive = forwardRef<HTMLDivElement, ToastRootPrimitive.Props>(
    (props, ref) => {
        const { toast, className, ...componentProps } = resolveStyles(props);
        const { colorPalette = 'info' } = toast.data ?? {};

        return (
            <BaseToast.Root
                ref={ref}
                toast={toast}
                className={clsx(styles.root({ colorPalette }), className)}
                {...componentProps}
            />
        );
    },
);
ToastRootPrimitive.displayName = 'Toast.RootPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ContentPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastContentPrimitive = forwardRef<HTMLDivElement, ToastContentPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseToast.Content
                ref={ref}
                className={clsx(styles.content, className)}
                {...componentProps}
            />
        );
    },
);
ToastContentPrimitive.displayName = 'Toast.ContentPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.TitlePrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastTitlePrimitive = forwardRef<HTMLHeadingElement, ToastTitlePrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseToast.Title
                ref={ref}
                className={clsx(styles.title, className)}
                {...componentProps}
            />
        );
    },
);
ToastTitlePrimitive.displayName = 'Toast.TitlePrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.DescriptionPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastDescriptionPrimitive = forwardRef<
    HTMLParagraphElement,
    ToastDescriptionPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToast.Description
            ref={ref}
            className={clsx(styles.description, className)}
            {...componentProps}
        />
    );
});
ToastDescriptionPrimitive.displayName = 'Toast.DescriptionPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ActionPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastActionPrimitive = forwardRef<HTMLButtonElement, ToastActionPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return (
            <BaseToast.Action
                render={<Button colorPalette="secondary" />}
                ref={ref}
                {...componentProps}
            />
        );
    },
);
ToastActionPrimitive.displayName = 'Toast.ActionPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ClosePrimitive
 * -----------------------------------------------------------------------------------------------*/

export const ToastClosePrimitive = forwardRef<HTMLButtonElement, ToastClosePrimitive.Props>(
    (props, ref) => {
        const { render: renderProp, ...componentProps } = resolveStyles(props);

        const render = renderProp ?? (
            <IconButton
                aria-label="Close Toast"
                color="var(--vapor-color-white)"
                colorPalette="secondary"
                variant="ghost"
            />
        );

        return (
            <BaseToast.Close ref={ref} render={render} {...componentProps}>
                <CloseOutlineIcon />
            </BaseToast.Close>
        );
    },
);
ToastClosePrimitive.displayName = 'Toast.ClosePrimitive';

/* -----------------------------------------------------------------------------------------------*/

export namespace ToastProviderPrimitive {
    export interface Props extends Omit<BaseToast.Provider.Props, 'toastManager'> {
        toastManager?: ToastManager;
    }
}

export namespace Toaster {
    export interface Props extends BaseToast.Provider.Props {}
}

type ListPrimitiveProps = VComponentProps<typeof BaseToast.Viewport>;
export namespace ToastList {
    export interface Props extends ListPrimitiveProps {}
}

type PortalPrimitiveProps = BaseToast.Portal.Props;
export namespace ToastPortalPrimitive {
    export interface Props extends PortalPrimitiveProps {}
}

type ViewportPrimitiveProps = VComponentProps<typeof BaseToast.Viewport>;
export namespace ToastViewportPrimitive {
    export interface Props extends ViewportPrimitiveProps {}
}

type RootPrimitiveProps = VComponentProps<typeof BaseToast.Root>;
export namespace ToastRootPrimitive {
    export interface Props extends RootPrimitiveProps {}
}

type ContentPrimitiveProps = VComponentProps<typeof BaseToast.Content>;
export namespace ToastContentPrimitive {
    export interface Props extends ContentPrimitiveProps {}
}

export namespace ToastRoot {
    export interface Props extends ToastRootPrimitive.Props {}
}

type TitlePrimitiveProps = VComponentProps<typeof BaseToast.Title>;
export namespace ToastTitlePrimitive {
    export interface Props extends TitlePrimitiveProps {}
}

type DescriptionPrimitiveProps = VComponentProps<typeof BaseToast.Description>;
export namespace ToastDescriptionPrimitive {
    export interface Props extends DescriptionPrimitiveProps {}
}

type ActionPrimitiveProps = VComponentProps<typeof BaseToast.Action>;
export namespace ToastActionPrimitive {
    export interface Props extends ActionPrimitiveProps {}
}

type ClosePrimitiveProps = VComponentProps<typeof BaseToast.Close>;
export namespace ToastClosePrimitive {
    export interface Props extends ClosePrimitiveProps {}
}
