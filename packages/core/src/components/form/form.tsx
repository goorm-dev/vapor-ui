import { Form as BaseForm } from '@base-ui-components/react';

import type { VComponentProps } from '~/utils/types';

/**
 * HTML 폼 요소 컴포넌트
 */
export const Form = BaseForm;

export namespace Form {
    type FormPrimitiveProps = VComponentProps<typeof BaseForm>;

    export interface Props extends FormPrimitiveProps {}
}
