import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FoldIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M9.567 13.85 6 12.6l-3.1 1.2a.6.6 0 0 1-.325.042.8.8 0 0 1-.292-.109.6.6 0 0 1-.208-.225.7.7 0 0 1-.075-.325v-9.35q0-.216.125-.383a.75.75 0 0 1 .342-.25l3.1-1.05q.1-.033.208-.05a1.5 1.5 0 0 1 .658.05L10 3.4l3.1-1.2a.6.6 0 0 1 .325-.042.8.8 0 0 1 .292.109.6.6 0 0 1 .208.225q.075.14.075.325v9.35a.62.62 0 0 1-.125.383.75.75 0 0 1-.342.25l-3.1 1.05a1.3 1.3 0 0 1-.208.05 1.5 1.5 0 0 1-.658-.05m-.234-1.483v-7.8l-2.666-.934v7.8z"
        />
    </IconBase>
);
export default FoldIcon;
