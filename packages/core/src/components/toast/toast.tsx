import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Toast as BaseToast } from '@base-ui-components/react/toast';
import { CheckCircleIcon, CloseOutlineIcon, WarningIcon } from '@vapor-ui/icons';
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
import type { RootVariants } from './toast.css';

type ToastVariants = RootVariants;
// type ButtonProps = ComponentPropsWithoutRef<'button'> & ButtonVariants;
type ToastElementProps = { icon?: ReactNode; close?: boolean };

export type ToastManagerOptions = ToastVariants & ToastElementProps;

type BaseToastManager = BaseToast.createToastManager.ToastManager;

type BaseAddOptions = Omit<Parameters<BaseToastManager['add']>[0], 'type'>;
type BaseUpdateOptions = Omit<Parameters<BaseToastManager['update']>[1], 'type'>;
type BasePromiseOptions = Omit<
    Parameters<BaseToastManager['promise']>[1],
    'loading' | 'success' | 'error'
>;

export interface ToastManagerAddOptions extends BaseAddOptions, ToastManagerOptions {}
export interface ToastManagerUpdateOptions extends BaseUpdateOptions, ToastManagerOptions {}
export interface ToastManagerPromiseOptions<Value> extends BasePromiseOptions {
    loading: string | ToastManagerAddOptions;
    success:
        | string
        | ToastManagerUpdateOptions
        | ((result: Value) => string | ToastManagerUpdateOptions);
    error:
        | string
        | ToastManagerUpdateOptions
        | ((error: AnyProp) => string | ToastManagerUpdateOptions);
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

const buildToastData = (options: ToastManagerAddOptions) => {
    const { close, icon, data: defaultData, ...rest } = options;
    const data = { close, icon, ...defaultData };

    return { type: rest.colorPalette, data, ...rest };
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
 * ToastProvider
 * -----------------------------------------------------------------------------------------------*/

export const ToastProvider = (props: ToastProvider.Props) => {
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

type IconMapper = { [key: string]: ReactNode };
const TOAST_ICONS: IconMapper = {
    success: <CheckCircleIcon size="16" />,
    danger: <WarningIcon size="16" />,
};

export const ToastList = () => {
    const { toasts } = BaseToast.useToastManager();

    return (
        <ToastPortalPrimitive>
            <ToastViewportPrimitive>
                {toasts.map((toast) => {
                    const { close = true, icon, colorPalette } = toast.data;
                    const IconElement = createSlot(icon ?? TOAST_ICONS[colorPalette || 'info']);

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
                                    <ToastActionPrimitive />
                                    {close && <ToastClosePrimitive />}
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

        return <BaseToast.Action render={<Button />} ref={ref} {...componentProps} />;
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
                color="$inverse"
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

export namespace ToastProvider {
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
