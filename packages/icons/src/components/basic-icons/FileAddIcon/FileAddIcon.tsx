import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FileAddIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M1.5 3.45a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v9.05a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zm11.7.3V5H2.8V3.75zM9.7 9.3a.7.7 0 1 0 0-1.4h-1v-1a.7.7 0 1 0-1.4 0v1h-1a.7.7 0 1 0 0 1.4h1v1a.7.7 0 1 0 1.4 0v-1z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default FileAddIcon;
