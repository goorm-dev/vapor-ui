import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const WarningIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M1.817 14a.65.65 0 0 1-.567-.333.7.7 0 0 1-.092-.325A.6.6 0 0 1 1.25 13L7.417 2.333a.66.66 0 0 1 .258-.25A.7.7 0 0 1 8 2a.7.7 0 0 1 .325.083.66.66 0 0 1 .258.25L14.75 13a.6.6 0 0 1 .092.342.7.7 0 0 1-.092.325.65.65 0 0 1-.567.333zM8 12a.65.65 0 0 0 .475-.192.65.65 0 0 0 .192-.475.65.65 0 0 0-.192-.475.65.65 0 0 0-.475-.191.65.65 0 0 0-.475.191.65.65 0 0 0-.192.475q0 .285.192.475A.65.65 0 0 0 8 12m0-2a.65.65 0 0 0 .475-.192.65.65 0 0 0 .192-.475v-2a.65.65 0 0 0-.192-.475A.65.65 0 0 0 8 6.667a.65.65 0 0 0-.475.191.65.65 0 0 0-.192.475v2q0 .285.192.475A.65.65 0 0 0 8 10"
        />
    </IconBase>
);
export default WarningIcon;
