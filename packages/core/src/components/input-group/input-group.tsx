'use client';

import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { InputGroupSize } from './input-group.css';
import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup.Root — 시각 박스(테두리·배경·focus 링)를 소유한다.
 *
 * disabled/invalid/readOnly 는 Root 자신의 시각(data-*)만 켠다 — 자식으로 전파하지 않는다.
 * 기능 차단·접근성은 개발자가 자식(TextInput/IconButton)에 직접 지정한다(설계 §3 명시적 prop).
 * Field 와 결합하면 Field 가 자식에 내리는 aria-invalid / :disabled 를 Root 가 CSS `:has` 로 잡아
 * 별도 배선 없이 테두리에 반영한다. size 는 Root 레이아웃(높이·여백·글자)만 결정하는 variant.
 * -----------------------------------------------------------------------------------------------*/

export const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRoot.Props>((props, ref) => {
    const { className, render, ...componentProps } = resolveStyles(props);

    const [{ size = 'md', disabled, invalid, readOnly }, otherProps] =
        createSplitProps<InputGroupRoot.VariantProps>()(componentProps, [
            'size',
            'disabled',
            'invalid',
            'readOnly',
        ]);

    const dataAttrs = createDataAttributes({ disabled, invalid, readOnly });

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.root, styles.sizeClass[size], className),
            ...dataAttrs,
            ...otherProps,
        },
    });
});
InputGroupRoot.displayName = 'InputGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * InputGroup.LeadingAddon / TrailingAddon — 부가요소 슬롯. 자식(icon/label/IconButton/Select)이
 * 스스로를 결정하고, 그룹 내 시각은 input-group.css.ts 의 후손 오버라이드가 전담한다.
 * -----------------------------------------------------------------------------------------------*/

export const InputGroupLeadingAddon = forwardRef<HTMLSpanElement, InputGroupLeadingAddon.Props>(
    (props, ref) => {
        const { className, render, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'span',
            props: {
                className: cn(styles.leadingAddon, className),
                ...componentProps,
            },
        });
    },
);
InputGroupLeadingAddon.displayName = 'InputGroup.LeadingAddon';

export const InputGroupTrailingAddon = forwardRef<HTMLSpanElement, InputGroupTrailingAddon.Props>(
    (props, ref) => {
        const { className, render, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'span',
            props: {
                className: cn(styles.trailingAddon, className),
                ...componentProps,
            },
        });
    },
);
InputGroupTrailingAddon.displayName = 'InputGroup.TrailingAddon';

/* -----------------------------------------------------------------------------------------------*/

export namespace InputGroupRoot {
    export type VariantProps = {
        /** Root layout size. Controls height, inline padding and font size. @default 'md' */
        size?: InputGroupSize;
        /**
         * Turns on the group's disabled visual (dims the box). Does NOT disable inner controls —
         * pass `disabled` to each control directly.
         */
        disabled?: boolean;
        /** Turns on the group's invalid visual (danger border). Does NOT set `aria-invalid` on controls. */
        invalid?: boolean;
        /** Turns on the group's read-only visual (muted background). Does NOT set `readOnly` on controls. */
        readOnly?: boolean;
    };
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State> & VariantProps;
}

export namespace InputGroupLeadingAddon {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}

export namespace InputGroupTrailingAddon {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}
