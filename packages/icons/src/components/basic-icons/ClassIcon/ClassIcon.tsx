import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ClassIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 11.9005C5.85 11.9005 4.1 10.1505 4.1 8.00049C4.1 5.84949 5.85 4.09949 8 4.09949C9.725 4.09949 11.175 5.23249 11.688 6.78849H10.286C9.849 5.96649 8.994 5.40049 8 5.40049C6.566 5.40049 5.4 6.56649 5.4 8.00049C5.4 9.43349 6.566 10.5995 8 10.5995C9.157 10.5995 10.129 9.83549 10.465 8.78849H11.82C11.455 10.5625 9.881 11.9005 8 11.9005ZM8 1.50049C4.41 1.50049 1.5 4.41049 1.5 8.00049C1.5 11.5895 4.41 14.5005 8 14.5005C11.59 14.5005 14.5 11.5895 14.5 8.00049C14.5 4.41049 11.59 1.50049 8 1.50049Z"
        />
    </IconBase>
);

export default ClassIcon;
