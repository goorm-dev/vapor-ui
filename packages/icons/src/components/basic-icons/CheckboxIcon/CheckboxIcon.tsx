import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CheckboxIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.067 8.933 5.633 7.5a.63.63 0 0 0-.466-.183.63.63 0 0 0-.467.183.63.63 0 0 0-.183.467q0 .283.183.466l1.9 1.9a.64.64 0 0 0 .467.2.64.64 0 0 0 .466-.2L11.3 6.567a.63.63 0 0 0 .183-.467.63.63 0 0 0-.183-.467.63.63 0 0 0-.467-.183.63.63 0 0 0-.466.183zM3.333 14q-.55 0-.941-.392A1.28 1.28 0 0 1 2 12.667V3.333q0-.55.392-.941Q2.783 2 3.333 2h9.334q.55 0 .941.392.392.391.392.941v9.334q0 .55-.392.941a1.28 1.28 0 0 1-.941.392z"
        />
    </IconBase>
);
export default CheckboxIcon;
