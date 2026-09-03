import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PlansIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M1.333 10V6q0-.55.392-.941.391-.393.941-.392.55 0 .942.392Q4 5.449 4 6v4q0 .55-.392.942a1.28 1.28 0 0 1-.942.392q-.55 0-.941-.392A1.28 1.28 0 0 1 1.333 10M6 12.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941V4.667q0-.55.392-.942T6 3.333h4q.55 0 .941.392.392.391.392.942v6.667q0 .55-.392.941a1.28 1.28 0 0 1-.941.392zM12 10V6q0-.55.391-.941.391-.393.942-.392.55 0 .942.392.39.39.391.941v4q0 .55-.391.942a1.28 1.28 0 0 1-.942.392q-.55 0-.942-.392A1.28 1.28 0 0 1 12 10"
        />
    </IconBase>
);
export default PlansIcon;
