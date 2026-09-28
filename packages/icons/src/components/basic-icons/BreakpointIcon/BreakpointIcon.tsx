import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BreakpointIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0"
            clipRule="evenodd"
        />
    </IconBase>
);
export default BreakpointIcon;
