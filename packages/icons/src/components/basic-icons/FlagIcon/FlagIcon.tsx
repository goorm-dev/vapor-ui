import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FlagIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4.25 8.857v4.5q0 .273-.179.458A.6.6 0 0 1 3.63 14a.627.627 0 0 1-.63-.643V2.643q0-.273.18-.458A.6.6 0 0 1 3.625 2h4.718a.615.615 0 0 1 .612.482l.295 1.232h3.125q.265 0 .445.185t.18.458V9.93q0 .272-.18.458a.6.6 0 0 1-.445.184H9.319a.6.6 0 0 1-.39-.135.6.6 0 0 1-.217-.347l-.295-1.232z"
        />
    </IconBase>
);
export default FlagIcon;
