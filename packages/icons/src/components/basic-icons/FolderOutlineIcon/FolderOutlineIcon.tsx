import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FolderOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.667 13.333q-.55 0-.942-.391A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.942-.391h3.45a1.32 1.32 0 0 1 .933.383L8 4h5.334q.55 0 .941.392.392.391.392.941V12q0 .55-.392.942a1.28 1.28 0 0 1-.941.391zm0-1.333h10.667V5.333H7.45L6.117 4h-3.45z"
        />
    </IconBase>
);
export default FolderOutlineIcon;
