import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PaycoIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M7.983 7.949c1.325 0 2.1-.784 2.1-1.806v-.034c0-1.176-.827-1.807-2.152-1.807H5.884V7.95zm-4.75-4.703c0-.733.586-1.312 1.325-1.312h3.597c2.874 0 4.612 1.687 4.612 4.124v.034c0 2.76-2.168 4.192-4.87 4.192H5.884v2.47c0 .734-.585 1.312-1.326 1.312a1.307 1.307 0 0 1-1.324-1.312z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default PaycoIcon;
