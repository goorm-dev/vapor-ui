/**
 * ARIA attributes whose absence already means `false`, so omitting the key loses no information.
 *
 * Do not widen this to `aria-checked` or `aria-expanded`, where `false` is a meaningful value that
 * must be emitted.
 */
type OmittableAriaKey = 'invalid' | 'required';

type ReturnByValue<K extends OmittableAriaKey, V> = V extends true ? Record<`aria-${K}`, true> : {};

/**
 * Emits a boolean ARIA attribute only when it is `true`, omitting the key entirely otherwise.
 *
 * Base UI merges as `[internal, validation.getValidationProps, elementProps]`, so the props we pass
 * win over the `aria-invalid` that `Field` computed from validation. Worse, its merger overwrites on
 * key presence rather than value, so even `aria-invalid={undefined}` erases a computed `true`.
 * Omitting the key is what lets the two sources compose by OR.
 *
 * Base UI 1.6.0 reverses the merge order so validation always wins. Conditional emission stays
 * correct there, but the precedence changes — re-verify on upgrade.
 */
export function createAriaAttribute<K extends OmittableAriaKey, V extends boolean | undefined>(
    key: K,
    value: V,
): ReturnByValue<K, V> {
    if (value !== true) {
        return {} as ReturnByValue<K, V>;
    }

    return { [`aria-${key}`]: true } as ReturnByValue<K, V>;
}
