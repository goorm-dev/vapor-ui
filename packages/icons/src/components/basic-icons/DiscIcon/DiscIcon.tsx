import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DiscIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
        />
    </IconBase>
);
export default DiscIcon;
