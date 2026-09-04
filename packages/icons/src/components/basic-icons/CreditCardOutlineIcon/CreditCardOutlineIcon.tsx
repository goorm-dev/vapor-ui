import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CreditCardOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M14.667 4v8q0 .55-.392.942a1.28 1.28 0 0 1-.941.391H2.667q-.55 0-.942-.391A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.942-.391h10.667q.55 0 .941.391.392.392.392.942m-12 1.333h10.667V4H2.667zm0 2.667v4h10.667V8z"
        />
    </IconBase>
);
export default CreditCardOutlineIcon;
