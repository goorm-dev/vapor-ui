import type { ComponentPropsWithoutRef } from 'react';

import type { useRender } from '@base-ui/react/use-render';

import type {
    DeprecatedSprinkles as OriginalDeprecatedSprinkles,
    Sprinkles,
} from '~/styles/sprinkles.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProp = any;

export type Assign<T, U> = Omit<T, keyof U> & U;

type OmitColorProp<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

type CssProps = Sprinkles;

export type Styles = {
    /**
     * $css prop for applying sprinkles styles.
     * Supports all CSS properties plus design tokens. Use responsive conditions and pseudo-states.
     *
     * @example
     * // Basic usage
     * <Box $css={{ padding: '$400', backgroundColor: 'bg-primary-100' }} />
     *
     * // Responsive
     * <Box $css={{ display: { sm: 'block', lg: 'flex' }, gap: { sm: '$100', lg: '$300' } }} />
     *
     * // Pseudo-states
     * <Button $css={{ backgroundColor: { _hover: 'bg-primary-200' } }} />
     */
    $css?: CssProps;
};

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    useRender.ComponentProps<ElementType>,
    OmitColorProp<ElementType>
> &
    DeprecatedSprinkles &
    Styles;

/**
 * Deprecated CSS utility props. Use `$css` prop instead.
 */
export interface DeprecatedSprinkles {
    /**
     * @deprecated Use `$css={{ position: ... }}` instead
     */
    position?: OriginalDeprecatedSprinkles['position'];

    /**
     * @deprecated Use `$css={{ display: ... }}` instead
     */
    display?: OriginalDeprecatedSprinkles['display'];

    /**
     * @deprecated Use `$css={{ alignItems: ... }}` instead
     */
    alignItems?: OriginalDeprecatedSprinkles['alignItems'];

    /**
     * @deprecated Use `$css={{ justifyContent: ... }}` instead
     */
    justifyContent?: OriginalDeprecatedSprinkles['justifyContent'];

    /**
     * @deprecated Use `$css={{ flexDirection: ... }}` instead
     */
    flexDirection?: OriginalDeprecatedSprinkles['flexDirection'];

    /**
     * @deprecated Use `$css={{ gap: ... }}` instead
     */
    gap?: OriginalDeprecatedSprinkles['gap'];

    /**
     * @deprecated Use `$css={{ alignContent: ... }}` instead
     */
    alignContent?: OriginalDeprecatedSprinkles['alignContent'];

    /**
     * @deprecated Use `$css={{ padding: ... }}` instead
     */
    padding?: OriginalDeprecatedSprinkles['padding'];

    /**
     * @deprecated Use `$css={{ paddingTop: ... }}` instead
     */
    paddingTop?: OriginalDeprecatedSprinkles['paddingTop'];

    /**
     * @deprecated Use `$css={{ paddingBottom: ... }}` instead
     */
    paddingBottom?: OriginalDeprecatedSprinkles['paddingBottom'];

    /**
     * @deprecated Use `$css={{ paddingLeft: ... }}` instead
     */
    paddingLeft?: OriginalDeprecatedSprinkles['paddingLeft'];

    /**
     * @deprecated Use `$css={{ paddingRight: ... }}` instead
     */
    paddingRight?: OriginalDeprecatedSprinkles['paddingRight'];

    /**
     * @deprecated Use `$css={{ paddingX: ... }}` instead
     */
    paddingX?: OriginalDeprecatedSprinkles['paddingX'];

    /**
     * @deprecated Use `$css={{ paddingY: ... }}` instead
     */
    paddingY?: OriginalDeprecatedSprinkles['paddingY'];

    /**
     * @deprecated Use `$css={{ margin: ... }}` instead
     */
    margin?: OriginalDeprecatedSprinkles['margin'];

    /**
     * @deprecated Use `$css={{ marginTop: ... }}` instead
     */
    marginTop?: OriginalDeprecatedSprinkles['marginTop'];

    /**
     * @deprecated Use `$css={{ marginBottom: ... }}` instead
     */
    marginBottom?: OriginalDeprecatedSprinkles['marginBottom'];

    /**
     * @deprecated Use `$css={{ marginLeft: ... }}` instead
     */
    marginLeft?: OriginalDeprecatedSprinkles['marginLeft'];

    /**
     * @deprecated Use `$css={{ marginRight: ... }}` instead
     */
    marginRight?: OriginalDeprecatedSprinkles['marginRight'];

    /**
     * @deprecated Use `$css={{ marginX: ... }}` instead
     */
    marginX?: OriginalDeprecatedSprinkles['marginX'];

    /**
     * @deprecated Use `$css={{ marginY: ... }}` instead
     */
    marginY?: OriginalDeprecatedSprinkles['marginY'];

    /**
     * @deprecated Use `$css={{ width: ... }}` instead
     */
    width?: OriginalDeprecatedSprinkles['width'];

    /**
     * @deprecated Use `$css={{ height: ... }}` instead
     */
    height?: OriginalDeprecatedSprinkles['height'];

    /**
     * @deprecated Use `$css={{ minWidth: ... }}` instead
     */
    minWidth?: OriginalDeprecatedSprinkles['minWidth'];

    /**
     * @deprecated Use `$css={{ minHeight: ... }}` instead
     */
    minHeight?: OriginalDeprecatedSprinkles['minHeight'];

    /**
     * @deprecated Use `$css={{ maxWidth: ... }}` instead
     */
    maxWidth?: OriginalDeprecatedSprinkles['maxWidth'];

    /**
     * @deprecated Use `$css={{ maxHeight: ... }}` instead
     */
    maxHeight?: OriginalDeprecatedSprinkles['maxHeight'];

    /**
     * @deprecated Use `$css={{ border: ... }}` instead
     */
    border?: OriginalDeprecatedSprinkles['border'];

    /**
     * @deprecated Use `$css={{ borderColor: ... }}` instead
     */
    borderColor?: OriginalDeprecatedSprinkles['borderColor'];

    /**
     * @deprecated Use `$css={{ borderRadius: ... }}` instead
     */
    borderRadius?: OriginalDeprecatedSprinkles['borderRadius'];

    /**
     * @deprecated Use `$css={{ backgroundColor: ... }}` instead
     */
    backgroundColor?: OriginalDeprecatedSprinkles['backgroundColor'];

    /**
     * @deprecated Use `$css={{ color: ... }}` instead
     */
    color?: OriginalDeprecatedSprinkles['color'];

    /**
     * @deprecated Use `$css={{ opacity: ... }}` instead
     */
    opacity?: OriginalDeprecatedSprinkles['opacity'];

    /**
     * @deprecated Use `$css={{ pointerEvents: ... }}` instead
     */
    pointerEvents?: OriginalDeprecatedSprinkles['pointerEvents'];

    /**
     * @deprecated Use `$css={{ overflow: ... }}` instead
     */
    overflow?: OriginalDeprecatedSprinkles['overflow'];

    /**
     * @deprecated Use `$css={{ textAlign: ... }}` instead
     */
    textAlign?: OriginalDeprecatedSprinkles['textAlign'];
}
