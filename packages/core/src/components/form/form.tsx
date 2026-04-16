import { forwardRef } from 'react';

import { Form as BaseForm } from '@base-ui/react/form';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

export const Form = forwardRef<HTMLFormElement, Form.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseForm ref={ref} {...componentProps} />;
});

export namespace Form {
    export type State = BaseForm.State;
    export type Props = VaporUIComponentProps<typeof BaseForm, State>;

    export type Actions = BaseForm.Actions;
    export type SubmitEventDetails = BaseForm.SubmitEventDetails;
    export type ValidationMode = BaseForm.ValidationMode;
    export type Values = BaseForm.Values;
}
