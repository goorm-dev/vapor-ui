import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LikeThumbIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M14 5.333q.534 0 .934.4t.4.934V8a1.4 1.4 0 0 1-.1.5l-2 4.7q-.15.333-.5.567A1.3 1.3 0 0 1 12 14H6.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.941V5.883q0-.266.108-.508.109-.242.292-.425l3.616-3.6q.25-.234.592-.283.342-.05.658.116.317.167.459.467.14.3.058.617l-.75 3.066zM2.667 14q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941v-6q0-.55.392-.942.391-.392.942-.392t.942.392.391.942v6q0 .55-.392.941a1.28 1.28 0 0 1-.941.392"
        />
    </IconBase>
);
export default LikeThumbIcon;
