import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ObjectIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M14.5 11.14a3.36 3.36 0 1 0-6.719 0 3.36 3.36 0 0 0 6.719 0m-3.75-4.32v-.57a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h.569a4.34 4.34 0 0 1 3.931-3.93M4.25 8H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.25H5.25a1 1 0 0 0-1 1z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default ObjectIcon;
