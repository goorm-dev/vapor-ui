const NOT_DISABLED = ':not([data-disabled])';
const NOT_READONLY = ':not([data-readonly])';

export const disabled = (selector = '&[data-disabled]') => selector;

export const readonly = (selector = '&[data-readonly]') => `${selector}${NOT_DISABLED}`;

export const invalid = (selector = '&[data-invalid]') =>
    `${selector}${NOT_READONLY}${NOT_DISABLED}`;

export const when = {
    disabled,
    invalid,
    readonly,
};
