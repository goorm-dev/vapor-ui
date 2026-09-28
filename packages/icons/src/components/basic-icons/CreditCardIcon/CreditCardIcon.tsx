import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CreditCardIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.667 13.333q-.55 0-.942-.392A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.942-.391h10.667q.55 0 .941.391.392.392.392.942v8q0 .55-.392.941a1.28 1.28 0 0 1-.941.392zm0-5.333h10.667V5.333H2.667z"
        />
    </IconBase>
);
export default CreditCardIcon;
