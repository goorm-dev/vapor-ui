import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PlayIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4 12.19V3.81q0-.345.237-.577a.77.77 0 0 1 .76-.203q.11.03.208.091l6.44 4.19a.8.8 0 0 1 .266.304.87.87 0 0 1 0 .77.8.8 0 0 1-.267.303l-6.44 4.19A.8.8 0 0 1 4.79 13a.77.77 0 0 1-.553-.233A.78.78 0 0 1 4 12.19"
        />
    </IconBase>
);
export default PlayIcon;
