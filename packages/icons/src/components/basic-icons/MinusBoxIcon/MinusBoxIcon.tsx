import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MinusBoxIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M5.333 8.667h5.334a.65.65 0 0 0 .475-.192.65.65 0 0 0 .191-.475.65.65 0 0 0-.191-.475.65.65 0 0 0-.475-.192H5.333a.65.65 0 0 0-.475.192.65.65 0 0 0-.191.475q0 .283.191.475a.65.65 0 0 0 .475.192m-2 5.333q-.55 0-.941-.392A1.28 1.28 0 0 1 2 12.667V3.333q0-.55.392-.941Q2.783 2 3.333 2h9.334q.55 0 .941.392.392.391.392.941v9.334q0 .55-.392.941a1.28 1.28 0 0 1-.941.392z"
        />
    </IconBase>
);
export default MinusBoxIcon;
