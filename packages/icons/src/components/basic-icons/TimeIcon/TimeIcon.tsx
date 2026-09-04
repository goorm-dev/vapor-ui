import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TimeIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8.667 7.733v-2.4a.65.65 0 0 0-.192-.475A.65.65 0 0 0 8 4.667a.65.65 0 0 0-.475.191.65.65 0 0 0-.192.475v2.65a.7.7 0 0 0 .2.484l2.2 2.2a.63.63 0 0 0 .467.183.63.63 0 0 0 .467-.183.63.63 0 0 0 .183-.467.63.63 0 0 0-.183-.467zM8 14.667a6.5 6.5 0 0 1-2.6-.525 6.7 6.7 0 0 1-2.117-1.425A6.7 6.7 0 0 1 1.86 10.6 6.5 6.5 0 0 1 1.333 8q0-1.383.526-2.6a6.7 6.7 0 0 1 1.425-2.117q.9-.9 2.116-1.425A6.5 6.5 0 0 1 8 1.333q1.383 0 2.6.525t2.117 1.425T14.142 5.4t.525 2.6-.525 2.6a6.7 6.7 0 0 1-1.425 2.117q-.9.9-2.117 1.425a6.5 6.5 0 0 1-2.6.525"
        />
    </IconBase>
);
export default TimeIcon;
