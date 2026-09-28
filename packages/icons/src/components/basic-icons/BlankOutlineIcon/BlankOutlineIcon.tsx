import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BlankOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3.986 7.02a.6.6 0 0 1 .6.6v1.923h6.828V7.619a.6.6 0 1 1 1.2 0v2.524a.6.6 0 0 1-.6.6H3.986a.6.6 0 0 1-.6-.6V7.619a.6.6 0 0 1 .6-.6"
            clipRule="evenodd"
        />
    </IconBase>
);
export default BlankOutlineIcon;
