import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PlusBoxOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.333 8.667v2q0 .283.192.475a.65.65 0 0 0 .475.191.65.65 0 0 0 .475-.191.65.65 0 0 0 .192-.475v-2h2a.65.65 0 0 0 .475-.192.65.65 0 0 0 .191-.475.65.65 0 0 0-.191-.475.65.65 0 0 0-.475-.192h-2v-2a.65.65 0 0 0-.192-.475A.65.65 0 0 0 8 4.667a.65.65 0 0 0-.475.191.65.65 0 0 0-.192.475v2h-2a.65.65 0 0 0-.475.192.65.65 0 0 0-.191.475q0 .283.191.475a.65.65 0 0 0 .475.192zm-4 5.333q-.55 0-.941-.392A1.28 1.28 0 0 1 2 12.667V3.333q0-.55.392-.941Q2.783 2 3.333 2h9.334q.55 0 .941.392.392.391.392.941v9.334q0 .55-.392.941a1.28 1.28 0 0 1-.941.392zm0-1.333h9.334V3.333H3.333z"
        />
    </IconBase>
);
export default PlusBoxOutlineIcon;
