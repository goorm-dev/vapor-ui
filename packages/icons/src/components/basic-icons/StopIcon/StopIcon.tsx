import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const StopIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4 10.667V5.333q0-.55.392-.941Q4.783 4 5.333 4h5.334q.55 0 .941.392.392.391.392.941v5.334q0 .55-.392.941a1.28 1.28 0 0 1-.941.392H5.333q-.55 0-.941-.392A1.28 1.28 0 0 1 4 10.667"
        />
    </IconBase>
);
export default StopIcon;
