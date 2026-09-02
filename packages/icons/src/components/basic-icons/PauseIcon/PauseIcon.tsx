import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PauseIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M10.667 12.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941V4.667q0-.55.392-.942.391-.392.942-.392t.941.392q.392.391.392.942v6.667q0 .55-.392.941a1.28 1.28 0 0 1-.941.392m-5.334 0q-.55 0-.941-.392A1.28 1.28 0 0 1 4 11.334V4.667q0-.55.392-.942.391-.392.941-.392t.942.392.392.942v6.667q0 .55-.392.941a1.28 1.28 0 0 1-.942.392"
        />
    </IconBase>
);
export default PauseIcon;
