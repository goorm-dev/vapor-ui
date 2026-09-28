import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DividerOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            stroke="currentColor"
            strokeWidth={1.2}
            d="M11.9 10.1v3.3H4.1v-3.3zm-8.483-2h9.333q.037.002.036.004l.003.002.012.01.01.011.002.004q.002 0 .003.036a.1.1 0 0 1-.004.035l-.002.004-.01.012-.01.009-.004.002q.002.002-.036.004H3.417a.1.1 0 0 1-.036-.004l-.004-.002-.01-.01-.01-.011-.003-.004c0-.002-.004-.012-.004-.035 0-.025.004-.035.004-.036l.002-.004.01-.01.01-.01.005-.003s.01-.004.036-.004ZM11.9 2.6v3.3H4.1V2.6z"
        />
    </IconBase>
);
export default DividerOutlineIcon;
