import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const OpenFolderIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.666 13.333q-.55 0-.941-.391A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.941-.391h3.45a1.32 1.32 0 0 1 .934.383L8 4h6q.283 0 .475.192a.65.65 0 0 1 .191.475.65.65 0 0 1-.191.475.65.65 0 0 1-.475.191H5.233q-1.033 0-1.8.65a2.07 2.07 0 0 0-.767 1.65V12l1.317-4.383a1.3 1.3 0 0 1 .492-.692q.358-.258.791-.258h8.6q.684 0 1.075.541.391.543.209 1.175l-1.2 4a1.3 1.3 0 0 1-.492.692 1.32 1.32 0 0 1-.792.258z"
        />
    </IconBase>
);
export default OpenFolderIcon;
