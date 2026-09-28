import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PrintIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M5.334 14q-.55 0-.942-.392A1.28 1.28 0 0 1 4 12.667v-1.334H2.667q-.55 0-.942-.391A1.28 1.28 0 0 1 1.333 10V7.333q0-.849.584-1.425a1.94 1.94 0 0 1 1.416-.575h9.334q.85 0 1.425.575.575.576.575 1.425V10q0 .55-.392.942a1.28 1.28 0 0 1-.941.391H12v1.334q0 .55-.392.941a1.28 1.28 0 0 1-.941.392zM12 4.667H4V3.333q0-.55.392-.941Q4.783 2 5.333 2h5.334q.55 0 .941.392.392.391.392.941zm0 3.666a.65.65 0 0 0 .475-.191.65.65 0 0 0 .192-.475.65.65 0 0 0-.192-.475A.65.65 0 0 0 12 7a.65.65 0 0 0-.475.192.65.65 0 0 0-.191.475q0 .283.191.475a.65.65 0 0 0 .475.191m-6.666 4.334h5.333V10H5.334z"
        />
    </IconBase>
);
export default PrintIcon;
