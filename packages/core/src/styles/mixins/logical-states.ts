const NOT_DISABLED = ':not([data-disabled])';
const NOT_READONLY = ':not([data-readonly])';

export const checked = (selector = '&[data-checked]') => selector;

export const pressed = (selector = '&[data-pressed]') => selector;

export const disabled = (selector = '&[data-disabled]') => selector;

export const current = (selector = '&[data-current]') => `${selector}${NOT_DISABLED}`;

export const readonly = (selector = '&[data-readonly]') => `${selector}${NOT_DISABLED}`;

export const invalid = (selector = '&[data-invalid]') =>
    `${selector}${NOT_READONLY}${NOT_DISABLED}`;

export const when = {
    checked,
    pressed,
    current,
    disabled,
    invalid,
    readonly,
};
