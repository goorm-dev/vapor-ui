import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MemoryIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2.005 2C1.45 2 1 2.452 1 3.007c0 .552.448 1.002 1 1.002v2a1 1 0 0 0-1 1V12.8A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V7.008a1 1 0 0 0-.999-.999v-2c.552 0 .999-.45.999-1.002C15 2.452 14.55 2 13.995 2zm8.621 6.74a.75.75 0 0 0 1.499 0V4.759a.75.75 0 0 0-1.499 0zm-3.375 0a.75.75 0 1 0 1.499 0V4.759a.75.75 0 1 0-1.499 0zm-3.375 0a.75.75 0 1 0 1.499 0V4.759a.75.75 0 1 0-1.499 0zm6.75 3.509a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0m-3.375 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0m-3.375 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0"
            clipRule="evenodd"
        />
    </IconBase>
);
export default MemoryIcon;
