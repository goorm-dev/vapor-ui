import { Form as BaseForm } from '@base-ui/react';

import type { VComponentProps } from '~/utils/types';

export const Form = BaseForm;

export namespace Form {
    type FormPrimitiveProps = VComponentProps<typeof BaseForm>;

    export interface Props extends FormPrimitiveProps {}
}
