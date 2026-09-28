import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SideNavIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.333 14q-.55 0-.941-.392A1.28 1.28 0 0 1 2 12.667V3.333q0-.55.392-.941Q2.783 2 3.333 2h9.334q.55 0 .941.392.392.391.392.941v9.334q0 .55-.392.941a1.28 1.28 0 0 1-.941.392zm3.334-1.333h6V3.333h-6z"
        />
    </IconBase>
);
export default SideNavIcon;
