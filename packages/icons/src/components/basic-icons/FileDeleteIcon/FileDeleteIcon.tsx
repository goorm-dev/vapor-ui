import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FileDeleteIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M1.5 3.45a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v9.05a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zm11.7.3V5H2.8V3.75zM6.25 7.9h3.5a.65.65 0 1 1 0 1.3h-3.5a.65.65 0 1 1 0-1.3"
            clipRule="evenodd"
        />
    </IconBase>
);
export default FileDeleteIcon;
