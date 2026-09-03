'use client';

import type { ReactElement } from 'react';
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

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

type Size = NonNullable<TrackVariants['size']>;
type Type = NonNullable<DescriptionVariants['type']>;

interface ProgressBarContext {
    size: Size;
    /**
     * Tone of the bar: it recolours `ProgressBar.Description`, and on `'error'` also dims the
     * track and drops the indicator.
     */
    type: Type;
    /** Lets a mounted `ProgressBar.Description` hand its id to the Root. */
    setDescriptionId: (id: string | undefined) => void;
    /** Value text derived from the declared range — the single source for both audiences. */
    formattedValue: string | null;
    /** Consumer-supplied value text. When present it wins over `formattedValue`. */
    valueText: string | undefined;
}

const [ProgressBarProvider, useProgressBarContext] = createContext<ProgressBarContext>({
    name: 'ProgressBarContext',
    providerName: 'ProgressBarProvider',
    hookName: 'useProgressBarContext',
});

/* -----------------------------------------------------------------------------------------------*/

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const resolveRange = (min: number, max: number): [number, number] => {
    if (max > min) return [min, max];

    if (process.env.NODE_ENV !== 'production') {
        warn(
            `ProgressBar received min={${min}} and max={${max}}. \`min\` must be less than \`max\`. Falling back to ${DEFAULT_MIN}–${DEFAULT_MAX}.`,
        );
    }
    return [DEFAULT_MIN, DEFAULT_MAX];
};

/**
 * base-ui formats the default value text as `value / 100`, which disagrees with the indicator
 * fill on any range other than 0–100. Scaling by the declared range keeps both audiences on
 * the same number.
 */
const formatValue = (
    value: number | null,
    min: number,
    max: number,
    locale: Intl.LocalesArgument | undefined,
    format: Intl.NumberFormatOptions | undefined,
) => {
    if (value == null) return null;
    if (format) return new Intl.NumberFormat(locale, format).format(value);

    return new Intl.NumberFormat(locale, { style: 'percent' }).format((value - min) / (max - min));
};

/**
 * base-ui always writes `aria-valuetext`. APG asks for it only when `aria-valuenow` is not
 * meaningful on its own, so the default is neutralised and the Root writes the attribute itself.
 */
const OMIT_ARIA_VALUE_TEXT = () => undefined as unknown as string;

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Shows how far a task with a start and an end has progressed. Renders a `<div>` element.
 *
 * Use `Meter` instead for a reading on a fixed scale, such as disk usage or a score.
 */
export const ProgressBarRoot = forwardRef<HTMLDivElement, ProgressBarRoot.Props>((props, ref) => {
    const {
        className,
        children,
        size = 'md',
        type = 'default',
        value,
        // Literals, not the constants below: the docs extractor prints the default verbatim.
        min: minProp = 0,
        max: maxProp = 100,
        format,
        locale,
        getAriaValueText,
        'aria-describedby': ariaDescribedBy,
        ...componentProps
    } = resolveStyles(props);

    const [min, max] = resolveRange(minProp, maxProp);
    const clampedValue = value == null ? null : clamp(value, min, max);
    const formattedValue = formatValue(clampedValue, min, max, locale, format);
    const valueText = getAriaValueText?.(formattedValue, clampedValue);

    const [descriptionId, setDescriptionId] = useState<string>();
    const contextValue = useMemo<ProgressBarContext>(
        () => ({ size, type, formattedValue, valueText, setDescriptionId }),
        [size, type, formattedValue, valueText],
    );

    const rootRef = useRef<HTMLDivElement>(null);
    useNameWarning(rootRef);

    return (
        <ProgressBarProvider value={contextValue}>
            <BaseProgress.Root
                ref={mergeRefs(ref, rootRef)}
                value={clampedValue}
                min={min}
                max={max}
                format={format}
                locale={locale}
                getAriaValueText={OMIT_ARIA_VALUE_TEXT}
                aria-valuetext={valueText}
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
 * The filled portion of the track. Renders a `<div>` element.
 *
 * `type="error"` renders nothing — a fill would still read as progress on a task that failed.
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
 * The value text shown on screen. Renders a `<span>` element.
 *
 * It reads the same value the screen reader hears, so the two audiences never disagree.
 */
export const ProgressBarValue = forwardRef<HTMLSpanElement, ProgressBarValue.Props>(
    (props, ref) => {
        const { className, children, ...componentProps } = resolveStyles(props);
        const { formattedValue, valueText } = useProgressBarContext();

        return (
            <BaseProgress.Value
                ref={ref}
                className={cn(styles.value, className)}
                {...componentProps}
            >
                {children ?? (() => valueText ?? formattedValue)}
            </BaseProgress.Value>
        );
    },
);
ProgressBarValue.displayName = 'ProgressBar.Value';

/* -------------------------------------------------------------------------------------------------
 * ProgressBar.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Explains the progress in words — a failure reason, a next step. Renders a `<span>` element.
 *
 * It reaches assistive technology through `aria-describedby`, wired up automatically. Pass an
 * `id` to use your own instead.
 *
 * `type="error"` on `ProgressBar.Root` recolours this text and dims the track, but the wording
 * still has to name the failure on its own — colour alone reaches neither a screen reader nor a
 * user who cannot tell red from grey.
 */
export const ProgressBarDescription = forwardRef<HTMLSpanElement, ProgressBarDescription.Props>(
    (props, ref) => {
        const { className, render, id: idProp, ...componentProps } = resolveStyles(props);
        const { type, setDescriptionId } = useProgressBarContext();

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
            props: {
                id,
                className: cn(styles.description({ type }), className),
                ...componentProps,
            },
        });
    },
);
ProgressBarDescription.displayName = 'ProgressBar.Description';

/* -----------------------------------------------------------------------------------------------*/

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
    return (node: T | null) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
        }
    };
}

/**
 * base-ui renders a nameless progressbar without complaint, which announces as a bare number.
 * Reading the mounted node is the only reliable way to tell whether a Label or `aria-label`
 * ended up there.
 */
function useNameWarning(ref: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        // `ProgressBar.Label` registers its id in an effect of its own, so `aria-labelledby`
        // only lands on a later commit. Deferring past this render — and cancelling on the
        // next one — means the check runs once, on the settled DOM.
        const timer = setTimeout(() => {
            const node = ref.current;
            if (!node) return;
            if (node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby')) return;

            warn(
                'ProgressBar has no accessible name. Render a `ProgressBar.Label`, or pass `aria-label` / `aria-labelledby` to `ProgressBar.Root`.',
            );
        }, 0);

        return () => clearTimeout(timer);
    });
}

/* -----------------------------------------------------------------------------------------------*/

export namespace ProgressBarRoot {
    export type State = BaseProgress.Root.State;
    export type Props = Omit<
        VaporUIComponentProps<typeof BaseProgress.Root, State>,
        'getAriaValueText'
    > &
        Partial<Pick<TrackVariants, 'size'>> &
        Partial<Pick<DescriptionVariants, 'type'>> & {
            /**
             * Returns the value text read by assistive technology. Without it no
             * `aria-valuetext` is written, and `aria-valuenow` carries the value on its own.
             *
             * The returned string also becomes the visible `ProgressBar.Value` text.
             */
            getAriaValueText?: (formattedValue: string | null, value: number | null) => string;
        };
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
     * A custom element for `ProgressBar.IndicatorPrimitive`. If not provided, the default
     * `ProgressBar.IndicatorPrimitive` will be rendered.
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
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}
