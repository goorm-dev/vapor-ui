import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CafeIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.459 14.2a.643.643 0 0 1-.66-.65.64.64 0 0 1 .189-.467.63.63 0 0 1 .465-.19h9.145a.643.643 0 0 1 .659.65.64.64 0 0 1-.188.466.63.63 0 0 1-.465.191zm1.955-2.614a2.52 2.52 0 0 1-1.852-.763A2.52 2.52 0 0 1 2.8 8.971V3.307q0-.54.384-.923Q3.567 2 4.107 2h9.586q.54 0 .923.384.384.384.384.923v2.614q0 .54-.384.924a1.26 1.26 0 0 1-.923.384h-1.307V8.97q0 1.09-.763 1.852a2.52 2.52 0 0 1-1.852.763zm6.972-5.665h1.307V3.307h-1.307z"
        />
    </IconBase>
);
export default CafeIcon;
