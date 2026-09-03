import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DislikeThumbIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2 10.667a1.28 1.28 0 0 1-.933-.4 1.28 1.28 0 0 1-.4-.934V8a1.4 1.4 0 0 1 .1-.5l2-4.7q.15-.333.5-.567T4 2h5.333q.55 0 .942.392.39.391.391.941v6.784q0 .266-.108.508-.109.242-.291.425l-3.617 3.6q-.25.234-.592.283a1.05 1.05 0 0 1-.658-.116 1 1 0 0 1-.459-.467.88.88 0 0 1-.058-.617l.75-3.066zM13.333 2q.55 0 .942.392.39.391.391.941v6q0 .55-.391.942a1.28 1.28 0 0 1-.942.392q-.55 0-.941-.392A1.28 1.28 0 0 1 12 9.333v-6q0-.55.392-.941.391-.392.941-.392"
        />
    </IconBase>
);
export default DislikeThumbIcon;
