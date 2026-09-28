import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FolderSearchIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.633 13.267q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.942v-8q0-.55.391-.941.392-.392.942-.392h3.45a1.32 1.32 0 0 1 .933.383l.95.95H13.3q.55 0 .941.392.393.391.392.942v1.997a4.2 4.2 0 1 0-5.864 6.003z"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M11.361 13.045c.472.036.926-.04 1.337-.204l2.196 2.861a.6.6 0 0 0 .952-.73l-2.143-2.792a3 3 0 1 0-2.342.866m.09-1.196a1.8 1.8 0 1 0 .27-3.59 1.8 1.8 0 0 0-.27 3.59"
            clipRule="evenodd"
        />
    </IconBase>
);
export default FolderSearchIcon;
