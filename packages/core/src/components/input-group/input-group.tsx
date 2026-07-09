'use client';

import { forwardRef, useMemo } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { RootVariants } from './input-group.css';
import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup.Root — 테두리·배경·focus 링을 그리는 시각 박스.
 *
 * disabled/invalid/readOnly 는 Root 시각만 켜고 자식에는 전파하지 않는다. 기능 차단은 개발자가
 * 자식에 직접 지정한다. Field 와 함께 쓰면 자식의 aria-invalid·:disabled 를 `:has` 로 잡아 테두리에 반영한다.
 * -----------------------------------------------------------------------------------------------*/

export const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRoot.Props>((props, ref) => {
    const { className, render, ...componentProps } = resolveStyles(props);

    const [{ size = 'md', disabled = false, invalid = false, readOnly = false }, otherProps] =
        createSplitProps<InputGroupRoot.VariantProps>()(componentProps, [
            'size',
            'disabled',
            'invalid',
            'readOnly',
        ]);

    const dataAttrs = createDataAttributes({ disabled, invalid, readOnly });

    const state: InputGroupRoot.State = useMemo(
        () => ({ disabled, invalid, readOnly }),
        [disabled, invalid, readOnly],
    );

    return useRenderElement({
        ref,
        state,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.root({ size }), className),
            ...dataAttrs,
            ...otherProps,
        },
    });
});
InputGroupRoot.displayName = 'InputGroup.Root';

// 부가요소 슬롯. 그룹 내부 시각은 input-group.css.ts 의 후손 오버라이드가 전담한다.
const createAddon = (displayName: string) => {
    const Addon = forwardRef<HTMLSpanElement, InputGroupAddon.Props>((props, ref) => {
        const { className, render, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'span',
            props: {
                className: cn(styles.addon, className),
                ...componentProps,
            },
        });
    });
    Addon.displayName = displayName;
    return Addon;
};

export const InputGroupLeadingAddon = createAddon('InputGroup.LeadingAddon');
export const InputGroupTrailingAddon = createAddon('InputGroup.TrailingAddon');

/* -----------------------------------------------------------------------------------------------*/

export namespace InputGroupRoot {
    export type VariantProps = RootVariants;
    export interface State {
        [key: string]: unknown;
        /** Whether the group shows its disabled visual. */
        disabled: boolean;
        /** Whether the group shows its invalid visual. */
        invalid: boolean;
        /** Whether the group shows its read-only visual. */
        readOnly: boolean;
    }
    export interface Props extends VaporUIComponentProps<'div', State>, VariantProps {}
}

export namespace InputGroupAddon {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}
