import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LockIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4 14.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.942V6.667q0-.55.391-.942.392-.392.942-.392h.667V4q0-1.383.974-2.358A3.2 3.2 0 0 1 8 .667q1.383 0 2.358.975T11.333 4v1.333H12q.55 0 .941.392.393.391.392.942v6.666q0 .55-.392.942a1.28 1.28 0 0 1-.941.392zm4-3.334q.55 0 .941-.391.393-.391.392-.942 0-.55-.392-.942A1.28 1.28 0 0 0 8 8.667q-.55 0-.942.391a1.28 1.28 0 0 0-.391.942q0 .55.391.942.391.39.942.391m-2-6h4V4q0-.833-.584-1.417A1.93 1.93 0 0 0 8 2q-.834 0-1.417.583A1.93 1.93 0 0 0 6 4z"
        />
    </IconBase>
);
export default LockIcon;
