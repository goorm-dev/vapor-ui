import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const JiraIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M15.332 0h-7.71a3.48 3.48 0 0 0 3.476 3.476h1.426v1.36A3.48 3.48 0 0 0 16 8.312V.669A.657.657 0 0 0 15.332 0"
        />
        <path
            fill="currentColor"
            d="M11.521 3.833h-7.71a3.48 3.48 0 0 0 3.476 3.476h1.426V8.69a3.48 3.48 0 0 0 3.477 3.477V4.5a.67.67 0 0 0-.669-.668"
        />
        <path
            fill="currentColor"
            d="M7.71 7.688H0a3.48 3.48 0 0 0 3.476 3.476h1.427v1.36A3.48 3.48 0 0 0 8.379 16V8.356a.67.67 0 0 0-.669-.668"
        />
    </IconBase>
);
export default JiraIcon;
