import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SendIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.933 12.95a.66.66 0 0 1-.633-.058.62.62 0 0 1-.3-.559v-3L7.333 8 2 6.667v-3q0-.367.3-.559a.66.66 0 0 1 .633-.058L13.2 7.383q.417.184.417.617 0 .434-.417.617z"
        />
    </IconBase>
);
export default SendIcon;
