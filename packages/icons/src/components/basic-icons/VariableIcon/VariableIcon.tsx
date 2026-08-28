import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const VariableIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.486 11.6505H7.514L4.478 4.34949H5.886L8 9.43349L10.115 4.34949H11.523L8.486 11.6505ZM8 1.50049C4.41 1.50049 1.5 4.41049 1.5 8.00049C1.5 11.5895 4.41 14.5005 8 14.5005C11.59 14.5005 14.5 11.5895 14.5 8.00049C14.5 4.41049 11.59 1.50049 8 1.50049Z"
        />
    </IconBase>
);

export default VariableIcon;
