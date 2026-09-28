import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LikeThumbOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M14 5.333q.534 0 .934.4t.4.934V8q0 .117-.034.25a8 8 0 0 1-.067.25l-2 4.7q-.15.333-.5.567A1.3 1.3 0 0 1 12 14H4.667V5.333l4-3.966a1 1 0 0 1 .591-.292q.342-.042.659.125.316.167.466.467t.067.616l-.75 3.05zM6 5.9v6.767h6L14 8V6.667H8L8.9 3zM2.667 14q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941v-6q0-.55.392-.942.391-.392.942-.392h2v1.334h-2v6h2V14z"
        />
    </IconBase>
);
export default LikeThumbOutlineIcon;
