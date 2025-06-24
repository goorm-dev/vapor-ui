import type { RecipeVariants, RuntimeFn, recipe } from '@vanilla-extract/recipes';

type VariantGroups = NonNullable<Parameters<typeof recipe>[0]['variants']>;
type MergeVariants<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in T extends any ? keyof T : never]?: T extends { [P in K]?: infer V } ? V : never;
};

export type MergeRecipeVariants<T extends RuntimeFn<VariantGroups>> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MergeVariants<T extends any ? RecipeVariants<T> : never>;
