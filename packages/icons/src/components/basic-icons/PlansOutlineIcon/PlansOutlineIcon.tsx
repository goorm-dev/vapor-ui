import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PlansOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M1 9.667v-4q0-.55.392-.942.391-.392.941-.392t.942.392.392.942v4q0 .55-.392.941a1.28 1.28 0 0 1-.942.392q-.55 0-.941-.392A1.28 1.28 0 0 1 1 9.667m4.667 2.666q-.55 0-.942-.391A1.28 1.28 0 0 1 4.333 11V4.333q0-.55.392-.941Q5.116 3 5.667 3h4q.55 0 .941.392.392.391.392.941V11q0 .55-.392.942a1.28 1.28 0 0 1-.941.391zm6-2.666v-4q0-.55.391-.942T13 4.333t.942.392.391.942v4q0 .55-.391.941A1.28 1.28 0 0 1 13 11q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.941m-6 1.333h4V4.333h-4z"
        />
    </IconBase>
);
export default PlansOutlineIcon;
