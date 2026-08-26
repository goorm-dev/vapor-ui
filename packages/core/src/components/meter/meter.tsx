'use client';

import type { RefObject } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

import { Meter as BaseMeter } from '@base-ui/react/meter';

import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';
import { warn } from '~/utils/warn';

import type { IndicatorVariants, TrackVariants } from './meter.css';
import * as styles from './meter.css';

type MeterVariants = TrackVariants & IndicatorVariants;
type MeterSharedProps = MeterVariants;

type MeterContext = MeterSharedProps & {
    /** Set by `Meter.Label` so the root can warn when the meter has no accessible name. */
    labelledRef: RefObject<boolean>;
};

const [MeterProvider, useMeterContext] = createContext<MeterContext>({
    name: 'Meter',
    hookName: 'useMeterContext',
    providerName: 'MeterProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Meter.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Displays a measurement inside a known range, such as disk usage or a score. Renders a `<div>` element.
 */
export const MeterRoot = forwardRef<HTMLDivElement, MeterRoot.Props>((props, ref) => {
    const { className, min = 0, max = 100, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<MeterSharedProps>()(componentProps, [
        'variant',
        'size',
    ]);

    const labelledRef = useRef(false);
    const ariaLabel = otherProps['aria-label'];
    const ariaLabelledBy = otherProps['aria-labelledby'];

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        if (min >= max) {
            warn(
                `Meter received min={${min}} and max={${max}}. \`min\` must be less than \`max\` for the value to be meaningful.`,
            );
        }

        if (!labelledRef.current && !ariaLabel && !ariaLabelledBy) {
            warn(
                'Meter has no accessible name. Render a `Meter.Label`, or pass `aria-label` / `aria-labelledby` to `Meter.Root`.',
            );
        }
    }, [min, max, ariaLabel, ariaLabelledBy]);

    return (
        <MeterProvider value={{ ...variantProps, labelledRef }}>
            <BaseMeter.Root
                ref={ref}
                min={min}
                max={max}
                className={cn(styles.root, className)}
                {...otherProps}
            />
        </MeterProvider>
    );
});
MeterRoot.displayName = 'Meter.Root';

/* -------------------------------------------------------------------------------------------------
 * Meter.Label
 * -----------------------------------------------------------------------------------------------*/

/**
 * Names the meter for assistive technology and shows that name on screen. Renders a `<span>` element.
 */
export const MeterLabel = forwardRef<HTMLSpanElement, MeterLabel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { labelledRef } = useMeterContext();

    useEffect(() => {
        labelledRef.current = true;

        return () => {
            labelledRef.current = false;
        };
    }, [labelledRef]);

    return (
        <BaseMeter.Label ref={ref} className={cn(styles.label, className)} {...componentProps} />
    );
});
MeterLabel.displayName = 'Meter.Label';

/* -------------------------------------------------------------------------------------------------
 * Meter.Track
 * -----------------------------------------------------------------------------------------------*/

/**
 * Represents the full range of the meter and contains the indicator. Renders a `<div>` element.
 */
export const MeterTrack = forwardRef<HTMLDivElement, MeterTrack.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { size } = useMeterContext();

    return (
        <BaseMeter.Track
            ref={ref}
            className={cn(styles.track({ size }), className)}
            {...componentProps}
        />
    );
});
MeterTrack.displayName = 'Meter.Track';

/* -------------------------------------------------------------------------------------------------
 * Meter.Indicator
 * -----------------------------------------------------------------------------------------------*/

/**
 * Fills the portion of the track that corresponds to the current value. Renders a `<div>` element.
 */
export const MeterIndicator = forwardRef<HTMLDivElement, MeterIndicator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { variant } = useMeterContext();

    return (
        <BaseMeter.Indicator
            ref={ref}
            className={cn(styles.indicator({ variant }), className)}
            {...componentProps}
        />
    );
});
MeterIndicator.displayName = 'Meter.Indicator';

/* -------------------------------------------------------------------------------------------------
 * Meter.Value
 * -----------------------------------------------------------------------------------------------*/

/**
 * Shows the formatted value as text, hidden from assistive technology to avoid a duplicate announcement. Renders a `<span>` element.
 */
export const MeterValue = forwardRef<HTMLSpanElement, MeterValue.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMeter.Value ref={ref} className={cn(styles.value, className)} {...componentProps} />
    );
});
MeterValue.displayName = 'Meter.Value';

/* -----------------------------------------------------------------------------------------------*/

export namespace MeterRoot {
    export type State = BaseMeter.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseMeter.Root, State> & MeterSharedProps;
}

export namespace MeterLabel {
    export type State = BaseMeter.Label.State;
    export type Props = VaporUIComponentProps<typeof BaseMeter.Label, State>;
}

export namespace MeterTrack {
    export type State = BaseMeter.Track.State;
    export type Props = VaporUIComponentProps<typeof BaseMeter.Track, State>;
}

export namespace MeterIndicator {
    export type State = BaseMeter.Indicator.State;
    export type Props = VaporUIComponentProps<typeof BaseMeter.Indicator, State>;
}

export namespace MeterValue {
    export type State = BaseMeter.Value.State;
    export type Props = VaporUIComponentProps<typeof BaseMeter.Value, State>;
}
