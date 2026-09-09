import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NaverIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M9.8 2.738v5.308L6.212 2.738H2.333v10.524H6.2V7.95l3.589 5.312h3.878V2.738z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default NaverIcon;
