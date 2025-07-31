/**
 * Generates all possible combinations from multiple arrays using Cartesian product.
 *
 * @param arrays - Arrays to combine (supports readonly arrays)
 * @returns Array of all possible combinations
 *
 * @example
 * ```typescript
 * const colors = ['red', 'blue'] as const;
 * const sizes = ['sm', 'lg'] as const;
 * getCartesianProduct(colors, sizes);
 * // Returns: [['red', 'sm'], ['red', 'lg'], ['blue', 'sm'], ['blue', 'lg']]
 *
 * // Usage in component rendering
 * const combinations = getCartesianProduct(shapes, sizes, colors);
 * combinations.map(([shape, size, color]) => <Component {...props} />)
 * ```
 */
function getCartesianProduct<T extends readonly (readonly unknown[])[]>(
    ...arrays: T
): Array<{ [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }> {
    return arrays.reduce<unknown[][]>((acc, curr) => {
        if (acc.length === 0) {
            return curr.map((item) => [item]);
        }
        return acc.flatMap((combination) => curr.map((item) => [...combination, item]));
    }, []) as Array<{ [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }>;
}

export { getCartesianProduct };
