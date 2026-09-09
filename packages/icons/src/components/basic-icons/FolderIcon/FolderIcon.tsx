import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FolderIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.666 13.333q-.55 0-.941-.391A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.941-.391h3.45a1.32 1.32 0 0 1 .934.383L8 4h5.333q.55 0 .942.392.39.391.391.941V12q0 .55-.391.942a1.28 1.28 0 0 1-.942.391z"
        />
    </IconBase>
);
export default FolderIcon;
