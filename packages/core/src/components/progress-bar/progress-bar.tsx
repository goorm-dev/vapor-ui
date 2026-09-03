'use client';

import type { ReactElement, RefObject } from 'react';
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';

import { Progress as BaseProgress } from '@base-ui/react/progress';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';
import { warn } from '~/utils/warn';

import type { DescriptionVariants, TrackVariants } from './progress-bar.css';
import * as styles from './progress-bar.css';

type ProgressBarVariants = Pick<TrackVariants, 'size'> & Pick<DescriptionVariants, 'type'>;
type Status = BaseProgress.Root.State['status'];

interface ProgressBarContext extends Required<ProgressBarVariants> {
    status: Status;
    setDescriptionId: (id: string | undefined) => void;
    /** Set by `ProgressBar.Label` so the root can warn when the bar has no accessible name. */
    hasLabelRef: RefObject<boolean>;
}

const [ProgressBarProvider, useProgressBarContext] = createContext<ProgressBarContext>({
    name: 'ProgressBarContext',
    providerName: 'ProgressBarProvider',
    hookName: 'useProgressBarContext',
});

/* -----------------------------------------------------------------------------------------------*/

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * base-ui always writes `aria-valuetext`. APG asks for it only when `aria-valuenow` is not
 * meaningful on its own, so the default is neutralised unless the consumer supplies one.
 */
const OMIT_ARIA_VALUE_TEXT = () => undefined as unknown as string;

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Shows how far a task with a start and an end has progressed; for a reading on a fixed scale such as disk usage or a score, use `Meter` instead. Renders a `<div>` element.
 */
export const ProgressBarRoot = forwardRef<HTMLDivElement, ProgressBarRoot.Props>((props, ref) => {
    const {
        className,
        children,
        size = 'md',
        type = 'default',
        value,
        min = 0,
        max = 100,
        getAriaValueText,
        'aria-describedby': ariaDescribedBy,
        ...componentProps
    } = resolveStyles(props);

    const clampedValue = value == null ? null : clamp(value, min, max);
    const status: Status =
        clampedValue == null ? 'indeterminate' : clampedValue === max ? 'complete' : 'progressing';

    const [descriptionId, setDescriptionId] = useState<string>();
    const hasLabelRef = useRef(false);
    const contextValue = useMemo<ProgressBarContext>(
        () => ({ size, type, status, setDescriptionId, hasLabelRef }),
        [size, type, status],
    );

    const ariaLabel = componentProps['aria-label'];
    const ariaLabelledBy = componentProps['aria-labelledby'];

    // base-ui renders a nameless progressbar without complaint, which announces as a bare number.
    // `ProgressBar.Label` flips `hasLabelRef` in its own effect, which React runs before this one.
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        if (min >= max) {
            warn(
                `ProgressBar received min={${min}} and max={${max}}. \`min\` must be less than \`max\` for the value to be meaningful.`,
            );
        }

        if (!hasLabelRef.current && !ariaLabel && !ariaLabelledBy) {
            warn(
                'ProgressBar has no accessible name. Render a `ProgressBar.Label`, or pass `aria-label` / `aria-labelledby` to `ProgressBar.Root`.',
            );
        }
    }, [min, max, ariaLabel, ariaLabelledBy]);

    return (
        <ProgressBarProvider value={contextValue}>
            <BaseProgress.Root
                ref={ref}
                value={clampedValue}
                min={min}
                max={max}
                getAriaValueText={getAriaValueText ?? OMIT_ARIA_VALUE_TEXT}
                // Appended, never replaced: a description the consumer wired up and ours both apply.
                aria-describedby={
                    [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined
                }
                className={cn(styles.root, className)}
                {...componentProps}
            >
                {children}
            </BaseProgress.Root>
        </ProgressBarProvider>
    );
});
ProgressBarRoot.displayName = 'ProgressBar.Root';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Label
 * -----------------------------------------------------------------------------------------------*/

/**
 * Names the task that is in progress, and becomes the accessible name. Renders a `<span>` element.
 */
export const ProgressBarLabel = forwardRef<HTMLSpanElement, ProgressBarLabel.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { hasLabelRef } = useProgressBarContext();

        useEffect(() => {
            hasLabelRef.current = true;

            return () => {
                hasLabelRef.current = false;
            };
        }, [hasLabelRef]);

        return (
            <BaseProgress.Label
                ref={ref}
                className={cn(styles.label, className)}
                {...componentProps}
            />
        );
    },
);
ProgressBarLabel.displayName = 'ProgressBar.Label';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.TrackPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The full length of the task without any indicator inside. Renders a `<div>` element.
 */
export const ProgressBarTrackPrimitive = forwardRef<
    HTMLDivElement,
    ProgressBarTrackPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { size, type } = useProgressBarContext();

    return (
        <BaseProgress.Track
            ref={ref}
            className={cn(styles.track({ size, type }), className)}
            {...componentProps}
        />
    );
});
ProgressBarTrackPrimitive.displayName = 'ProgressBar.TrackPrimitive';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.IndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The filled portion of the track, omitted entirely when `type` is `'error'` so a failed task never reads as progress. Renders a `<div>` element.
 */
export const ProgressBarIndicatorPrimitive = forwardRef<
    HTMLDivElement,
    ProgressBarIndicatorPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { type } = useProgressBarContext();

    if (type === 'error') return null;

    return (
        <BaseProgress.Indicator
            ref={ref}
            className={cn(styles.indicator, className)}
            {...componentProps}
        />
    );
});
ProgressBarIndicatorPrimitive.displayName = 'ProgressBar.IndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Track
 * -----------------------------------------------------------------------------------------------*/

/**
 * The full length of the task, with `ProgressBar.IndicatorPrimitive` rendered inside. Renders a `<div>` element.
 */
export const ProgressBarTrack = forwardRef<HTMLDivElement, ProgressBarTrack.Props>((props, ref) => {
    const { indicatorElement, ...componentProps } = props;

    return (
        <ProgressBarTrackPrimitive ref={ref} {...componentProps}>
            {indicatorElement ?? <ProgressBarIndicatorPrimitive />}
        </ProgressBarTrackPrimitive>
    );
});
ProgressBarTrack.displayName = 'ProgressBar.Track';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Value
 * -----------------------------------------------------------------------------------------------*/

/**
 * The value text shown on screen; pass a `children` function to match any custom `getAriaValueText`. Renders a `<span>` element.
 */
export const ProgressBarValue = forwardRef<HTMLSpanElement, ProgressBarValue.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseProgress.Value
                ref={ref}
                className={cn(styles.value, className)}
                {...componentProps}
            />
        );
    },
);
ProgressBarValue.displayName = 'ProgressBar.Value';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Explains the progress in words, such as a failure reason or a next step, and reaches assistive technology through `aria-describedby`. Renders a `<span>` element.
 */
export const ProgressBarDescription = forwardRef<HTMLSpanElement, ProgressBarDescription.Props>(
    (props, ref) => {
        const { className, render, id: idProp, ...componentProps } = resolveStyles(props);
        const { type, status, setDescriptionId } = useProgressBarContext();

        const fallbackId = useId();
        const id = idProp ?? fallbackId;

        useEffect(() => {
            setDescriptionId(id);
            return () => setDescriptionId(undefined);
        }, [id, setDescriptionId]);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'span',
            state: { status },
            props: {
                id,
                // A progressbar's children are presentational; pinning the role keeps a `render`
                // swap to `<h3>` or `<label>` from leaking a second identity into the tree.
                role: 'presentation',
                className: cn(styles.description({ type }), className),
                ...componentProps,
            },
        });
    },
);
ProgressBarDescription.displayName = 'ProgressBar.Description';

/* -----------------------------------------------------------------------------------------------*/

export namespace ProgressBarRoot {
    export type State = BaseProgress.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseProgress.Root, State> &
        ProgressBarVariants;
}

export namespace ProgressBarLabel {
    export type State = BaseProgress.Label.State;
    export type Props = VaporUIComponentProps<typeof BaseProgress.Label, State>;
}

export namespace ProgressBarTrackPrimitive {
    export type State = BaseProgress.Track.State;
    export type Props = VaporUIComponentProps<typeof BaseProgress.Track, State>;
}

export namespace ProgressBarIndicatorPrimitive {
    export type State = BaseProgress.Indicator.State;
    export type Props = VaporUIComponentProps<typeof BaseProgress.Indicator, State>;
}

export interface ProgressBarTrackProps extends Omit<ProgressBarTrackPrimitive.Props, 'children'> {
    /**
     * Replaces the `ProgressBar.IndicatorPrimitive` rendered inside the track by default.
     */
    indicatorElement?: ReactElement<ProgressBarIndicatorPrimitive.Props>;
}

export namespace ProgressBarTrack {
    export type State = ProgressBarTrackPrimitive.State;
    export type Props = ProgressBarTrackProps;
}

export namespace ProgressBarValue {
    export type State = BaseProgress.Value.State;
    export type Props = VaporUIComponentProps<typeof BaseProgress.Value, State>;
}

export namespace ProgressBarDescription {
    export type State = Pick<BaseProgress.Root.State, 'status'>;
    export type Props = VaporUIComponentProps<'span', State>;
}
