import type { StyleRule } from '@vanilla-extract/css';
import { style } from '@vanilla-extract/css';
import type { RuntimeFn } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import type { layerName } from '../layers.css';
import { layers } from '../layers.css';

type LayerName = keyof typeof layerName;
type LayerRecipeStyleRule = StyleRule | string | Array<LayerRecipeStyleRule>;
type LayerVariantGroups = Record<string, Record<string, LayerRecipeStyleRule>>;
type BooleanMap<T> = T extends 'true' | 'false' ? boolean : T;

type LayerVariantSelection<Variants extends LayerVariantGroups> = {
    [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]> | undefined;
};

type LayerCompoundVariant<Variants extends LayerVariantGroups> = {
    variants: LayerVariantSelection<Variants>;
    style: LayerRecipeStyleRule;
};

type LayerRecipeOptions<Variants extends LayerVariantGroups> = {
    base?: LayerRecipeStyleRule;
    variants?: Variants;
    defaultVariants?: LayerVariantSelection<Variants>;
    compoundVariants?: Array<LayerCompoundVariant<Variants>>;
};

type RecipeRuntimeVariants<Variants extends LayerVariantGroups> = {
    [VariantGroup in keyof Variants]: {
        [Variant in keyof Variants[VariantGroup]]: string;
    };
};

const wrapLayerRule = (layer: LayerName, rule: StyleRule): StyleRule => {
    if ('@layer' in rule) {
        return rule;
    }

    return {
        '@layer': { [layers[layer]]: rule },
    };
};

const normalizeStyleEntry = (layer: LayerName, rule: LayerRecipeStyleRule): StyleRule | string => {
    if (typeof rule === 'string') {
        return rule;
    }

    if (Array.isArray(rule)) {
        return normalizeLayerRecipeStyle(layer, rule);
    }

    return wrapLayerRule(layer, rule);
};

const normalizeLayerRecipeStyle = (
    layer: LayerName,
    rule: LayerRecipeStyleRule,
    debugId?: string,
): string => {
    if (typeof rule === 'string') {
        return style([rule], debugId);
    }

    if (Array.isArray(rule)) {
        const merged = rule.map((entry) => normalizeStyleEntry(layer, entry));

        return style(merged, debugId);
    }

    return style(wrapLayerRule(layer, rule), debugId);
};

const normalizeVariants = <Variants extends LayerVariantGroups>(
    layer: LayerName,
    variants: Variants,
): RecipeRuntimeVariants<Variants> => {
    const normalizedEntries = Object.entries(variants).map(([variantName, variantOptions]) => {
        const normalizedOptions = Object.entries(variantOptions).map(
            ([variantKey, variantRule]) => [
                variantKey,
                normalizeLayerRecipeStyle(layer, variantRule),
            ],
        );

        return [variantName, Object.fromEntries(normalizedOptions)];
    });

    return Object.fromEntries(normalizedEntries) as RecipeRuntimeVariants<Variants>;
};

export const layerStyle = (
    layer: LayerName, // 'theme' | 'reset' ...
    rule: LayerRecipeStyleRule,
    debugId?: string,
) => normalizeLayerRecipeStyle(layer, rule, debugId);

export const layerRecipe = <Variants extends LayerVariantGroups>(
    layer: LayerName,
    options: LayerRecipeOptions<Variants>,
    debugId?: string,
): RuntimeFn<RecipeRuntimeVariants<Variants>> => {
    const normalizedOptions = {
        ...options,
        base: options.base ? normalizeLayerRecipeStyle(layer, options.base) : undefined,
        variants: options.variants ? normalizeVariants(layer, options.variants) : undefined,
        compoundVariants: options.compoundVariants?.map((compoundVariant) => ({
            variants: compoundVariant.variants,
            style: normalizeLayerRecipeStyle(layer, compoundVariant.style),
        })),
    };

    return recipe(normalizedOptions as Parameters<typeof recipe>[0], debugId) as RuntimeFn<
        RecipeRuntimeVariants<Variants>
    >;
};

export const componentStyle = (rule: LayerRecipeStyleRule, debugId?: string) =>
    layerStyle('components', rule, debugId);

export const componentRecipe = <Variants extends LayerVariantGroups>(
    options: LayerRecipeOptions<Variants>,
    debugId?: string,
) => layerRecipe('components', options, debugId);
