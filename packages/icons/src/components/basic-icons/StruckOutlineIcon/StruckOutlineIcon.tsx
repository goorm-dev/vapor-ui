import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const StruckOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={0.3}
            d="M8 1.5a2.149 2.149 0 0 1 .55 4.227v2.361l2.092 2.092a1 1 0 0 1 .158-.014h2.4a.95.95 0 0 1 .95.95v2.4a.95.95 0 0 1-.95.95h-2.4a.95.95 0 0 1-.95-.95v-2.4q.001-.08.014-.157L7.991 9.085 6.12 10.877q.03.115.031.24v2.4a.95.95 0 0 1-.95.95H2.8a.95.95 0 0 1-.95-.95v-2.4a.95.95 0 0 1 .95-.95h2.4q.034.001.067.004l2.183-2.09V5.726A2.149 2.149 0 0 1 8 1.5Zm2.95 11.867h2.1v-2.1h-2.1zm-8 0h2.1v-2.1h-2.1zM8 2.6a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Z"
        />
    </IconBase>
);
export default StruckOutlineIcon;
