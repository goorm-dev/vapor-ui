import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ForkIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M15 4a2 2 0 0 1-3.908.6H8.6v6.8h2.492a2 2 0 1 1 0 1.2H8a.6.6 0 0 1-.6-.6V8.6H5a1 1 0 0 1-.09-.007 2 2 0 1 1 0-1.186A1 1 0 0 1 5 7.4h2.4V4a.6.6 0 0 1 .6-.6h3.092A2 2 0 0 1 15 4"
            clipRule="evenodd"
        />
    </IconBase>
);
export default ForkIcon;
